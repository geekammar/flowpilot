# FlowPilot dev launcher — Windows (PowerShell 5.1+ / PowerShell 7).
# Ensures: dependencies installed -> Prisma client generated -> env file exists ->
# schema synced (best effort) -> starts the Next.js dev server.
# Run:  powershell -ExecutionPolicy Bypass -File scripts\dev.ps1

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Write-Step($msg) { Write-Host "> $msg" -ForegroundColor Cyan }
function Write-Warn2($msg){ Write-Host "[!] $msg" -ForegroundColor Yellow }

function Get-EnvVar($key) {
    foreach ($file in @(".env.local", ".env")) {
        if (Test-Path $file) {
            $line = Select-String -Path $file -Pattern "^\s*$key\s*=" | Select-Object -Last 1
            if ($line) {
                $value = $line.Line -replace "^\s*$key\s*=", ""
                return $value.Trim().Trim('"').Trim("'")
            }
        }
    }
    return $null
}

# -- 1. Dependencies ----------------------------------------------------------
if (-not (Test-Path "node_modules")) {
    Write-Step "node_modules missing - installing dependencies…"
    pnpm install
}
else { Write-Step "dependencies present - skipping install" }

# -- 2. Prisma client ---------------------------------------------------------
if (-not (Test-Path "src/generated/prisma")) {
    Write-Step "Prisma client missing - generating…"
    pnpm db:generate
}
else { Write-Step "Prisma client present - skipping generate" }

# -- 3. Environment -----------------------------------------------------------
if (-not (Test-Path ".env") -and -not (Test-Path ".env.local")) {
    Write-Step "No env file - creating .env.local…"
    node scripts/setup-env.mjs
}

# -- 4. Schema sync (best effort - never blocks the dev server) ---------------
$dbUrl = Get-EnvVar "DATABASE_URL"
$dbReady = $true
$placeholder = -not $dbUrl -or $dbUrl -match "user:password@" -or $dbUrl -match "replace-with"
if ($placeholder) {
    $dbReady = $false
    Write-Warn2 "DATABASE_URL not configured - skipping prisma db push (set it in .env.local)"
}
else {
    Write-Step "Syncing database schema (prisma db push)…"
    pnpm db:push
    if ($LASTEXITCODE -ne 0) {
        Write-Warn2 "prisma db push failed - continuing to the dev server. Check DATABASE_URL / network."
    }
}

# -- 5. Demo data (DEMO_MODE=true - best effort, never blocks) ----------------
$demoMode = Get-EnvVar "DEMO_MODE"
if ($demoMode -eq "true") {
    if ($dbReady) {
        Write-Step "DEMO_MODE=true - seeding Arabic demo data…"
        pnpm db:seed
        if ($LASTEXITCODE -ne 0) {
            Write-Warn2 "db:seed failed - continuing to the dev server."
        }
    }
    else {
        Write-Warn2 "DEMO_MODE=true but DATABASE_URL not ready - skipping demo seed."
    }
}

# -- 6. Dev server ------------------------------------------------------------
Write-Step "Starting Next.js dev server (Turbopack)…"
pnpm dev
