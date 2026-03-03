#!/usr/bin/env pwsh
# Load environment variables from .env.production.local
$content = Get-Content ".env.production.local" -Raw
$lines = $content -split "`n"
foreach ($line in $lines) {
    if ($line -match '^([A-Z_]+)="(.+)"$') {
        $key = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$key" -Value $value
    }
}

# Confirm env var is set
Write-Host "Database URL set: $($env:POSTGRES_PRISMA_URL.Substring(0, 50))..."

# Run db push to create schema
& npx prisma db push --skip-generate --accept-data-loss
