/**
 * Conversation engine (PROMPT-19) — the ONE canonical inbound path that
 * turns an incoming WhatsApp-style customer message into a safe assistant
 * response:
 *
 *   inbound message → resolve business (by receiving WhatsApp number)
 *   → find-or-create customer (`upsertByPhone`) → find-or-create
 *   conversation → persist the CUSTOMER message → load the conversation's
 *   business context → typed AI turn → safe reply OR NEED_HUMAN → persist
 *   the assistant reply → deliver through the transport boundary.
 *
 * Product rules encoded here:
 * - The payload NEVER controls authority: no `businessId`, role,
 *   customer/conversation ids, assignment, or tenant identity can enter
 *   through the inbound contract — the Business is resolved server-side
 *   from the receiving WhatsApp number via the established
 *   `BusinessRepository.findByWhatsappNumber` mapping.
 * - The AI runs ONLY on unassigned AI_ACTIVE threads. Every other state
 *   (NEED_HUMAN / BOOKED / INCOMPLETE, or a thread owned by staff) keeps
 *   its assignment and routes the message to staff attention — the
 *   assistant never interjects into a human-owned conversation.
 * - AI output is never the source of truth: it is validated before
 *   persistence, and booking intents hand off to staff, who complete
 *   bookings through the EXISTING canonical booking flow. The engine
 *   never creates appointments.
 * - All writes go through `ConversationRepository.addMessage` — the
 *   single message write path (immutable messages, transactional
 *   `lastMessageAt` advance). No Prisma access outside repositories.
 *
 * Repository/collaborator deps are injectable (defaulting to the app
 * singletons) so the real wiring is verifiable without a live database —
 * the established service pattern.
 */

import {
  inboundMessageSchema,
  type InboundMessageInput,
} from "@/features/conversations/schemas/conversation-schema";
import type {
  AiTurnResult,
  ConversationAi,
  ConversationIntent,
} from "@/features/conversations/server/conversation-ai";
import { deterministicConversationAi } from "@/features/conversations/server/conversation-ai";
import type { MessageTransport } from "@/features/conversations/server/conversation-transport";
import { offlineMessageTransport } from "@/features/conversations/server/conversation-transport";
import { faqEntrySchema } from "@/lib/validation";
import type {
  BusinessRepository,
  ConversationRepository,
  CustomerRepository,
  ServiceRepository,
} from "@/server/repositories";
import {
  businessRepository,
  conversationRepository,
  customerRepository,
  serviceRepository,
} from "@/server/repositories";
import type { Conversation, ConversationStatus } from "@/types/domain";

import { z } from "zod";

/** Bound on recent messages fed to the assistant (context discipline). */
const RECENT_MESSAGE_LIMIT = 20;

/** Validation the engine itself applies to assistant-generated content. */
const assistantContentSchema = z
  .string()
  .trim()
  .min(1, "الرد فارغ")
  .max(4096, "الرد طويل جداً");

/** Stored knowledge contract reuse (same shape the knowledge feature manages). */
const storedFaqsSchema = z.array(faqEntrySchema);

export type ConversationEngineDeps = {
  businessRepository: Pick<BusinessRepository, "findByWhatsappNumber">;
  customerRepository: Pick<
    CustomerRepository,
    "upsertByPhone" | "touchConversation"
  >;
  conversationRepository: Pick<
    ConversationRepository,
    | "findLatestByCustomer"
    | "findById"
    | "create"
    | "addMessage"
    | "getMessages"
    | "update"
    | "updateWorkflow"
  >;
  serviceRepository: Pick<ServiceRepository, "listByBusiness">;
  ai: ConversationAi;
  transport: MessageTransport;
};

/** Production dependencies (app singletons + offline boundaries). */
export const defaultConversationEngineDeps: ConversationEngineDeps = {
  businessRepository,
  customerRepository,
  conversationRepository,
  serviceRepository,
  ai: deterministicConversationAi,
  transport: offlineMessageTransport,
};

// ─── Typed results ───────────────────────────────────────────────────────────

export type InboundFailureCode =
  | "VALIDATION"
  | "BUSINESS_NOT_FOUND"
  | "BUSINESS_INACTIVE"
  | "PERSISTENCE_FAILED";

export type InboundFailure = {
  ok: false;
  code: InboundFailureCode;
  message: string;
};

/** How the engine answered the inbound message. */
export type AssistantAction =
  /** The assistant replied autonomously (thread stays AI_ACTIVE). */
  | "AI_REPLY"
  /** The assistant handed the thread to staff (NEED_HUMAN). */
  | "AI_HANDOFF"
  /** The thread is not AI-eligible; the message went to staff attention. */
  | "DEFERRED_TO_STAFF";

export type InboundSuccess = {
  ok: true;
  conversationId: string;
  customerId: string;
  /** The persisted CUSTOMER message id. */
  customerMessageId: string;
  assistantAction: AssistantAction;
  /** Classified intent when the AI ran; null when deferred to staff. */
  intent: ConversationIntent | null;
  conversationStatus: ConversationStatus;
  /** Assistant provider that answered (honest reporting). */
  assistantProvider: string;
  /** Best-effort outbound delivery report (null when nothing was sent). */
  delivery: { provider: string; delivered: boolean; error?: string } | null;
};

export type InboundResult = InboundFailure | InboundSuccess;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALIDATION_MESSAGE = "بيانات الرسالة الواردة غير صالحة";
const BUSINESS_NOT_FOUND_MESSAGE = "تعذر تحديد المنشأة المستقبلة للرسالة";
const BUSINESS_INACTIVE_MESSAGE = "المنشأة غير مفعّلة حالياً";
const PERSISTENCE_FAILED_MESSAGE = "تعذر حفظ الرسالة الآن";

/** Canonical phone form for the number-mapping lookup (digits + leading +). */
function canonicalPhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

/** Placeholder identity for a brand-new inbound WhatsApp contact. */
function inboundCustomerName(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `عميل ${digits.slice(-4) || phone}`;
}

/** Malformed stored FAQ JSON degrades to "no knowledge" — never crashes. */
function safeFaqs(raw: unknown): Array<{ question: string; answer: string }> {
  const parsed = storedFaqsSchema.safeParse(raw ?? []);
  return parsed.success ? parsed.data : [];
}

// ─── The engine ──────────────────────────────────────────────────────────────

/**
 * Process ONE inbound WhatsApp-style message end-to-end. Idempotent at
 * the resolution level (customer upsert + latest-conversation reuse);
 * the message itself is appended (provider-level dedupe by external id
 * is a documented future provider decision — no schema change here).
 */
export async function receiveInboundMessage(
  deps: ConversationEngineDeps,
  input: unknown,
): Promise<InboundResult> {
  const parsed = inboundMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      message: parsed.error.issues[0]?.message ?? VALIDATION_MESSAGE,
    };
  }
  const inbound: InboundMessageInput = parsed.data;

  // 1. Resolve the Business from the receiving WhatsApp number — the
  //    established inbound transport mapping. NEVER client-controlled.
  const business = await deps.businessRepository.findByWhatsappNumber(
    canonicalPhone(inbound.to),
  );
  if (!business) {
    return {
      ok: false,
      code: "BUSINESS_NOT_FOUND",
      message: BUSINESS_NOT_FOUND_MESSAGE,
    };
  }
  if (!business.isActive) {
    return {
      ok: false,
      code: "BUSINESS_INACTIVE",
      message: BUSINESS_INACTIVE_MESSAGE,
    };
  }

  try {
    // 2. Find or create the customer (canonical phone path).
    const customer = await deps.customerRepository.upsertByPhone(business.id, {
      name: inboundCustomerName(inbound.from),
      phone: canonicalPhone(inbound.from),
    });

    // 3. Find or create the conversation (latest thread per customer —
    //    no second conversation system, no duplicate active threads).
    const latest = await deps.conversationRepository.findLatestByCustomer(
      business.id,
      customer.id,
    );
    let conversation: Conversation | null = latest
      ? await deps.conversationRepository.findById(latest.id)
      : null;
    if (conversation && conversation.businessId !== business.id) {
      conversation = null; // defense in depth: never cross tenants
    }
    if (!conversation) {
      conversation = await deps.conversationRepository.create({
        businessId: business.id,
        customerId: customer.id,
      });
    }

    // 4. Persist the CUSTOMER message (immutable, single write path) with
    //    the transport-owned receive timestamp.
    const aiEligible =
      conversation.status === "AI_ACTIVE" && !conversation.assignedUserId;
    const customerMessage = await deps.conversationRepository.addMessage(
      {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: inbound.text,
        createdAt: new Date(inbound.receivedAt),
      },
      // A thread that is not AI-eligible needs staff attention; the
      // assignment is preserved, only the status routes to the queue.
      aiEligible ? {} : { status: "NEED_HUMAN" },
    );
    await deps.customerRepository.touchConversation(customer.id);

    // 5. AI turn — only on unassigned AI_ACTIVE threads.
    if (!aiEligible) {
      return {
        ok: true,
        conversationId: conversation.id,
        customerId: customer.id,
        customerMessageId: customerMessage.id,
        assistantAction: "DEFERRED_TO_STAFF",
        intent: null,
        conversationStatus: "NEED_HUMAN",
        assistantProvider: deps.ai.providerName,
        delivery: null,
      };
    }

    const [recent, services] = await Promise.all([
      deps.conversationRepository.getMessages(conversation.id, {
        pageSize: RECENT_MESSAGE_LIMIT,
      }),
      deps.serviceRepository.listByBusiness(business.id),
    ]);

    let turn: AiTurnResult;
    try {
      turn = await deps.ai.respond({
        businessName: business.name,
        faqs: safeFaqs(business.faqs),
        services: services.map((service) => ({
          name: service.name,
          durationMinutes: service.durationMinutes,
        })),
        conversationStatus: conversation.status,
        recentMessages: [...recent].reverse().map((message) => ({
          senderType: message.senderType,
          content: message.content,
        })),
        message: inbound.text,
      });
    } catch {
      // The assistant failed — the safe direction is a silent handoff:
      // staff sees the customer message in the NEED_HUMAN queue, and no
      // AI message is invented.
      await deps.conversationRepository.updateWorkflow(conversation.id, {
        status: "NEED_HUMAN",
      });
      return {
        ok: true,
        conversationId: conversation.id,
        customerId: customer.id,
        customerMessageId: customerMessage.id,
        assistantAction: "AI_HANDOFF",
        intent: null,
        conversationStatus: "NEED_HUMAN",
        assistantProvider: deps.ai.providerName,
        delivery: null,
      };
    }

    // 6. Validate the assistant output BEFORE persisting (AI is never
    //    the source of truth — invalid output fails safe to a handoff).
    const contentCheck = assistantContentSchema.safeParse(
      "content" in turn ? turn.content : null,
    );
    if (!contentCheck.success) {
      await deps.conversationRepository.updateWorkflow(conversation.id, {
        status: "NEED_HUMAN",
      });
      return {
        ok: true,
        conversationId: conversation.id,
        customerId: customer.id,
        customerMessageId: customerMessage.id,
        assistantAction: "AI_HANDOFF",
        intent: null,
        conversationStatus: "NEED_HUMAN",
        assistantProvider: deps.ai.providerName,
        delivery: null,
      };
    }
    const content = contentCheck.data;

    // 7. Persist the assistant reply through the single write path with
    //    the workflow the turn decided.
    await deps.conversationRepository.addMessage(
      {
        conversationId: conversation.id,
        senderType: "AI",
        content,
      },
      {
        status: turn.action === "reply" ? "AI_ACTIVE" : "NEED_HUMAN",
      },
    );

    // Booking-related handoffs record a short staff-facing summary in
    // the EXISTING aiSummary field — only when it is still empty (a
    // staff-written summary is never clobbered).
    if (turn.action === "booking_handoff" && !conversation.aiSummary) {
      await deps.conversationRepository.update(conversation.id, {
        aiSummary: turn.summary,
      });
    }

    // 8. Deliver through the transport boundary — best-effort; the
    //    persisted message is the record of truth, delivery is reported.
    let delivery: InboundSuccess["delivery"] = null;
    try {
      const sent = await deps.transport.send({
        to: customer.phone,
        businessName: business.name,
        conversationId: conversation.id,
        content,
      });
      delivery = {
        provider: sent.provider,
        delivered: sent.delivered,
        ...(sent.error ? { error: sent.error } : {}),
      };
    } catch (error) {
      delivery = {
        provider: deps.transport.providerName,
        delivered: false,
        error: error instanceof Error ? error.message : "transport error",
      };
    }

    return {
      ok: true,
      conversationId: conversation.id,
      customerId: customer.id,
      customerMessageId: customerMessage.id,
      assistantAction: turn.action === "reply" ? "AI_REPLY" : "AI_HANDOFF",
      intent: turn.intent,
      conversationStatus: turn.action === "reply" ? "AI_ACTIVE" : "NEED_HUMAN",
      assistantProvider: deps.ai.providerName,
      delivery,
    };
  } catch {
    return {
      ok: false,
      code: "PERSISTENCE_FAILED",
      message: PERSISTENCE_FAILED_MESSAGE,
    };
  }
}
