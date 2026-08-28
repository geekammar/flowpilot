#!/usr/bin/env node
// FlowPilot deploy — gated deployment commands for Vercel.
//   node scripts/deploy.mjs check    → env validation + full quality gate
//   node scripts/deploy.mjs preview  → env + build validation → preview deploy
//   node scripts/deploy.mjs prod     → env + full quality gate → production deploy
// Every mode stops at the first failed gate and explains what to do next.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { platform, release } from "node:os";

const isTermux =
  Boolean(process.env.TERMUX_VERSION) ||
  (process.env.PREFIX ?? "").includes("com.termux") ||
  (platform() === "linux" && /android/i.test(release()));

const mode = process.argv[2] ?? "";
const MODES = { check: true, preview: true, prod: true };

if (!MODES[mode]) {
  console.error(
    "Usage: node scripts/deploy.mjs <check|preview|prod>\n" +
      "  check   — validate environment + run the full quality gate (no deploy)\n" +
      "  preview — validate environment + build, then create a preview deployment\n" +
      "  prod    — validate environment + full gate, then deploy to production",
  );
  process.exit(1);
}

const run = (label, cmd, args) => {
  console.log(`\n▶ ${label} — ${cmd} ${args.join(" ")}`);
  const t0 = Date.now();
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);
  const code = result.status ?? 1;
  if (code !== 0) {
    console.log(`✗ ${label} FAILED (exit ${code}) after ${seconds}s`);
  } else {
    console.log(`✓ ${label} passed in ${seconds}s`);
  }
  return code === 0;
};

const fail = (message) => {
  console.log(`\nDEPLOYMENT ABORTED ❌\n${message}`);
  process.exit(1);
};

console.log(
  `FlowPilot deploy (${mode}) — ${platform()}${isTermux ? " / Termux" : ""}`,
);

// ── Gate 1: environment ──────────────────────────────────────────────────────
console.log("\n──────────── gate 1/2: environment ────────────");
if (!run("vercel:check", "node", ["scripts/vercel-check.mjs"])) {
  fail(
    "Environment validation failed.\n" +
      "   → Local: fix .env.local.  Vercel: Project → Settings → Environment Variables\n" +
      "     (all four variables must exist for BOTH Production and Preview before building).\n" +
      "   → Re-run: pnpm vercel:check",
  );
}

// ── Gate 2: build/quality ────────────────────────────────────────────────────
const buildStep = isTermux ? ["exec", "next", "build", "--webpack"] : ["build"];

if (mode === "check") {
  console.log("\n──────────── gate 2/2: quality gate ───────────");
  if (!run("verify (lint + typecheck + format + build)", "pnpm", ["verify"])) {
    fail(
      "Quality gate failed — the repository is not deployable as-is.\n" +
        "   → Fix the failing step(s) above, then re-run: pnpm deploy:check",
    );
  }
  console.log(
    "\nDEPLOYMENT READY ✅\n" +
      "Environment valid and all quality gates green.\n" +
      "Next: push to GitHub and import the repo in Vercel (docs/VERCEL_DEPLOYMENT.md),\n" +
      "or deploy from this machine: pnpm deploy:preview / pnpm deploy:vercel",
  );
  process.exit(0);
}

const qualitySteps =
  mode === "prod"
    ? [["verify (lint + typecheck + format + build)", "pnpm", ["verify"]]]
    : [
        ["typecheck", "pnpm", ["typecheck"]],
        [isTermux ? "build (webpack — Termux)" : "build", "pnpm", buildStep],
      ];

console.log("\n──────────── gate 2/2: build validation ───────");
for (const [label, cmd, args] of qualitySteps) {
  if (!run(label, cmd, args)) {
    fail(
      `${label} failed — the current tree would not build on Vercel.\n` +
        "   → Fix the errors above, then re-run this command.",
    );
  }
}

// ── Deploy ───────────────────────────────────────────────────────────────────
const vercelBin = spawnSync("vercel", ["--version"], {
  encoding: "utf8",
  shell: process.platform === "win32",
}).status;

const vercel = vercelBin === 0 ? "vercel" : null;

if (!existsSync(".vercel/project.json")) {
  fail(
    "This directory is not linked to a Vercel project yet.\n" +
      (vercel
        ? "   → Run: vercel link   (once; follow the prompts)"
        : "   → Run: pnpm dlx vercel@latest link   (once; follow the prompts)") +
      "\n   → Prefer the GitHub-connected flow instead? See docs/VERCEL_DEPLOYMENT.md Section 2.",
  );
}

const deployArgs = mode === "prod" ? ["deploy", "--prod"] : ["deploy"];
const deployLabel =
  mode === "prod" ? "production deployment" : "preview deployment";

console.log(`\n──────────── deploying: ${deployLabel} ────────`);
if (vercel) {
  if (!run(deployLabel, "vercel", deployArgs)) {
    fail(
      "Vercel CLI reported an error — read its output above.\n" +
        "   → Common causes: not logged in (vercel login), missing project env vars,\n" +
        "     or the database is unreachable from the build.",
    );
  }
} else {
  console.log(
    "vercel CLI not found locally — using pnpm dlx vercel@latest (downloads on first use).",
  );
  if (!run(deployLabel, "pnpm", ["dlx", "vercel@latest", ...deployArgs])) {
    fail(
      "Vercel CLI reported an error — read its output above.\n" +
        "   → Common causes: not logged in, missing project env vars,\n" +
        "     or the database is unreachable from the build.",
    );
  }
}

console.log(
  `\n${mode === "prod" ? "PRODUCTION" : "PREVIEW"} DEPLOYED ✅\n` +
    "Validate it: open <deployment-url>/api/health — expect\n" +
    '  {"status":"ok","version":"0.1.0","environment":"production"}\n' +
    "Full validation checklist: docs/VERCEL_DEPLOYMENT.md Section 5.",
);
