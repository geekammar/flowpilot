#!/usr/bin/env node
// Points git at the repo-managed hooks directory (.githooks).
// Idempotent; run via `pnpm run hooks:install`. No dependencies — this is
// deliberately NOT husky/lefthook (no new tooling per project rules).
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

if (!existsSync(join(root, ".git"))) {
  console.error("❌ Not a git repository — clone the project first.");
  process.exit(1);
}
if (!existsSync(join(root, ".githooks", "pre-commit"))) {
  console.error(
    "❌ .githooks/pre-commit missing — repository looks incomplete.",
  );
  process.exit(1);
}

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { cwd: root });
  const current = execFileSync("git", ["config", "core.hooksPath"], {
    cwd: root,
    encoding: "utf8",
  }).trim();
  console.log(`✅ git hooks installed (core.hooksPath=${current}).`);
  console.log("   pre-commit now blocks secrets, credentials, and env files.");
  console.log("   Remove anytime with: git config --unset core.hooksPath");
} catch (error) {
  console.error(`❌ Failed to set core.hooksPath: ${error.message}`);
  process.exit(1);
}
