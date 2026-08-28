import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
});

const parsedServer = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});

if (!parsedServer.success) {
  console.error(
    "❌ Invalid server environment variables:\n" +
      z.prettifyError(parsedServer.error),
  );
  throw new Error("Invalid server environment variables");
}

const parsedClient = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsedClient.success) {
  console.error(
    "❌ Invalid client environment variables:\n" +
      z.prettifyError(parsedClient.error),
  );
  throw new Error("Invalid client environment variables");
}

export const env = {
  ...parsedServer.data,
  ...parsedClient.data,
};

export type Env = typeof env;
