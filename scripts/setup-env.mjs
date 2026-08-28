#!/usr/bin/env node
// Safe .env.local generator — never overwrites, never prints secret values.
// Creates .env.local from .env.example with a random BETTER_AUTH_SECRET
// when no local env file exists. Exits 0 with guidance otherwise.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, ".env.example");
const envLocalPath = join(root, ".env.local");
const envPath = join(root, ".env");

const ok = (msg) => console.log(`✅ ${msg}`);
const warn = (msg) => console.warn(`⚠️  ${msg}`);

if (!existsSync(examplePath)) {
  console.error("❌ .env.example not found — repository looks incomplete.");
  process.exit(1);
}

if (existsSync(envPath) || existsSync(envLocalPath)) {
  const existing = [envLocalPath, envPath]
    .filter(existsSync)
    .map((p) => relative(root, p))
    .join(", ");
  ok(`Existing env file(s) found (${existing}) — nothing to do.`);
  warn("Never commit env files; they are gitignored on purpose.");
  process.exit(0);
}

const template = readFileSync(examplePath, "utf8");
const generatedSecret = randomBytes(48).toString("base64");
const content = template.replace(
  /^BETTER_AUTH_SECRET=.*$/m,
  `BETTER_AUTH_SECRET="${generatedSecret}"`,
);

if (!content.includes(generatedSecret)) {
  console.error(
    "❌ Could not inject BETTER_AUTH_SECRET into the template — check .env.example.",
  );
  process.exit(1);
}

writeFileSync(envLocalPath, content, { mode: 0o600 });

ok("Created .env.local from .env.example (permissions 600).");
ok("Generated a random BETTER_AUTH_SECRET (value not printed).");
warn(
  "ACTION REQUIRED: edit .env.local and set DATABASE_URL to your Neon connection string.",
);
warn("Other placeholders (URLs) are fine for local development.");
