#!/usr/bin/env node
// FlowPilot ship — lightweight operator release path (DECISIONS #26).
//
// For routine shipping after a finished prompt whose full quality gate
// (`pnpm verify`) already passed: version bump → one conventional commit
// (pre-commit hook stays active) → annotated tag vX.Y.Z → push main + tag
// → published GitHub Release. It does NOT re-run the full build gate, does
// not deploy, and does not touch the database. The full gated path
// (`pnpm release`, DECISIONS #18) is unchanged for recovery / high-confidence
// releases.
//
// Usage:
//   pnpm ship patch               0.14.0 → 0.14.1   commit: fix: release …
//   pnpm ship minor               0.14.0 → 0.15.0   commit: feat: release …
//   pnpm ship --version 0.14.0    explicit target (must be > current)
//   pnpm ship --help
//
// Safety: main-branch only; refuses existing tags (local + origin), major
// bumps, and non-fast-forward pushes; no force flags anywhere; a failure
// after a successful push prints the exact manual recovery command.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = join(root, "package.json");
const SECURITY_SCRIPT = join(root, "scripts", "security-check.mjs");
const BUILD_STATE = join(root, "docs", "BUILD_STATE.md");

const USAGE = `FlowPilot ship — lightweight operator release

Usage:
  pnpm ship patch               bump patch   (0.14.0 → 0.14.1)
  pnpm ship minor               bump minor   (0.14.0 → 0.15.0)
  pnpm ship --version 0.14.0    explicit version (must be > current)
  pnpm ship help                this help (pnpm intercepts --help;
                               pnpm run ship --help also works)

Performs: version bump → one conventional commit (pre-commit hook active)
→ annotated tag v<version> → push main + tag → published GitHub Release.
Does NOT re-run the full quality gate (the prompt's \`pnpm verify\` is the
gate), does not deploy, does not touch the database.

Full gated path (gh auth → doctor → verify → security): pnpm release
See docs/RELEASE_PROCESS.md → Lightweight Operator Ship.`;

// ── helpers ──────────────────────────────────────────────────────────────────
const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  });
  return {
    ok: r.status === 0,
    stdout: (r.stdout ?? "").trim(),
    stderr: (r.stderr ?? "").trim(),
  };
};

const fail = (msg, hint) => {
  console.error(`\n✗ ${msg}`);
  if (hint) console.error(`  → ${hint}`);
  process.exit(1);
};

const ok = (msg) => console.log(`  ✓ ${msg}`);
const warn = (msg) => console.log(`  ⚠ ${msg}`);
const step = (n, label) => console.log(`\n[${n}/6] ${label}`);

// ── version math ─────────────────────────────────────────────────────────────
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const parseVersion = (v) => v.split(".").map(Number);
const compareVersions = (a, b) => {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
};

// ── argument parsing ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args[0] === "help" || args.includes("--help") || args.includes("-h")) {
  console.log(USAGE);
  process.exit(0);
}

let bumpKind = null; // "patch" | "minor" | null (explicit version)
let explicitVersion = null;

if (args.length === 0) {
  console.error(USAGE);
  process.exit(1);
} else if (args[0] === "--version") {
  if (args.length !== 2) {
    fail(
      "--version requires exactly one value: pnpm ship --version 0.14.0",
      "or use a bare version: pnpm ship 0.14.0",
    );
  }
  explicitVersion = args[1];
  if (!VERSION_RE.test(explicitVersion)) {
    fail(`invalid version "${explicitVersion}" — expected X.Y.Z (e.g. 0.14.0)`);
  }
} else if (args.length !== 1) {
  fail(`unexpected arguments: ${args.join(" ")}`, USAGE);
} else if (args[0] === "patch" || args[0] === "minor") {
  bumpKind = args[0];
} else if (args[0] === "major") {
  fail(
    "major bumps are not supported by pnpm ship — only patch and minor are allowed (pre-1.0; see docs/RELEASE_PROCESS.md → Versioning)",
    "for a major release, make an operator decision first, then use the full gated path: pnpm release",
  );
} else if (VERSION_RE.test(args[0])) {
  explicitVersion = args[0];
} else {
  fail(
    `unknown bump type "${args[0]}" — use: pnpm ship patch | pnpm ship minor | pnpm ship --version X.Y.Z`,
  );
}

// ── pre-flight: git, branch, package.json version ────────────────────────────
if (!run("git", ["--version"]).ok) {
  fail("git is not available on PATH");
}
if (!run("git", ["rev-parse", "--is-inside-work-tree"]).ok) {
  fail("not inside a git repository — run ship from the FlowPilot repository");
}

const branch = run("git", ["branch", "--show-current"]).stdout;
if (branch !== "main") {
  fail(
    `not on main (currently: ${branch || "detached HEAD"}) — releases happen from main`,
  );
}

if (!existsSync(pkgPath)) {
  fail("package.json not found — run ship from the FlowPilot repository");
}

let pkgRaw;
let currentVersion;
try {
  pkgRaw = readFileSync(pkgPath, "utf8");
  currentVersion = JSON.parse(pkgRaw).version;
} catch {
  fail("package.json could not be read or is not valid JSON");
}
if (typeof currentVersion !== "string" || !VERSION_RE.test(currentVersion)) {
  fail(
    `package.json version is not a valid X.Y.Z version: ${JSON.stringify(currentVersion)}`,
  );
}

const parseCurrent = parseVersion(currentVersion);
let targetVersion;
if (explicitVersion) {
  targetVersion = explicitVersion;
  if (compareVersions(parseVersion(explicitVersion), parseCurrent) <= 0) {
    fail(
      `target version ${explicitVersion} must be greater than the current package.json version ${currentVersion}`,
      "never move a version backwards; if package.json is stale after an interrupted ship, restore it first: git checkout -- package.json",
    );
  }
} else {
  const [maj, min, pat] = parseCurrent;
  targetVersion =
    bumpKind === "patch" ? `${maj}.${min}.${pat + 1}` : `${maj}.${min + 1}.0`;
}
const targetTag = `v${targetVersion}`;
const commitType =
  bumpKind === "patch" ||
  (explicitVersion && parseVersion(explicitVersion)[2] > 0)
    ? "fix"
    : "feat";
const commitMessage = `${commitType}: release ${targetTag}`;

// ── release context (titles/notes come only from real repo data) ─────────────
const deriveTitle = () => {
  if (existsSync(BUILD_STATE)) {
    const m = /^>\s*Last updated:\s*(.+?)\s*$/m.exec(
      readFileSync(BUILD_STATE, "utf8"),
    );
    if (m) {
      let t = m[1].replace(/\.$/, "");
      const inner = /^PROMPT-[\d.]+\s*\((.+)\)$/i.exec(t);
      if (inner) t = inner[1];
      t = t.trim();
      if (t) return t.length > 64 ? `${t.slice(0, 61)}…` : t;
    }
  }
  return bumpKind ? `${bumpKind} release` : "release";
};

const previousTag = () => {
  const r = run("git", ["describe", "--tags", "--abbrev=0"]);
  return r.ok ? r.stdout : null;
};

const capLines = (lines, max) =>
  lines.length <= max
    ? lines
    : [...lines.slice(0, max), `- … and ${lines.length - max} more`];

const buildNotes = (title, prevTag) => {
  const logArgs = ["log", "--format=- %s (%h)"];
  if (prevTag) logArgs.push(`${prevTag}..HEAD`);
  else logArgs.push("-n", "15");
  const commits = capLines(
    run("git", logArgs).stdout.split("\n").filter(Boolean),
    15,
  );
  const diffArgs = ["diff", "--name-only"];
  if (prevTag) diffArgs.push(`${prevTag}..HEAD`);
  else diffArgs.push("HEAD^", "HEAD");
  const fileCount = run("git", diffArgs)
    .stdout.split("\n")
    .filter(Boolean).length;
  return [
    `## FlowPilot ${targetTag} — ${title}`,
    "",
    `Shipped with \`pnpm ship\` (${bumpKind ?? "explicit version"} bump) after the prompt's \`pnpm verify\` quality gate passed — ship does not re-run the full gate.`,
    "",
    `Commits since ${prevTag ?? "the beginning of history"}:`,
    ...commits,
    "",
    `Changed files in this range: ${fileCount}.`,
    "",
    "Current state and known limitations: `docs/BUILD_STATE.md`.",
  ].join("\n");
};

// ── plan ─────────────────────────────────────────────────────────────────────
console.log("FlowPilot ship — lightweight operator release\n");
console.log("Release:");
console.log(`  current:  v${currentVersion}`);
console.log(`  target:   v${targetVersion}`);
console.log(`  tag:      ${targetTag}`);
console.log(`  branch:   ${branch}`);

// ── [1/6] validate ───────────────────────────────────────────────────────────
step(1, "Validate");

if (run("git", ["rev-parse", "-q", "--verify", `refs/tags/${targetTag}`]).ok) {
  fail(
    `tag ${targetTag} already exists locally — never move an existing tag`,
    "choose a different version (patch/minor bumps always produce a fresh one)",
  );
}
ok(`tag ${targetTag} is free locally`);

const origin = run("git", ["remote", "get-url", "origin"]);
if (!origin.ok) {
  fail(
    "origin remote is not configured — ship only publishes to an existing origin",
    "initial repository setup is done by the full path: pnpm release (scripts/release.sh)",
  );
}

const remoteTag = run("git", [
  "ls-remote",
  "--tags",
  "origin",
  `refs/tags/${targetTag}`,
]);
if (!remoteTag.ok) {
  fail(
    "could not query origin for existing tags (network / auth problem)",
    "check connectivity and the remote URL, then re-run ship",
  );
}
if (remoteTag.stdout) {
  fail(
    `tag ${targetTag} already exists on origin — never move an existing tag`,
    "choose a different version, or delete the remote release/tag deliberately (docs/RELEASE_PROCESS.md → Rollback / Recovery)",
  );
}
ok(`tag ${targetTag} is free on origin`);

const remoteMain = run("git", ["ls-remote", "origin", "refs/heads/main"]);
if (!remoteMain.ok) {
  fail("could not query origin/main (network / auth problem)");
}
if (remoteMain.stdout) {
  const remoteSha = remoteMain.stdout.split("\t")[0];
  const ancestor = run("git", [
    "merge-base",
    "--is-ancestor",
    remoteSha,
    "HEAD",
  ]);
  if (!ancestor.ok) {
    fail(
      "origin/main has commits that are not in local main — pushing would be rejected",
      "git pull --rebase origin main, resolve, then re-run ship (never force-push)",
    );
  }
  ok("origin/main is an ancestor of local main (push will fast-forward)");
} else {
  warn("origin/main does not exist yet — the push will create it");
}

if (!run("gh", ["--version"]).ok) {
  fail("gh CLI is not installed — see https://cli.github.com/");
}
if (!run("gh", ["auth", "status"]).ok) {
  fail(
    "not authenticated with GitHub",
    "gh auth login  (GitHub.com → HTTPS → browser), then re-run ship",
  );
}
if (!run("gh", ["repo", "view", "--json", "name"]).ok) {
  fail(
    "gh cannot access the origin repository (auth / scopes / visibility)",
    "check gh auth status and the repository visibility, then re-run ship",
  );
}
ok("gh authenticated with repository access");

if (!run("git", ["config", "core.hooksPath"]).stdout) {
  warn(
    "pre-commit hook is not installed (core.hooksPath unset) — run: pnpm run hooks:install",
  );
}

const security = spawnSync(process.execPath, [SECURITY_SCRIPT], {
  cwd: root,
  stdio: "inherit",
});
if ((security.status ?? 1) !== 0) {
  fail(
    "security check found secrets in committable files — nothing was changed yet",
    "resolve the findings above (move secrets to .env.local), then re-run ship",
  );
}
ok("security check clean");

for (const diffArgs of [
  ["diff", "--check"],
  ["diff", "--cached", "--check"],
]) {
  const r = run("git", diffArgs);
  if (!r.ok) {
    fail(
      `git ${diffArgs.join(" ")} found problems (conflict markers / whitespace errors)`,
      r.stdout || r.stderr || undefined,
    );
  }
}
ok("git diff --check clean (no conflict markers / whitespace errors)");

const latestTag = previousTag();
if (latestTag && latestTag !== `v${currentVersion}`) {
  warn(
    `latest tag ${latestTag} ≠ package.json version ${currentVersion} — proceeding; verify the target above is intended`,
  );
}

// ── [2/6] version bump ───────────────────────────────────────────────────────
step(2, "Version bump");
const versionLine = /^(\s*"version"\s*:\s*")(\d+\.\d+\.\d+)(")/m;
if (!versionLine.test(pkgRaw)) {
  fail('could not locate the "version" field in package.json');
}
writeFileSync(pkgPath, pkgRaw.replace(versionLine, `$1${targetVersion}$3`));
console.log(
  `  package.json: "version": "${currentVersion}" → "${targetVersion}"`,
);

// ── [3/6] commit ─────────────────────────────────────────────────────────────
step(3, "Commit");
const add = run("git", ["add", "-A"]);
if (!add.ok) {
  writeFileSync(pkgPath, pkgRaw);
  fail("git add failed — the version bump was rolled back", add.stderr);
}
const stagedFiles = run("git", ["diff", "--cached", "--name-only"])
  .stdout.split("\n")
  .filter(Boolean);
if (stagedFiles.length === 0) {
  writeFileSync(pkgPath, pkgRaw);
  fail(
    "nothing to commit — a release needs the prompt's changes (or at least the version bump)",
    "this should not happen; if it does, inspect: git status",
  );
}
console.log(`  files to be committed (${stagedFiles.length}):`);
for (const file of capLines(stagedFiles, 50)) console.log(`    ${file}`);

const commit = run("git", ["commit", "-m", commitMessage]);
if (!commit.ok) {
  writeFileSync(pkgPath, pkgRaw);
  run("git", ["add", pkgPath]);
  if (commit.stdout || commit.stderr)
    console.error(commit.stdout || commit.stderr);
  fail(
    "commit failed — the version bump was rolled back; staged prompt changes are untouched; no tag, no push, no release",
    "the pre-commit hook or git rejected the commit (see output above)",
  );
}
const sha = run("git", ["rev-parse", "--short", "HEAD"]).stdout;
ok(`committed ${sha} — ${commitMessage}`);

// ── [4/6] annotated tag ──────────────────────────────────────────────────────
step(4, "Annotated tag");
const title = deriveTitle();
const tagMessage = `FlowPilot ${targetTag} — ${title}`;
const tag = run("git", ["tag", "-a", targetTag, "-m", tagMessage]);
if (!tag.ok) {
  if (tag.stderr) console.error(tag.stderr);
  fail(
    "tag creation failed — the release commit exists locally, but nothing was pushed",
    `recovery: git tag -a ${targetTag} -m "${tagMessage}" && git push origin main && git push origin ${targetTag} && gh release create ${targetTag} --verify-tag --title "${tagMessage}" --notes "…"`,
  );
}
ok(`${targetTag} — "${tagMessage}"`);

// ── [5/6] push ───────────────────────────────────────────────────────────────
step(5, "Push");
const pushMain = run("git", ["push", "origin", "main"]);
if (!pushMain.ok) {
  if (pushMain.stderr) console.error(pushMain.stderr);
  fail(
    "push of main failed — the commit and tag exist locally only; nothing was published",
    `recovery: fix the cause above, then: git push origin main && git push origin ${targetTag} && gh release create ${targetTag} --verify-tag
if main was rejected as non-fast-forward: git tag -d ${targetTag} && git pull --rebase origin main && git tag -a ${targetTag} -m "${tagMessage}" && git push origin main && git push origin ${targetTag} (never force-push)`,
  );
}
ok("origin main updated");

const pushTag = run("git", ["push", "origin", targetTag]);
if (!pushTag.ok) {
  if (pushTag.stderr) console.error(pushTag.stderr);
  fail(
    `push of ${targetTag} failed — main IS already published; the tag is not`,
    `recovery: git push origin ${targetTag} && gh release create ${targetTag} --verify-tag --title "${tagMessage}" --notes "…"`,
  );
}
ok(`origin ${targetTag} pushed`);

// ── [6/6] GitHub Release ─────────────────────────────────────────────────────
step(6, "GitHub Release");
const notes = buildNotes(title, latestTag);
const releaseTitle = tagMessage;
if (run("gh", ["release", "view", targetTag]).ok) {
  warn(`GitHub Release for ${targetTag} already exists — skipping creation`);
} else {
  const release = run("gh", [
    "release",
    "create",
    targetTag,
    "--verify-tag",
    "--title",
    releaseTitle,
    "--notes",
    notes,
  ]);
  if (!release.ok) {
    if (release.stderr) console.error(release.stderr);
    fail(
      "GitHub Release creation failed — the commit and tag are ALREADY published on origin",
      `manual recovery: gh release create ${targetTag} --verify-tag --title "${releaseTitle}" --notes "<notes>"`,
    );
  }
}
const releaseUrl = run("gh", [
  "release",
  "view",
  targetTag,
  "--json",
  "url",
  "--jq",
  ".url",
]).stdout;
ok(`published: ${releaseTitle}`);
if (releaseUrl) console.log(`  ${releaseUrl}`);

// ── summary ──────────────────────────────────────────────────────────────────
console.log("\nSHIP COMPLETE\n");
console.log(`Version: ${targetTag}`);
console.log(`Commit: ${sha}`);
console.log(`Tag: ${targetTag}`);
console.log("GitHub Release: published");
