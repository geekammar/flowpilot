import type { auth } from "@/lib/auth";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Typed Better Auth client — `inferAdditionalFields` mirrors FlowPilot's
 * extra user fields (role, isActive, businessId) onto the client session.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const signIn = authClient.signIn;
export const signOut = authClient.signOut;
export const signUp = authClient.signUp;
