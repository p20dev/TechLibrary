param(
  [Parameter(Mandatory = $true)][string]$Backup,
  [string]$Database = ".\data\tech-library.db"
)
$ErrorActionPreference = "Stop"
if (-not (Test-Path -LiteralPath $Backup)) { throw "Backup not found: $Backup" }
$parent = Split-Path -Parent $Database
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
Copy-Item -LiteralPath $Backup -Destination $Database -Force
Write-Host "Database restored to: $Database"
