/**
 * Outbound message transport boundary (PROMPT-19, Spec A §8).
 *
 * The conversation domain never talks to a WhatsApp vendor SDK directly:
 *
 *   Conversation Engine → MessageTransport (this interface) → provider adapter
 *
 * The only implementation today is `offlineMessageTransport` — a
 * deterministic dev/test adapter that logs the message. It is NOT a live
 * WhatsApp integration and never claims to deliver anything; a real
 * provider adapter is a future operator decision (see DECISIONS.md).
 * The interface stays deliberately tiny: one send, one typed result.
 */

/** One outbound assistant reply to deliver to a customer. */
export type OutboundMessage = {
  /** Customer phone number (E.164-ish, as received inbound). */
  to: string;
  /** Display name of the sending business. */
  businessName: string;
  /** Conversation the reply belongs to. */
  conversationId: string;
  /** Reply text exactly as persisted. */
  content: string;
};

/** Result of one delivery attempt. */
export type TransportSendResult = {
  provider: string;
  delivered: boolean;
  /** Human-readable failure reason when not delivered. */
  error?: string;
};

/** Provider-neutral outbound transport. */
export interface MessageTransport {
  readonly providerName: string;
  send(message: OutboundMessage): Promise<TransportSendResult>;
}

/**
 * Offline transport (dev/test). Warns about each outbound message (nothing
 * is really delivered to WhatsApp in offline mode) and reports success —
 * honest for local verification, never a live WhatsApp send.
 */
export const offlineMessageTransport: MessageTransport = {
  providerName: "offline",
  async send(message: OutboundMessage): Promise<TransportSendResult> {
    console.warn(
      `[offline-transport] NOT delivered to WhatsApp → ${message.to} (conversation ${message.conversationId}, business ${message.businessName}): ${message.content}`,
    );
    return { provider: "offline", delivered: true };
  },
};
