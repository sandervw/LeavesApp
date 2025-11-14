# PowerShell script to upload secrets from .env to Azure Key Vault
# Usage: .\scripts\upload-secrets.ps1 -VaultName "your-vault-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$VaultName
)

# List of secrets to upload (matches SECRET_NAMES in env.ts)
$secrets = @(
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "EMAIL_SENDER",
    "RESEND_API_KEY"
)

# Path to .env file
$envFile = Join-Path (Join-Path $PSScriptRoot "..") ".env.dev.local"

if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

Write-Host "Reading secrets from .env file..." -ForegroundColor Cyan

# Parse .env file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^=]+)=(.+)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

Write-Host "Uploading secrets to Key Vault: $VaultName" -ForegroundColor Cyan
Write-Host ""

# Upload each secret
foreach ($secret in $secrets) {
    if ($envVars.ContainsKey($secret)) {
        # Convert underscore to hyphen for Key Vault naming convention
        $vaultSecretName = $secret.Replace("_", "-")
        $value = $envVars[$secret]

        Write-Host "Uploading: $secret -> $vaultSecretName" -ForegroundColor Green

        try {
            # Use single quotes to prevent PowerShell from interpreting special characters
            az keyvault secret set --vault-name $VaultName --name $vaultSecretName --value "$value" --output none
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Successfully uploaded $vaultSecretName" -ForegroundColor Green
            } else {
                Write-Host "  [FAIL] Failed to upload $vaultSecretName" -ForegroundColor Red
            }
        } catch {
            Write-Host "  [ERROR] Error uploading $vaultSecretName : $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Warning: $secret not found in .env file" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Secret upload complete!" -ForegroundColor Cyan
