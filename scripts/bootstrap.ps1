# FlowPilot bootstrap — Windows (PowerShell 5.1+ / PowerShell 7).
# Verifies node, pnpm, git, gh. Installs ONLY what is missing, then runs the
# project one-command setup (env file + dependencies + Prisma client).
# Run:  powershell -ExecutionPolicy Bypass -File scripts\bootstrap.ps1

$ErrorActionPreference = "Stop"
$PNPM_VERSION = "11.24.0" # must match "packageManager" in package.json
$MIN_NODE_MAJOR = 20

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step($msg) { Write-Host "> $msg" -ForegroundColor Green }
function Write-Ok($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn2($msg){ Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "[X] $msg" -ForegroundColor Red; exit 1 }

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }
function Test-Works($exe, $args) {
    try { & $exe @args *> $null; return $LASTEXITCODE -eq 0 } catch { return $false }
}

Write-Step "FlowPilot bootstrap - Windows PowerShell $($PSVersionTable.PSVersion)"

function Install-Winget($id, $label) {
    if (Test-Cmd winget) {
        Write-Step "Installing $label via winget…"
        winget install --id $id -e --accept-source-agreements --accept-package-agreements
        return $true
    }
    return $false
}

# -- node --------------------------------------------------------------------
if ((Test-Cmd node) -and (Test-Works node @("--version"))) {
    $nodeMajor = [int]((node --version).TrimStart("v").Split(".")[0])
    if ($nodeMajor -lt $MIN_NODE_MAJOR) {
        Write-Fail "node $(node --version) is too old (need >= v$MIN_NODE_MAJOR). Upgrade from https://nodejs.org, then re-run."
    }
    Write-Ok "node $(node --version) already installed - skipping"
}
else {
    if (Install-Winget "OpenJS.NodeJS.LTS" "Node.js LTS") {
        # Refresh PATH for this session (winget installs to standard locations)
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    }
    else {
        Write-Fail "winget missing or failed. Install Node.js >= $MIN_NODE_MAJOR manually: https://nodejs.org — then re-run."
    }
    if (-not (Test-Cmd node)) { Write-Fail "node installed but not on PATH. Open a NEW terminal and re-run this script." }
    Write-Ok "node $(node --version) installed"
}

# -- pnpm --------------------------------------------------------------------
if ((Test-Cmd pnpm) -and (Test-Works pnpm @("--version"))) {
    Write-Ok "pnpm $(pnpm --version) already installed - skipping"
}
else {
    Write-Step "Installing pnpm@$PNPM_VERSION…"
    $installed = $false
    if (Test-Cmd corepack) {
        corepack enable
        if ($?) { corepack prepare "pnpm@$PNPM_VERSION" --activate; $installed = $? }
    }
    if (-not $installed) {
        if (-not (Test-Cmd npm)) { Write-Fail "npm missing - node installation looks incomplete." }
        npm install -g "pnpm@$PNPM_VERSION"
    }
    if (-not ((Test-Cmd pnpm) -and (Test-Works pnpm @("--version")))) {
        Write-Fail "pnpm installed but not runnable. Open a NEW terminal and re-run this script."
    }
    Write-Ok "pnpm $(pnpm --version) installed"
}

# -- git ---------------------------------------------------------------------
if ((Test-Cmd git) -and (Test-Works git @("--version"))) {
    Write-Ok "git $(git --version) already installed - skipping"
}
else {
    if (Install-Winget "Git.Git" "Git") {
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    }
    else {
        Write-Fail "Could not install git automatically. Install from https://git-scm.com, then re-run."
    }
    if (-not (Test-Cmd git)) { Write-Fail "git installed but not on PATH. Open a NEW terminal and re-run this script." }
    Write-Ok "git installed"
}

# -- gh (best effort - never blocks) -----------------------------------------
if ((Test-Cmd gh) -and (Test-Works gh @("--version"))) {
    Write-Ok "gh already installed - skipping"
}
else {
    if (Install-Winget "GitHub.cli" "GitHub CLI") {
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        if (Test-Cmd gh) { Write-Ok "gh installed" } else { Write-Warn2 "gh installed but not on PATH - open a new terminal to use it." }
    }
    else {
        Write-Warn2 "gh could not be installed automatically. See https://cli.github.com/ - only needed for GitHub workflows."
    }
}

# -- project setup -----------------------------------------------------------
# NOTE: "pnpm run" is required - pnpm has built-in setup/doctor commands
# that would otherwise shadow the package.json scripts.
Write-Step "Running project setup (pnpm run setup)…"
pnpm run setup

Write-Step "Running diagnostics…"
try { pnpm run doctor } catch { Write-Warn2 "doctor reported issues (expected until DATABASE_URL is set in .env.local)." }

Write-Host ""
Write-Ok "Bootstrap complete. Next: set DATABASE_URL in .env.local, then run scripts\dev.ps1"
