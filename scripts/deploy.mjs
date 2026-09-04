#!/usr/bin/env node
// FlowPilot deploy — gated deployment commands for Vercel.
//
//   pnpm deploy               production deployment (full gate → vercel deploy --prod → URL)
//   pnpm deploy:production    same as `pnpm deploy` (explicit alias)
//   pnpm deploy:preview       preview deployment  (full gate → vercel deploy → preview URL)
//   pnpm deploy:check         readiness gate only (no deploy) → READY / NOT READY
//
// Every mode: pre-deploy gate (environment → Prisma → database → auth → demo
// data (DEMO_MODE) → build) → Vercel authentication & link pre-flight →
// deploy → deployment URL. Stops at the first failed gate and explains the fix.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { platform, release } from "node:os";

const isTermux =
  Boolean(process.env.TERMUX_VERSION) ||
  (process.env.PREFIX ?? "").includes("com.termux") ||
  (platform() === "linux" && /android/i.test(release()));

const arg = process.argv[2] ?? "prod";
const MODES = { check: true, preview: true, prod: true, deploy: true };
const mode = MODES[arg] ? arg : null;

if (!mode) {
  console.error(
    "Usage: pnpm deploy [production|preview|check]\n" +
      "  (default) / production — full pre-deploy gate → Vercel production deploy → URL\n" +
      "  preview                — full pre-deploy gate → Vercel preview deploy → URL\n" +
      "  check                  — run the pre-deploy gate only (READY / NOT READY)\n" +
      "Also available: pnpm deploy:production · pnpm deploy:preview · pnpm deploy:check",
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

// Matches every way the Vercel CLI says "you are not logged in".
const NEEDS_LOGIN =
  /no existing credentials|not logged in|logged out|please run .?vercel login|`vercel login`/i;

const fail = (message) => {
  console.log(`\nDEPLOYMENT ABORTED ❌\n${message}`);
  process.exit(1);
};

console.log(
  `FlowPilot deploy (${mode === "deploy" ? "production" : mode}) — ${platform()}${isTermux ? " / Termux" : ""}`,
);

// ── Gate 1: pre-deploy readiness (env → prisma → database → auth → demo → build) ──
console.log("\n──────────── gate 1/2: pre-deploy readiness ────────────");
if (!run("pre-deploy check", "node", ["scripts/pre-deploy.mjs"])) {
  fail(
    "The repository is not deployment-ready.\n" +
      "   → The report above lists every issue with its fix.\n" +
      "   → Re-run the gate alone: pnpm deploy:check",
  );
}

if (mode === "check") {
  console.log(
    "\nDEPLOYMENT READY ✅\n" +
      "Next: pnpm deploy            (production — shareable URL)\n" +
      "      pnpm deploy:preview    (throwaway preview URL)\n" +
      "First time on this machine? docs/VERCEL_DEPLOYMENT.md Section 0 — quick deploy.",
  );
  process.exit(0);
}

// ── Gate 2: Vercel CLI, authentication, project link ─────────────────────────
console.log("\n──────────── gate 2/2: Vercel CLI ────────────");
const vercelBin = spawnSync("vercel", ["--version"], {
  encoding: "utf8",
  shell: process.platform === "win32",
}).status;
const vercel = vercelBin === 0 ? "vercel" : null;
const vercelCmd = vercel ?? "pnpm";
const vercelBase = vercel ? [] : ["dlx", "vercel@latest"];
if (!vercel) {
  console.log(
    "vercel CLI not found locally — using pnpm dlx vercel@latest (downloads on first use).",
  );
}

const whoami = spawnSync(vercelCmd, [...vercelBase, "whoami"], {
  encoding: "utf8",
  shell: process.platform === "win32",
  timeout: 120_000,
});
const whoamiOut = `${whoami.stdout ?? ""}${whoami.stderr ?? ""}`;
const authenticated = whoami.status === 0 && !NEEDS_LOGIN.test(whoamiOut);
if (!authenticated) {
  fail(
    "Not logged in to Vercel.\n" +
      `   → Run: ${vercel ? "vercel login" : "pnpm dlx vercel@latest login"}   (once per machine; follow the prompts)\n` +
      "   → Then re-run this command.\n" +
      "   No account yet? Sign up at https://vercel.com (free Hobby plan is enough for pilots).",
  );
}
console.log(
  `✓ authenticated as ${whoamiOut.trim().split("\n").pop() ?? "(unknown)"}`,
);

if (!existsSync(".vercel/project.json")) {
  fail(
    "This directory is not linked to a Vercel project yet.\n" +
      `   → Run: ${vercel ? "vercel link" : "pnpm dlx vercel@latest link"}   (once; follow the prompts)\n` +
      "   → Prefer the GitHub-connected flow instead? See docs/VERCEL_DEPLOYMENT.md\n" +
      "     (push + Vercel import — then every push to main redeploys automatically).",
  );
}

// ── Deploy (live output, captured for the URL) ───────────────────────────────
const deployArgs = [
  ...vercelBase,
  "deploy",
  ...(mode === "preview" ? [] : ["--prod"]),
];
const deployLabel =
  mode === "preview" ? "preview deployment" : "production deployment";

console.log(`\n──────────── deploying: ${deployLabel} ────────`);
const url = await runLive(deployLabel, vercelCmd, deployArgs);

if (url === null) {
  fail(
    "Vercel CLI reported an error — read its output above.\n" +
      "   → Common causes: not logged in (vercel login), missing project env vars\n" +
      "     (all four, for Production and Preview — Vercel → Settings → Environment\n" +
      "     Variables), or the database being unreachable from the build.",
  );
}

// ── Result ───────────────────────────────────────────────────────────────────
console.log(
  `\n${mode === "preview" ? "PREVIEW" : "PRODUCTION"} DEPLOYED ✅\n` +
    `Deployment URL: ${url}\n` +
    "\nValidate (30 seconds):\n" +
    `  1. ${url}/api/health → expect {"status":"ok","deploymentReady":true,…}\n` +
    "  2. /sign-in → admin@flowpilot.app / Admin@1234 (requires demo data on the DB:\n" +
    '     DEMO_MODE="true" in .env.local, or run: pnpm db:seed)\n' +
    (mode === "preview"
      ? "\n⚠️  Preview URL: auth may not work here (trustedOrigins covers the production\n" +
        "   URL only) — use `pnpm deploy` (production) for anything you share with a prospect.\n"
      : "\nShare it: this URL is demo-ready. Walkthrough + credentials package:\n" +
        "   docs/CLIENT_DEMO.md\n") +
    "Full validation checklist: docs/VERCEL_DEPLOYMENT.md Section 5.",
);

/** Run a command with live output; return the deployment URL, or null on failure. */
function runLive(label, cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      shell: process.platform === "win32",
    });
    let output = "";
    const onData = (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);

    child.on("error", (error) => {
      console.log(`✗ ${label} could not start: ${error.message}`);
      resolve(null);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        if (NEEDS_LOGIN.test(output)) {
          console.log(
            "\n✗ Vercel authentication required — run " +
              (vercel ? "vercel login" : "pnpm dlx vercel@latest login") +
              " and re-run this command.",
          );
        }
        console.log(`✗ ${label} FAILED (exit ${code})`);
        resolve(null);
        return;
      }
      resolve(parseDeploymentUrl(output));
    });
  });
}

/** Extract the deployment URL from `vercel deploy` output. */
function parseDeploymentUrl(output) {
  // Preferred: the "✅ Production: <url>" / "✅ Preview: <url>" line.
  const labeled =
    /^.*?(?:Production|Preview):\s*(https:\/\/\S+\.vercel\.app)/im.exec(output);
  if (labeled?.[1]) return labeled[1].replace(/\[.*$/, "");
  // Fallback: the last *.vercel.app URL in the output.
  const matches = output.match(/https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app/gi);
  return matches?.length ? matches[matches.length - 1] : null;
}
