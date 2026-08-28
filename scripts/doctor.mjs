#!/usr/bin/env node
// FlowPilot doctor — project health verification (read-only).
// Checks: OS, node, pnpm, git, gh, env variables, Prisma, database
// connection, dependencies, build readiness. Prints READY or NOT READY with
// actionable fixes. Secrets are never printed.
// Run with: pnpm run doctor  ("run" is required — pnpm ships a built-in
// `doctor` command that would otherwise shadow this script).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { arch, platform, release } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const isTermux =
  Boolean(process.env.TERMUX_VERSION) ||
  (process.env.PREFIX ?? "").includes("com.termux");

const MIN_NODE_MAJOR = 20;
const REQUIRED_BINS = ["next", "prisma", "eslint", "tsc", "prettier", "tsx"];

const results = [];
/**
 * check(name, pass, detail, {fix, blocking})
 * - fail + blocking  → NOT READY
 * - fail + !blocking → warning only
 */
const check = (name, pass, detail, opts = {}) => {
  results.push({
    name,
    pass,
    detail,
    fix: opts.fix,
    blocking: opts.blocking ?? !pass,
  });
};

const run = (cmd, args) => {
  try {
    return execFileSync(cmd, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 15_000,
    }).trim();
  } catch {
    return null;
  }
};

// ── 1. OS ────────────────────────────────────────────────────────────────────
const kernel = release().split("-")[0] ?? "";
const osDetail = `${platform()} ${arch()} · kernel ${kernel}${
  isTermux ? " · Termux" : ""
}`;
const SUPPORTED_PLATFORMS = ["darwin", "linux", "win32", "android"]; // android = Termux
check("os", SUPPORTED_PLATFORMS.includes(process.platform), osDetail, {
  fix: `Unsupported platform "${process.platform}" — use Windows, macOS, Linux, or Termux.`,
});
if (isTermux) {
  check(
    "os (termux)",
    true,
    "Termux mode: builds must use --webpack (Turbopack has no Android bindings)",
  );
}

// ── 2. Node.js ───────────────────────────────────────────────────────────────
const nodeVersion = process.versions.node;
const nodeMajor = Number.parseInt(nodeVersion.split(".")[0] ?? "0", 10);
check(
  "node",
  nodeMajor >= MIN_NODE_MAJOR,
  `v${nodeVersion} (requires >= v${MIN_NODE_MAJOR})`,
  {
    fix: `Install Node.js >= v${MIN_NODE_MAJOR} (https://nodejs.org) or re-run a bootstrap script.`,
  },
);

// ── 3. pnpm / 4. git / 5. gh ─────────────────────────────────────────────────
const pnpmVersion = run("pnpm", ["--version"]);
check(
  "pnpm",
  pnpmVersion !== null,
  pnpmVersion ? `v${pnpmVersion} (project pins 11.24.0)` : "not found",
  {
    fix: "Run a bootstrap script (scripts/bootstrap*.sh|ps1) or: npm install -g pnpm@11.24.0",
  },
);

const gitVersion = run("git", ["--version"]);
check("git", gitVersion !== null, gitVersion ?? "not found", {
  fix: "Install git: https://git-scm.com (Termux: pkg install git)",
});

const ghVersion = run("gh", ["--version"]);
const ghLine = ghVersion ? (ghVersion.split("\n")[0] ?? ghVersion) : null;
check("gh (optional)", ghVersion !== null, ghLine ?? "not found", {
  blocking: false,
  fix: "Optional — install from https://cli.github.com if you use GitHub workflows.",
});

// ── 6. Environment variables ─────────────────────────────────────────────────
const envLocalPath = join(root, ".env.local");
const envPath = join(root, ".env");
const parseEnv = (path) => {
  const map = {};
  if (!existsSync(path)) return map;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const [, key, raw] = match;
    map[key] = raw.replace(/^"(.*)"$/, "$1");
  }
  return map;
};
const env = parseEnv(envPath);
// .env.local overrides .env (matches Next.js + prisma.config.ts precedence)
for (const [key, value] of Object.entries(parseEnv(envLocalPath))) {
  env[key] = value;
}

const envFile = existsSync(envLocalPath)
  ? ".env.local"
  : existsSync(envPath)
    ? ".env"
    : null;
check(
  "env file",
  envFile !== null,
  envFile ? `${envFile} present` : "no .env / .env.local",
  {
    fix: "Run: pnpm run setup  (creates .env.local safely), then set DATABASE_URL.",
  },
);

const PLACEHOLDER_HINTS = [
  "replace-with",
  "user:password@",
  "your-",
  "changeme",
];
const isPlaceholder = (value) =>
  value === undefined ||
  value === "" ||
  PLACEHOLDER_HINTS.some((hint) => value.toLowerCase().includes(hint));

const dbUrl = env.DATABASE_URL;
check(
  "DATABASE_URL",
  !isPlaceholder(dbUrl),
  isPlaceholder(dbUrl) ? "missing or placeholder" : "set (value hidden)",
  {
    fix: "Edit .env.local and set your Neon connection string (postgresql://…?sslmode=require).",
  },
);

const secret = env.BETTER_AUTH_SECRET;
check(
  "BETTER_AUTH_SECRET",
  !isPlaceholder(secret) && secret.length >= 32,
  secret === undefined || secret === ""
    ? "missing"
    : secret.length < 32
      ? `too short (${secret.length} chars, needs ≥ 32)`
      : `${secret.length} chars (value hidden)`,
  {
    fix: "Generate one: node -e \"console.log(require('node:crypto').randomBytes(48).toString('base64'))\" — or re-run pnpm run setup on a fresh clone.",
  },
);

check(
  "app URLs",
  !isPlaceholder(env.BETTER_AUTH_URL) &&
    !isPlaceholder(env.NEXT_PUBLIC_APP_URL),
  !isPlaceholder(env.BETTER_AUTH_URL) && !isPlaceholder(env.NEXT_PUBLIC_APP_URL)
    ? "BETTER_AUTH_URL + NEXT_PUBLIC_APP_URL set"
    : "missing or placeholder",
  {
    blocking: false,
    fix: "Set both to http://localhost:3000 for local development.",
  },
);

// ── 7. Dependencies ─────────────────────────────────────────────────────────
const nodeModulesOk = existsSync(join(root, "node_modules"));
check(
  "dependencies",
  nodeModulesOk,
  nodeModulesOk ? "node_modules installed" : "missing",
  {
    fix: "Run: pnpm install",
  },
);
if (nodeModulesOk) {
  const missingPkgs = [
    "next",
    "prisma",
    "react",
    "pg",
    "@prisma/client",
    "typescript",
  ].filter((pkg) => !existsSync(join(root, "node_modules", pkg)));
  check(
    "dependencies (key packages)",
    missingPkgs.length === 0,
    missingPkgs.length === 0
      ? "next, prisma, react, pg, @prisma/client, typescript present"
      : `missing: ${missingPkgs.join(", ")}`,
    { fix: "Run: pnpm install" },
  );
}

// ── 8. Prisma ────────────────────────────────────────────────────────────────
const prismaClientOk = existsSync(join(root, "src/generated/prisma"));
check(
  "prisma client",
  prismaClientOk,
  prismaClientOk ? "generated (src/generated/prisma)" : "not generated",
  { fix: "Run: pnpm db:generate" },
);
check(
  "prisma schema",
  existsSync(join(root, "prisma/schema.prisma")),
  existsSync(join(root, "prisma/schema.prisma"))
    ? "schema.prisma present"
    : "missing",
  { fix: "Repository looks incomplete — re-clone." },
);

// ── 9. Database connection ───────────────────────────────────────────────────
if (isPlaceholder(dbUrl)) {
  check("database", false, "skipped — DATABASE_URL is a placeholder", {
    fix: "Set a real DATABASE_URL in .env.local, then re-run: pnpm run doctor",
  });
} else if (!nodeModulesOk || !existsSync(join(root, "node_modules/pg"))) {
  check(
    "database",
    false,
    "skipped — dependencies missing (pg not installed)",
    {
      fix: "Run: pnpm install, then re-run: pnpm run doctor",
    },
  );
} else {
  const detail = await checkDatabase(dbUrl);
  check("database", detail.ok, detail.message, { fix: detail.fix });
}

async function checkDatabase(url) {
  const { Client } = await import("pg");
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 8_000,
    statement_timeout: 5_000,
  });
  const t0 = Date.now();
  try {
    await client.connect();
    const res = await client.query("SELECT 1 AS ok");
    return {
      ok: res.rows[0]?.ok === 1,
      message: `connected (${Date.now() - t0}ms, value hidden)`,
    };
  } catch (error) {
    const code = error.code ?? "";
    const msg = String(error.message ?? error);
    let fix = `Check the connection string in .env.local. Error class: ${error.constructor.name}`;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN")
      fix =
        "Host not found / no DNS — check the Neon hostname and your internet connection.";
    else if (code === "ETIMEDOUT" || /timeout/i.test(msg))
      fix =
        "Connection timed out — check network/firewall, and that the Neon project is active (not suspended).";
    else if (code === "28P01" || /password authentication failed/i.test(msg))
      fix =
        "Authentication failed — the password in DATABASE_URL is wrong. Reset it in the Neon console.";
    else if (code === "3D000" || /database .* does not exist/i.test(msg))
      fix =
        "Database name in DATABASE_URL does not exist — check the Neon database name.";
    else if (/ssl|SSL/i.test(msg))
      fix = "TLS/SSL problem — make sure the URL ends with ?sslmode=require.";
    return {
      ok: false,
      message: `unreachable (${error.constructor.name}, value hidden)`,
      fix,
    };
  } finally {
    await client.end().catch(() => {});
  }
}

// ── 10. Build readiness ──────────────────────────────────────────────────────
if (nodeModulesOk) {
  const binDir = join(root, "node_modules", ".bin");
  const missingBins = REQUIRED_BINS.filter((b) => !existsSync(join(binDir, b)));
  check(
    "build readiness",
    missingBins.length === 0 && prismaClientOk,
    missingBins.length === 0 && prismaClientOk
      ? isTermux
        ? "toolchain ready (build will use --webpack on Termux)"
        : "toolchain ready (next/eslint/tsc/prettier + prisma client)"
      : `missing: ${[...missingBins, ...(prismaClientOk ? [] : ["src/generated/prisma"])].join(", ")}`,
    {
      fix: [
        missingBins.length > 0 ? "Run: pnpm install" : null,
        prismaClientOk ? null : "Run: pnpm db:generate",
      ]
        .filter(Boolean)
        .join(" + "),
    },
  );
} else {
  check("build readiness", false, "skipped — dependencies missing", {
    fix: "Run: pnpm install && pnpm db:generate",
  });
}

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`FlowPilot doctor — ${osDetail}\n`);
for (const r of results) {
  const icon = r.pass ? "✅" : r.blocking ? "❌" : "⚠️ ";
  console.log(`${icon} ${r.name.padEnd(26)} ${r.detail}`);
  if (!r.pass && r.fix) console.log(`   → fix: ${r.fix}`);
}

const failures = results.filter((r) => !r.pass && r.blocking);
console.log("");
if (failures.length === 0) {
  console.log("RESULT: READY ✅  — you can run scripts/dev.sh (or pnpm dev).");
  process.exit(0);
}
console.log(
  `RESULT: NOT READY ❌ — ${failures.length} blocking issue(s) above.`,
);
console.log("Apply the fixes (→), then re-run: pnpm run doctor");
process.exit(1);
