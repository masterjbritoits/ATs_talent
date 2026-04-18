#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Switch Prisma schema between SQLite (local dev) and PostgreSQL (production).

.EXAMPLE
    ./scripts/switch-db.ps1 sqlite
    ./scripts/switch-db.ps1 postgres
#>

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("sqlite", "postgres")]
  [string]$Database
)

$SchemaPath = "$PSScriptRoot/../prisma/schema.prisma"
$SchemaSqlitePath = "$PSScriptRoot/../prisma/schema.sqlite.prisma"
$SchemaPostgresPath = "$PSScriptRoot/../prisma/schema.prisma.postgres"

if ($Database -eq "sqlite") {
  if (-not (Test-Path $SchemaSqlitePath)) {
    Write-Error "Error: $SchemaSqlitePath not found"
    exit 1
  }
  Copy-Item $SchemaSqlitePath $SchemaPath -Force
  Write-Output "✓ Switched to SQLite (file:./prisma/dev.db)"
  Write-Output "  Run: npm run db:push"
  exit 0
}

if ($Database -eq "postgres") {
  # If schema.prisma.postgres doesn't exist, restore from git
  if (-not (Test-Path $SchemaPostgresPath)) {
    & git show HEAD:prisma/schema.prisma | Out-File $SchemaPostgresPath -Encoding UTF8
  }
  Copy-Item $SchemaPostgresPath $SchemaPath -Force
  Write-Output "✓ Switched to PostgreSQL (postgresql://...)"
  Write-Output "  Ensure DATABASE_URL and DIRECT_DATABASE_URL are set in .env.local"
  Write-Output "  Run: npm run db:push"
  exit 0
}
