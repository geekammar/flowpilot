/**
 * Public-path policy for the route proxy (tier 1 of the two-tier
 * protection model — see `src/proxy.ts` and `docs/DECISIONS.md` #13).
 *
 * Extracted from the proxy so the routing policy is independently
 * verifiable: unauthenticated access to protected areas (e.g.
 * `/onboarding`) must be redirected to `/sign-in`, while the
 * token-scoped invitation activation route (`/invite/<token>`) stays
 * public — the invitation token itself is the credential there, and
 * the invitation service enforces its lifecycle server-side.
 */

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/unauthorized",
  "/access-denied",
] as const;

const PUBLIC_PATH_PREFIXES = ["/invite/", "/api/auth"] as const;

export function isPublicPath(pathname: string): boolean {
  // /api/health is the public liveness probe (deployment validation).
  return (
    PUBLIC_PATHS.includes(pathname as (typeof PUBLIC_PATHS)[number]) ||
    pathname === "/api/health" ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}
