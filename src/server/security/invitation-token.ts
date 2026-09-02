import { createHash, randomBytes } from "node:crypto";

/**
 * Invitation token security (server-only).
 *
 * Security rules — binding for every caller:
 * - The RAW token is a credential. It exists in memory only long enough
 *   to be returned ONCE from invitation creation to the caller that
 *   delivers it (email/link). It must NEVER be persisted, logged,
 *   written into error messages, analytics, or debug output.
 * - The database stores only `tokenHash` — the SHA-256 hash of the raw
 *   token. Lookups happen exclusively by hash.
 * - 256 bits of cryptographically secure randomness make the token
 *   unguessable; a deterministic hash keeps lookups possible without
 *   storing the credential itself. No reversible encryption, no
 *   passwords, no plaintext token storage.
 */

/** 256 bits of CSPRNG entropy — the minimum for an unguessable credential. */
const TOKEN_BYTES = 32;

/** SHA-256 hex digest length (the only value persisted). */
export const INVITATION_TOKEN_HASH_LENGTH = 64;

/** Deterministic SHA-256 hash of a raw invitation token (hex). */
export function hashInvitationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a fresh invitation token pair:
 * `rawToken` (URL-safe, single-use credential — return to the caller
 * exactly once, never persist) and `tokenHash` (the only persistable
 * representation).
 */
export function generateInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomBytes(TOKEN_BYTES).toString("base64url");
  return { rawToken, tokenHash: hashInvitationToken(rawToken) };
}
