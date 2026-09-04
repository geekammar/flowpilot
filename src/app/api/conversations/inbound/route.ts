/**
 * Provider-neutral inbound message webhook (PROMPT-19).
 *
 * ONE canonical HTTP entry for a WhatsApp-style inbound message. The
 * route stays thin: authenticate the caller with the shared
 * `INBOUND_WEBHOOK_TOKEN` secret (the route is DISABLED — 503 — while
 * the env var is unset), parse the JSON body, and hand it to the
 * conversation engine (`receiveInboundMessage`), which owns all
 * validation, tenant resolution, and persistence. A real WhatsApp
 * provider adapter will verify provider signatures and call this same
 * engine path — the domain flow never changes.
 *
 * The Business is ALWAYS resolved inside the engine from the receiving
 * WhatsApp number (`to`) — the payload can never supply `businessId`,
 * roles, or any internal ids.
 */

import { createHash, timingSafeEqual } from "node:crypto";

import {
  defaultConversationEngineDeps,
  receiveInboundMessage,
} from "@/features/conversations/server/conversation-engine";
import { env } from "@/lib/env";

import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** Constant-time token comparison (hash first: equal-length buffers). */
function tokenMatches(provided: string, expected: string): boolean {
  const providedHash = createHash("sha256").update(provided).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

const TOKEN_HEADER = "x-webhook-token";

export async function POST(request: Request) {
  const expectedToken = env.INBOUND_WEBHOOK_TOKEN;
  if (!expectedToken) {
    return Response.json(
      {
        success: false,
        error: {
          code: "WEBHOOK_DISABLED",
          message:
            "استقبال الرسائل غير مفعّل — اضبط INBOUND_WEBHOOK_TOKEN أولاً",
        },
      },
      { status: 503 },
    );
  }

  const providedToken = request.headers.get(TOKEN_HEADER) ?? "";
  if (!providedToken || !tokenMatches(providedToken, expectedToken)) {
    return Response.json(
      {
        success: false,
        error: { code: "UNAUTHENTICATED", message: "رمز التحقق غير صالح" },
      },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: { code: "VALIDATION", message: "المحتوى غير صالح" },
      },
      { status: 400 },
    );
  }

  const result = await receiveInboundMessage(
    defaultConversationEngineDeps,
    body,
  );

  if (result.ok) {
    // Expose the resulting conversation state to the existing UI.
    revalidatePath("/conversations");
    revalidatePath(`/conversations/${result.conversationId}`);
    revalidatePath("/");
    revalidatePath("/staff");
    return Response.json({ success: true, result });
  }

  const statusByCode = {
    VALIDATION: 400,
    BUSINESS_NOT_FOUND: 404,
    BUSINESS_INACTIVE: 403,
    PERSISTENCE_FAILED: 500,
  } as const;

  return Response.json(
    {
      success: false,
      error: { code: result.code, message: result.message },
    },
    { status: statusByCode[result.code] },
  );
}
