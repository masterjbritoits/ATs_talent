#!/usr/bin/env pwsh
# run_ppt_pipeline.ps1 — ITSector PPT Agent Pipeline
# Uso:
#   .\run_ppt_pipeline.ps1                  # pipeline completo
#   .\run_ppt_pipeline.ps1 -DryRun          # sem gerar .pptx
#   .\run_ppt_pipeline.ps1 -StartFrom 2     # começa no Commercial Agent
#   .\run_ppt_pipeline.ps1 -Versions        # lista versões

param(
    [switch]$DryRun,
    [int]$StartFrom = 1,
    [switch]$Versions
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  ITSector PPT Agent Pipeline" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# ── Verificar Python ──────────────────────────────────────────────
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}
if (-not $python) {
    Write-Host "[ERRO] Python não encontrado. Instala Python 3.10+" -ForegroundColor Red
    exit 1
}
Write-Host "  Python: $($python.Source)" -ForegroundColor DarkGray

# ── Verificar/instalar dependências Python ─────────────────────────
Write-Host "  A verificar dependências..." -ForegroundColor DarkGray

$deps = @("anthropic", "python-pptx")
foreach ($dep in $deps) {
    $check = python -c "import $($dep.Replace('-', '_'))" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  A instalar $dep..." -ForegroundColor Yellow
        python -m pip install $dep --quiet
    }
}

# ── Verificar ANTHROPIC_API_KEY ───────────────────────────────────
if (-not $env:ANTHROPIC_API_KEY) {
    # Tenta carregar do .env
    $envFile = Join-Path $Root ".env"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match "^ANTHROPIC_API_KEY=(.+)$") {
                $env:ANTHROPIC_API_KEY = $Matches[1].Trim('"').Trim("'")
            }
        }
    }
}

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host ""
    Write-Host "[ERRO] ANTHROPIC_API_KEY não definida." -ForegroundColor Red
    Write-Host "  Adiciona ao .env:  ANTHROPIC_API_KEY=sk-ant-..." -ForegroundColor Yellow
    Write-Host "  Ou exporta:  `$env:ANTHROPIC_API_KEY='sk-ant-...'" -ForegroundColor Yellow
    exit 1
}

Write-Host "  API Key: sk-ant-...$(($env:ANTHROPIC_API_KEY)[-8..-1] -join '')" -ForegroundColor DarkGray

# ── Construir argumentos ──────────────────────────────────────────
$pyArgs = @("ppt_agent_pipeline.py")

if ($Versions) {
    $pyArgs += "--version-only"
} else {
    if ($DryRun) {
        $pyArgs += "--dry-run"
        Write-Host "  Modo: dry-run (sem gerar .pptx)" -ForegroundColor Yellow
    }
    if ($StartFrom -gt 1) {
        $pyArgs += "--start-from"
        $pyArgs += $StartFrom
        Write-Host "  Começar do agente: $StartFrom" -ForegroundColor Yellow
    }
}

Write-Host ""

# ── Executar pipeline ─────────────────────────────────────────────
Push-Location $Root
try {
    python @pyArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRO] Pipeline falhou com código $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}

# ── Abrir .pptx se gerado ─────────────────────────────────────────
if (-not $DryRun -and -not $Versions) {
    $pptx = Join-Path $Root "ITSector_Talent_ATS_Comercial.pptx"
    if (Test-Path $pptx) {
        Write-Host ""
        $open = Read-Host "  Abrir apresentação no PowerPoint? (s/N)"
        if ($open -eq "s" -or $open -eq "S") {
            Start-Process $pptx
        }
    }
}

Write-Host ""
