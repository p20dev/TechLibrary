param(
  [string]$Database = ".\data\tech-library.db",
  [string]$Destination = ".\backups"
)
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $Destination "tech-library-$timestamp.db"
sqlite3 $Database ".backup '$target'"
Write-Host "Backup created: $target"
