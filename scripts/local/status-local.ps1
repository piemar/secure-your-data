$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$RuntimeDir = Join-Path $RootDir ".local/dev"
$MetaPath = Join-Path $RuntimeDir "meta.json"
$PidPath = Join-Path $RuntimeDir "pids.json"

function Test-PortInUse([int]$Port) {
  $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  return $lines.Count -gt 0
}

Write-Host "Local stack status"
Write-Host "=================="

if (-not (Test-Path $MetaPath)) {
  Write-Host "No local metadata found."
  Write-Host "Web: " -NoNewline
  if (Test-PortInUse 8080) { Write-Host "RUNNING (external) http://localhost:8080" } else { Write-Host "STOPPED" }
  Write-Host "API: " -NoNewline
  if (Test-PortInUse 3001) { Write-Host "RUNNING (external) http://localhost:3001" } else { Write-Host "STOPPED" }
  exit 0
}

$meta = Get-Content -Path $MetaPath | ConvertFrom-Json
$pids = @{}
if (Test-Path $PidPath) { $pids = Get-Content -Path $PidPath | ConvertFrom-Json }

Write-Host "Started at: $($meta.STARTED_AT)"
Write-Host "Runtime: $($meta.CONTAINER_RUNTIME) / $($meta.COMPOSE_PROVIDER)"
if ($meta.RESOURCE_PROFILE) {
  Write-Host "Resource profile: $($meta.RESOURCE_PROFILE)"
}
if ($meta.MONGO_MEM_LIMIT -or $meta.MONGO_CPUS) {
  Write-Host "Mongo resources: mem=$($meta.MONGO_MEM_LIMIT) cpu=$($meta.MONGO_CPUS) wtCacheGB=$($meta.MONGO_WT_CACHE_GB)"
}
Write-Host ""

if ($pids.WEB_PID) {
  try {
    Get-Process -Id ([int]$pids.WEB_PID) | Out-Null
    Write-Host "Web: RUNNING (PID $($pids.WEB_PID)) http://localhost:8080"
  } catch {
    Write-Host "Web: STOPPED (managed pid missing)"
  }
} elseif (Test-PortInUse 8080) {
  Write-Host "Web: RUNNING (external) http://localhost:8080"
} else {
  Write-Host "Web: STOPPED"
}

if ($pids.API_PID) {
  try {
    Get-Process -Id ([int]$pids.API_PID) | Out-Null
    Write-Host "API: RUNNING (PID $($pids.API_PID)) http://localhost:3001"
  } catch {
    Write-Host "API: STOPPED (managed pid missing)"
  }
} elseif (Test-PortInUse 3001) {
  Write-Host "API: RUNNING (external) http://localhost:3001"
} else {
  Write-Host "API: STOPPED"
}
