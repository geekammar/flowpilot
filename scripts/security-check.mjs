#!/usr/bin/env node
// FlowPilot security check — finds secrets before they leak.
// 1. Env-file hygiene: .env/.env.local must be gitignored and untracked.
// 2. Secret quality: placeholder/weak BETTER_AUTH_SECRET is a finding.
// 3. Content scan: well-known secret shapes (private keys, AWS/GitHub/Stripe/
//    Slack/Google tokens, credential URLs, keyword assignments) in files that
//    could be committed. `--staged` restricts the content scan to staged files
//    (used by the pre-commit hook); default scans tracked + untracked files.
// Matched values are NEVER printed — only file:line, kind, and key name.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stagedMode = process.argv.includes("--staged");

const findings = [];
const warn = (msg) => findings.push({ level: "warn", msg });
const bad = (msg, fix) => findings.push({ level: "error", msg, fix });

const git = (args) => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
};

// ── Filename patterns that must never be committed ──────────────────────────
// (.env.example is the documented exception — placeholders by design)
const FORBIDDEN_FILE = [
  /^\.env(\..+)?$/,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.|$)/, // SSH keys
  /\.(pem|key|p12|pfx|keystore)$/i, // key/certificate files
  /(^|\/)(service-account|credentials)[^/]*\.json$/i,
];
const isForbiddenFile = (file) =>
  file !== ".env.example" && FORBIDDEN_FILE.some((re) => re.test(file));

// ── Secret content patterns (value shapes, not words) ───────────────────────
const CONTENT_PATTERNS = [
  {
    kind: "private key",
    re: /-----BEGIN (RSA |EC |DSA |OPENSSH |PGP |)?PRIVATE KEY-----/,
  },
  { kind: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { kind: "GitHub token", re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  { kind: "GitHub fine-grained token", re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { kind: "Stripe secret key", re: /\b[sr]k_live_[A-Za-z0-9]{16,}\b/ },
  { kind: "API secret key (sk-…)", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { kind: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/ },
  { kind: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  {
    kind: "credential URL",
    re: /\b(postgres|postgresql|mysql|mongodb(\+srv)?|redis|rediss|amqp):\/\/[^\s"'@]+:[^\s"'@]+@[^\s"' ]+/,
    allow: (value) =>
      // documentation placeholders: user:password@, admin:pass@, x:pwd@, <…>, …, ${VAR}
      /:(password|pass|pwd)@/i.test(value) ||
      /[<>…]/.test(value) ||
      /\$\{/.test(value) ||
      /replace-with|your-|changeme/i.test(value),
  },
  {
    kind: "hardcoded credential assignment",
    re: /\b(password|passwd|secret|token|api_?key|apikey|access_?key|private_?key|client_?secret)\b\s*[:=]\s*["'][^"']{12,}["']/i,
    keyOf: (line) =>
      /^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*[:=]/.exec(line)?.[1] ?? "key",
    allow: (value) => {
      const v = value.toLowerCase();
      return (
        /replace-with|your-|changeme|placeholder|example|dummy|sample|xxxx|secret_here/.test(
          v,
        ) ||
        /^[<>]/.test(value) ||
        /\$\{/.test(value) ||
        value.includes("process.env.")
      );
    },
  },
];

const PLACEHOLDER_VALUES =
  /replace-with|user:password|your-|changeme|placeholder|<[^>]+>/i;

// ── 1. Env file hygiene ──────────────────────────────────────────────────────
const ENV_FILES = [".env", ".env.local"];
for (const file of ENV_FILES) {
  if (!existsSync(join(root, file))) continue;
  const ignored = git(["check-ignore", "-q", file]) !== null; // exit 0 → ignored
  const tracked =
    git(["ls-files", "--error-unmatch", file]) !== null ? true : false;
  if (tracked) {
    bad(
      `${file} is TRACKED by git — secrets would be committed.`,
      `git rm --cached ${file} && git commit -m "remove ${file}" (then rotate any secrets inside)`,
    );
  } else if (!ignored) {
    bad(
      `${file} exists but is NOT gitignored.`,
      "Add it to .gitignore (the repo already ignores .env* — check for a local override).",
    );
  }
}
if (existsSync(join(root, ".env")) && existsSync(join(root, ".env.local"))) {
  warn(
    "Both .env and .env.local exist — .env.local wins; keep exactly one to avoid confusion.",
  );
}

// ── 2. Secret quality in env files (values never printed) ───────────────────
const parseEnv = (path) => {
  const map = {};
  if (!existsSync(path)) return map;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (m) map[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return map;
};
const env = {
  ...parseEnv(join(root, ".env")),
  ...parseEnv(join(root, ".env.local")),
};

const authSecret = env.BETTER_AUTH_SECRET;
if (authSecret !== undefined) {
  if (PLACEHOLDER_VALUES.test(authSecret)) {
    bad(
      "BETTER_AUTH_SECRET is still the placeholder value.",
      "Generate a real one: node -e \"console.log(require('node:crypto').randomBytes(48).toString('base64'))\"",
    );
  } else if (authSecret.length < 32) {
    bad(
      `BETTER_AUTH_SECRET is too short (${authSecret.length} chars, needs ≥ 32).`,
      "Generate a real one: node -e \"console.log(require('node:crypto').randomBytes(48).toString('base64'))\"",
    );
  }
}

// ── 3. Content scan over committable files ───────────────────────────────────
const isTextFile = (path) => {
  try {
    const stat = statSync(path);
    if (stat.size > 1_500_000) return false;
    const content = readFileSync(path);
    return !content.subarray(0, 1024).includes(0);
  } catch {
    return false;
  }
};

let files = [];
if (stagedMode) {
  const out = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  files = out ? out.split("\n").filter(Boolean) : [];
} else {
  const out = git(["ls-files", "-co", "--exclude-standard"]);
  files = out ? out.split("\n").filter(Boolean) : [];
}

for (const file of files) {
  if (isForbiddenFile(file)) {
    bad(
      `forbidden file staged/tracked for commit: ${file}`,
      `git rm --cached "${file}" — env & key files must never be committed (move it to .env.local or a secret store)`,
    );
    continue;
  }
  if (file === ".env.example" || file === "pnpm-lock.yaml") continue;
  if (file.startsWith("src/generated/")) continue;
  const abs = join(root, file);
  if (!existsSync(abs) || !isTextFile(abs)) continue;

  const lines = readFileSync(abs, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const p of CONTENT_PATTERNS) {
      const m = p.re.exec(line);
      if (!m) continue;
      const value = m[0];
      if (p.allow?.(value)) continue;
      const key = p.keyOf ? p.keyOf(line) : "";
      bad(
        `${file}:${i + 1} — possible ${p.kind}${key ? ` (\`${key}\`)` : ""} [value redacted, ${value.length} chars]`,
        `Move the secret to .env.local (gitignored), reference it via process.env, and rotate it if it was ever committed.`,
      );
      break; // one finding per line
    }
  });
}

// ── Report ──────────────────────────────────────────────────────────────────
const mode = stagedMode ? " (staged files)" : "";
console.log(`FlowPilot security check${mode}\n`);
const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warn");

if (findings.length === 0) {
  console.log(
    "✅ No secrets, credentials, or env files at risk of being committed.",
  );
  process.exit(0);
}

for (const f of errors) {
  console.log(`❌ ${f.msg}`);
  if (f.fix) console.log(`   → fix: ${f.fix}`);
}
for (const f of warnings) console.log(`⚠️  ${f.msg}`);
console.log(
  `\nRESULT: ${errors.length > 0 ? "FAILED" : "PASSED (with warnings)"} — ${errors.length} error(s), ${warnings.length} warning(s).`,
);
process.exit(errors.length > 0 ? 1 : 0);
