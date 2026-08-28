import { env } from "@/lib/env";
import { db } from "@/server/db";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  appName: "FlowPilot",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    // FlowPilot domain fields living on the shared users table.
    // input:false → managed server-side (onboarding/admin), never by clients.
    additionalFields: {
      businessId: { type: "string", required: false, input: false },
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "STAFF",
      },
      isActive: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: true,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
