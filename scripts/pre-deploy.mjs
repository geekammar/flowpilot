#!/usr/bin/env node
// FlowPilot pre-deploy — deployment readiness gate (READY / NOT READY).
//
//   pnpm deploy:check            full gate (env + prisma + DB + auth + demo + build)
//   pnpm deploy:check -- --fast  same gate without the local build step
//
// Checks (in order, fast → slow):
//   1. environment variables   (reuses scripts/vercel-check.mjs — single source of truth)
//   2. prisma generation       (schema present; client generated — auto-generates if missing)
//   3. database connection     (SELECT 1, classified errors) + schema applied (tables exist)
//   4. auth configuration      (secret strength, URL validity, origin consistency)
//   5. deployment config       (vercel.json build command, postinstall generate, project link)
//   6. demo data (DEMO_MODE)   (re-seeds + verifies the demo dataset so dashboards are never empty)
//   7. build validation        (typecheck + next build — the definitive deployability proof)
//
// Every failure prints an actionable fix. Secrets are never printed.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { platform, release } from "node:os";
import { join } from "node:path";

import { config as loadEnv } from "dotenv";

const root = process.cwd();
const isTermux =
  Boolean(process.env.TERMUX_VERSION) ||
  (process.env.PREFIX ?? "").includes("com.termux") ||
  (platform() === "linux" && /android/i.test(release()));

const FAST = process.argv.includes("--fast");

// Same env precedence as the app: real env vars > .env.local > .env
loadEnv({ path: join(root, ".env.local"), quiet: true });
loadEnv({ path: join(root, ".env"), quiet: true });
const env = process.env;

// Stable demo identifiers — kept in sync with prisma/demo-data.ts (DEMO_IDS /
// DEMO_CREDENTIALS). Documented in DEMO_GUIDE.md.
const DEMO_BUSINESS_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
const DEMO_EMAILS = ["admin@flowpilot.app", "staff@flowpilot.app"];

const results = [];
const check = (name, pass, detail, opts = {}) => {
  results.push({
    name,
    pass,
    detail,
    fix: opts.fix,
    blocking: opts.blocking ?? !pass,
  });
};

const run = (label, cmd, args) => {
  const t0 = Date.now();
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  const code = result.status ?? 1;
  console.log(
    `${code === 0 ? "✓" : "✗"} ${label} ${code === 0 ? `passed in ${seconds}s` : `FAILED (exit ${code})`}`,
  );
  return code === 0;
};

const PLACEHOLDER_MARKERS = [
  "replace-with",
  "your-",
  "changeme",
  "placeholder",
  "user:password@",
];
const isPlaceholder = (value) =>
  !value ||
  PLACEHOLDER_MARKERS.some((marker) => value.toLowerCase().includes(marker));

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
};

console.log(
  `FlowPilot pre-deploy — deployment readiness gate${isTermux ? " (Termux: --webpack builds)" : ""}${FAST ? " [fast: build step skipped]" : ""}\n`,
);

// ── 1. Environment variables ─────────────────────────────────────────────────
console.log("── 1/7 environment variables " + "─".repeat(24));
const envOk = run(
  "vercel:check (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL)",
  "node",
  ["scripts/vercel-check.mjs"],
);
check(
  "environment variables",
  envOk,
  envOk
    ? "all four required variables valid"
    : "validation failed — see output above",
  {
    fix: "Fix the variables listed above (locally in .env.local, on Vercel in Project → Settings → Environment Variables), then re-run: pnpm deploy:check",
  },
);
if (!envOk) {
  // Without valid env vars every later check is noise — stop here.
  finish();
}

// ── 2. Prisma generation ─────────────────────────────────────────────────────
console.log("\n── 2/7 prisma generation " + "─".repeat(33));
const schemaOk = existsSync(join(root, "prisma/schema.prisma"));
let clientOk = existsSync(join(root, "src/generated/prisma"));
if (schemaOk && !clientOk) {
  console.log("• Prisma client missing — generating (pnpm db:generate)…");
  clientOk = run("prisma generate", "pnpm", ["db:generate"]);
}
check(
  "prisma schema",
  schemaOk,
  schemaOk ? "schema.prisma present" : "missing",
  {
    fix: "Repository looks incomplete — re-clone.",
  },
);
check(
  "prisma client",
  clientOk,
  clientOk ? "generated (src/generated/prisma)" : "not generated",
  { fix: "Run: pnpm db:generate" },
);

// ── 3. Database connection + schema ──────────────────────────────────────────
console.log("\n── 3/7 database " + "─".repeat(42));
const dbUrl = env.DATABASE_URL?.trim() ?? "";
const REQUIRED_TABLES = [
  "businesses",
  "users",
  "services",
  "customers",
  "conversations",
  "messages",
  "appointments",
  "accounts",
  "sessions",
  "verifications",
];

let dbClient = null;
if (isPlaceholder(dbUrl)) {
  check(
    "database connection",
    false,
    "skipped — DATABASE_URL is a placeholder",
    {
      fix: "Set a real Neon connection string in .env.local, then re-run: pnpm deploy:check",
    },
  );
} else if (!existsSync(join(root, "node_modules/pg"))) {
  check("database connection", false, "skipped — dependencies missing (pg)", {
    fix: "Run: pnpm install, then re-run: pnpm deploy:check",
  });
} else {
  const { Client } = await import("pg");
  dbClient = new Client({
    connectionString: dbUrl,
    connectionTimeoutMillis: 8_000,
    statement_timeout: 5_000,
  });
  const t0 = Date.now();
  try {
    await dbClient.connect();
    await dbClient.query("SELECT 1");
    check(
      "database connection",
      true,
      `connected (${Date.now() - t0}ms, value hidden)`,
    );

    const tables = await dbClient.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const present = new Set(tables.rows.map((row) => row.table_name));
    const missingTables = REQUIRED_TABLES.filter((t) => !present.has(t));
    check(
      "database schema",
      missingTables.length === 0,
      missingTables.length === 0
        ? "all required tables exist (migrations applied)"
        : `missing tables: ${missingTables.join(", ")}`,
      {
        fix: "Apply the committed migrations against this database from desktop/CI (Termux cannot run them): pnpm db:deploy",
      },
    );
  } catch (error) {
    const code = error.code ?? "";
    const msg = String(error.message ?? error);
    let fix = `Check the connection string in .env.local. Error class: ${error.constructor.name}`;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN")
      fix =
        "Host not found / no DNS — check the Neon hostname and your internet connection.";
    else if (code === "ETIMEDOUT" || /timeout/i.test(msg))
      fix =
        "Connection timed out — check network/firewall; wake the Neon project if it is suspended (idle).";
    else if (code === "28P01" || /password authentication failed/i.test(msg))
      fix =
        "Authentication failed — the password in DATABASE_URL is wrong. Reset it in the Neon console.";
    else if (code === "3D000" || /database .* does not exist/i.test(msg))
      fix =
        "Database name in DATABASE_URL does not exist — check the Neon database name.";
    else if (/ssl|SSL/i.test(msg))
      fix = "TLS/SSL problem — make sure the URL ends with ?sslmode=require.";
    check(
      "database connection",
      false,
      `unreachable (${error.constructor.name}, value hidden)`,
      { fix },
    );
    check("database schema", false, "skipped — no database connection", {
      fix: "Fix the connection first; then confirm migrations are applied (pnpm db:deploy).",
    });
  }
}

// ── 4. Auth configuration ────────────────────────────────────────────────────
console.log("\n── 4/7 auth configuration " + "─".repeat(31));
const authSecret = env.BETTER_AUTH_SECRET?.trim() ?? "";
const authUrl = env.BETTER_AUTH_URL?.trim() ?? "";
const appUrl = env.NEXT_PUBLIC_APP_URL?.trim() ?? "";

check(
  "BETTER_AUTH_SECRET",
  !isPlaceholder(authSecret) && authSecret.length >= 32,
  isPlaceholder(authSecret)
    ? "missing or placeholder"
    : authSecret.length < 32
      ? `too short (${authSecret.length} chars, needs ≥ 32)`
      : `${authSecret.length} chars (value hidden)`,
  {
    fix: "Generate one: node -e \"console.log(require('node:crypto').randomBytes(48).toString('base64'))\"",
  },
);

const authUrlParsed = parseUrl(authUrl);
const appUrlParsed = parseUrl(appUrl);
check(
  "BETTER_AUTH_URL",
  Boolean(authUrlParsed) &&
    ["http:", "https:"].includes(authUrlParsed.protocol ?? ""),
  authUrlParsed ? authUrlParsed.origin : "not a valid http(s) URL",
  {
    fix: "Set it to the public deployment URL, e.g. https://flowpilot.vercel.app",
  },
);
check(
  "NEXT_PUBLIC_APP_URL",
  Boolean(appUrlParsed) &&
    ["http:", "https:"].includes(appUrlParsed.protocol ?? ""),
  appUrlParsed ? appUrlParsed.origin : "not a valid http(s) URL",
  { fix: "Set it to the same public URL as BETTER_AUTH_URL." },
);

if (
  authUrlParsed &&
  appUrlParsed &&
  authUrlParsed.origin !== appUrlParsed.origin
) {
  check(
    "origin consistency",
    false,
    "BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL point at different origins",
    {
      fix: "Both must point at the same production origin, or auth redirects break after deploy.",
    },
  );
} else if (
  authUrlParsed?.hostname === "localhost" ||
  appUrlParsed?.hostname === "localhost"
) {
  check(
    "deployment URL",
    true,
    "URLs point at localhost (fine locally — must equal the Vercel URL in production env vars)",
    { blocking: false },
  );
}

// ── 5. Deployment configuration ──────────────────────────────────────────────
console.log("\n── 5/7 deployment configuration " + "─".repeat(27));
let vercelJson = {};
try {
  vercelJson = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
} catch {
  vercelJson = null;
}
check(
  "vercel.json build command",
  Boolean(vercelJson?.buildCommand?.includes("pnpm build")),
  vercelJson?.buildCommand ?? "missing/invalid vercel.json",
  {
    fix: "Restore vercel.json (buildCommand: pnpm db:generate && pnpm build).",
  },
);

let pkg = {};
try {
  pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
} catch {
  pkg = null;
}
check(
  "postinstall prisma generate",
  String(pkg?.scripts?.postinstall ?? "").includes("prisma generate"),
  pkg?.scripts?.postinstall ?? "missing",
  {
    fix: 'Restore "postinstall": "prisma generate" in package.json (Vercel builds need it).',
  },
);

const linked = existsSync(join(root, ".vercel/project.json"));
check(
  "vercel project link",
  true,
  linked
    ? "linked (.vercel/project.json) — CLI deploys will target it"
    : "not linked — CLI deploys run `vercel link` first (GitHub-import flow does not need it)",
  { blocking: false },
);

// ── 6. Demo data (DEMO_MODE) ─────────────────────────────────────────────────
console.log("\n── 6/7 demo data " + "─".repeat(40));
const demoMode = (env.DEMO_MODE ?? "").trim().toLowerCase() === "true";
if (!demoMode) {
  check(
    "demo dataset",
    true,
    'DEMO_MODE not set — demo seeding skipped (add DEMO_MODE="true" to .env.local for demo deployments)',
    { blocking: false },
  );
} else if (!dbClient) {
  check(
    "demo dataset",
    false,
    "DEMO_MODE=true but the database is unreachable — cannot seed demo data",
    {
      fix: "Fix the database connection above, then re-run: pnpm deploy:check",
    },
  );
} else {
  console.log(
    "• DEMO_MODE=true — reseeding the demo dataset (idempotent, demo business only)…",
  );
  const seeded = run("db:seed (عيادة الابتسامة demo business)", "pnpm", [
    "db:seed",
  ]);
  let demoDetail = "seed command failed";
  let demoOk = false;
  if (seeded) {
    try {
      const counts = await dbClient.query(
        `SELECT
           (SELECT COUNT(*) FROM businesses WHERE id = $1) AS business,
           (SELECT COUNT(*) FROM users WHERE email = ANY($2)) AS users,
           (SELECT COUNT(*) FROM customers WHERE business_id = $1 AND deleted_at IS NULL) AS customers,
           (SELECT COUNT(*) FROM conversations WHERE business_id = $1 AND deleted_at IS NULL) AS conversations,
           (SELECT COUNT(*) FROM appointments WHERE business_id = $1 AND deleted_at IS NULL) AS appointments`,
        [DEMO_BUSINESS_ID, DEMO_EMAILS],
      );
      const c = counts.rows[0] ?? {};
      const business = Number(c.business ?? 0);
      const users = Number(c.users ?? 0);
      const customers = Number(c.customers ?? 0);
      const conversations = Number(c.conversations ?? 0);
      const appointments = Number(c.appointments ?? 0);
      demoOk =
        business === 1 &&
        users >= 2 &&
        customers > 0 &&
        conversations > 0 &&
        appointments > 0;
      demoDetail = demoOk
        ? `demo business + ${users} demo users + ${customers} customers + ${conversations} conversations + ${appointments} appointments`
        : `incomplete dataset (business=${business}, users=${users}, customers=${customers}, conversations=${conversations}, appointments=${appointments})`;
    } catch (error) {
      demoDetail = `verification query failed (${error.constructor.name})`;
    }
  }
  check("demo dataset", demoOk, demoDetail, {
    fix: "Re-run: pnpm db:seed — then re-run: pnpm deploy:check. The seed is idempotent and only touches the demo business.",
  });
}

if (dbClient) await dbClient.end().catch(() => {});

// ── 7. Build validation ──────────────────────────────────────────────────────
console.log("\n── 7/7 build validation " + "─".repeat(34));
if (FAST) {
  check(
    "build",
    true,
    "skipped (--fast) — the deploy commands run the full gate before deploying",
    { blocking: false },
  );
} else {
  const typecheckOk = run("typecheck", "pnpm", ["typecheck"]);
  check("typecheck", typecheckOk, typecheckOk ? "passed" : "failed", {
    fix: "Fix the TypeScript errors above, then re-run: pnpm deploy:check",
  });
  if (typecheckOk) {
    const buildArgs = isTermux
      ? ["exec", "next", "build", "--webpack"]
      : ["build"];
    const buildOk = run(
      isTermux ? "next build (webpack — Termux)" : "next build",
      "pnpm",
      buildArgs,
    );
    check("production build", buildOk, buildOk ? "passed" : "failed", {
      fix: "The build must pass — this exact tree is what Vercel builds. Fix the errors above.",
    });
  } else {
    check("production build", false, "skipped — typecheck failed", {
      fix: "Fix typecheck first.",
    });
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
finish();

function finish() {
  console.log("\n──────────── pre-deploy report " + "─".repeat(24));
  for (const r of results) {
    const icon = r.pass ? "✅" : r.blocking ? "❌" : "⚠️ ";
    console.log(`${icon} ${r.name.padEnd(26)} ${r.detail}`);
    if (!r.pass && r.fix) console.log(`   → fix: ${r.fix}`);
  }
  const failures = results.filter((r) => !r.pass && r.blocking);
  console.log("");
  if (failures.length === 0) {
    console.log(
      "RESULT: READY ✅\n" +
        "Environment, database, Prisma, auth, and build are deployment-ready.\n" +
        "Next: pnpm deploy            (production — shareable URL)\n" +
        "      pnpm deploy:preview    (throwaway preview URL — auth may not work there)\n" +
        "First time?  docs/VERCEL_QUICK_DEPLOY.md — under 5 minutes.",
    );
    process.exit(0);
  }
  console.log(
    `RESULT: NOT READY ❌ — ${failures.length} blocking issue(s) above.\n` +
      "Apply the fixes (→), then re-run: pnpm deploy:check",
  );
  process.exit(1);
}
