#!/usr/bin/env node
// FlowPilot vercel-check — deployment environment validation.
// Validates the four required deployment variables against the same
// precedence the app uses (real env vars > .env.local > .env) and reports
// every problem with a clear fix. Values are never printed.
import { existsSync } from "node:fs";

import { config as loadEnv } from "dotenv";

const PLACEHOLDER_MARKERS = [
  "replace-with",
  "your-",
  "changeme",
  "placeholder",
  "user:password@",
  "example.com",
];

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const env = process.env;

const isPlaceholder = (value) =>
  PLACEHOLDER_MARKERS.some((marker) => value.toLowerCase().includes(marker));

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

const checks = [];

// ── DATABASE_URL ─────────────────────────────────────────────────────────────
const databaseUrl = env.DATABASE_URL?.trim() ?? "";
if (!databaseUrl) {
  checks.push({
    name: "DATABASE_URL",
    ok: false,
    problem: "missing",
    fix: "Add your Neon connection string: postgresql://user:password@host/dbname?sslmode=require",
  });
} else if (isPlaceholder(databaseUrl)) {
  checks.push({
    name: "DATABASE_URL",
    ok: false,
    problem: "still a placeholder value",
    fix: "Copy the real connection string from the Neon console (Project → Connect).",
  });
} else {
  const url = parseUrl(databaseUrl);
  if (!url || !["postgres:", "postgresql:"].includes(url.protocol)) {
    checks.push({
      name: "DATABASE_URL",
      ok: false,
      problem: "not a valid postgres:// or postgresql:// URL",
      fix: "Format: postgresql://user:password@host/dbname?sslmode=require",
    });
  } else if (!url.searchParams.has("sslmode")) {
    checks.push({
      name: "DATABASE_URL",
      ok: true,
      warn: true,
      problem: 'missing "sslmode=require" query parameter',
      fix: "Neon requires TLS — append ?sslmode=require to the connection string.",
    });
  } else {
    checks.push({ name: "DATABASE_URL", ok: true });
  }
}

// ── BETTER_AUTH_SECRET ───────────────────────────────────────────────────────
const authSecret = env.BETTER_AUTH_SECRET?.trim() ?? "";
if (!authSecret) {
  checks.push({
    name: "BETTER_AUTH_SECRET",
    ok: false,
    problem: "missing",
    fix: "Generate one: node -e \"console.log(require('node:crypto').randomBytes(48).toString('base64'))\"",
  });
} else if (isPlaceholder(authSecret)) {
  checks.push({
    name: "BETTER_AUTH_SECRET",
    ok: false,
    problem: "still a placeholder value",
    fix: "Generate a real secret (see .env.example) — the app rejects placeholders.",
  });
} else if (authSecret.length < 32) {
  checks.push({
    name: "BETTER_AUTH_SECRET",
    ok: false,
    problem: `too short (${authSecret.length} chars, minimum 32)`,
    fix: "Regenerate with the command above and paste it into the environment.",
  });
} else {
  checks.push({ name: "BETTER_AUTH_SECRET", ok: true });
}

// ── BETTER_AUTH_URL ──────────────────────────────────────────────────────────
const authUrl = env.BETTER_AUTH_URL?.trim() ?? "";
if (!authUrl) {
  checks.push({
    name: "BETTER_AUTH_URL",
    ok: false,
    problem: "missing",
    fix: "Set it to the public deployment URL, e.g. https://flowpilot.vercel.app",
  });
} else {
  const url = parseUrl(authUrl);
  if (!url || !["http:", "https:"].includes(url.protocol)) {
    checks.push({
      name: "BETTER_AUTH_URL",
      ok: false,
      problem: "not a valid http(s) URL",
      fix: "Example: https://your-domain.vercel.app (no trailing slash needed).",
    });
  } else if (url.hostname === "localhost") {
    checks.push({
      name: "BETTER_AUTH_URL",
      ok: true,
      warn: true,
      problem: "points at localhost",
      fix: "For Vercel deployments set this to the real production URL (Vercel → Settings → Environment Variables).",
    });
  } else {
    checks.push({ name: "BETTER_AUTH_URL", ok: true });
  }
}

// ── NEXT_PUBLIC_APP_URL ──────────────────────────────────────────────────────
const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() ?? "";
if (!appUrl) {
  checks.push({
    name: "NEXT_PUBLIC_APP_URL",
    ok: false,
    problem: "missing",
    fix: "Set it to the same public URL as BETTER_AUTH_URL (used for metadata + trusted origins).",
  });
} else {
  const url = parseUrl(appUrl);
  if (!url || !["http:", "https:"].includes(url.protocol)) {
    checks.push({
      name: "NEXT_PUBLIC_APP_URL",
      ok: false,
      problem: "not a valid http(s) URL",
      fix: "Example: https://your-domain.vercel.app",
    });
  } else if (url.hostname === "localhost") {
    checks.push({
      name: "NEXT_PUBLIC_APP_URL",
      ok: true,
      warn: true,
      problem: "points at localhost",
      fix: "For Vercel deployments set this to the real production URL — it is baked in at build time.",
    });
  } else {
    checks.push({ name: "NEXT_PUBLIC_APP_URL", ok: true });
  }
}

// ── Consistency ──────────────────────────────────────────────────────────────
if (authUrl && appUrl) {
  const a = parseUrl(authUrl);
  const b = parseUrl(appUrl);
  if (a && b && a.origin !== b.origin) {
    checks.push({
      name: "BETTER_AUTH_URL ↔ NEXT_PUBLIC_APP_URL",
      ok: true,
      warn: true,
      problem: "origins differ",
      fix: "On Vercel both should point at the same production origin to keep auth redirects and metadata consistent.",
    });
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
const envFiles = [
  existsSync(".env.local") && ".env.local",
  existsSync(".env") && ".env",
].filter(Boolean);

console.log("FlowPilot vercel-check — deployment environment validation\n");
console.log(
  `Env source: ${
    envFiles.length
      ? envFiles.join(" + ")
      : "environment variables only (no env file found)"
  }\n`,
);

let failed = false;
for (const check of checks) {
  const label =
    check.name === "BETTER_AUTH_URL ↔ NEXT_PUBLIC_APP_URL"
      ? "consistency"
      : check.name;
  if (!check.ok) {
    failed = true;
    console.log(`❌ ${label} — ${check.problem}`);
    console.log(`   → fix: ${check.fix}`);
  } else if (check.warn) {
    console.log(`⚠️  ${label} — ${check.problem}`);
    console.log(`   → fix: ${check.fix}`);
  } else {
    console.log(`✅ ${label} — ok`);
  }
}

console.log("");
if (failed) {
  console.log(
    "RESULT: FAILED ❌ — fix the variables above (locally in .env.local, on Vercel in Project → Settings → Environment Variables) and re-run: pnpm vercel:check",
  );
  process.exit(1);
}
console.log(
  "RESULT: PASSED ✅ — environment is valid for deployment. (Warnings do not block.)",
);
