param(
  [switch]$PurgeMongo
)

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$RuntimeDir = Join-Path $RootDir ".local/dev"
$MetaPath = Join-Path $RuntimeDir "meta.json"
$PidPath = Join-Path $RuntimeDir "pids.json"
$ComposeFile = Join-Path $RootDir "server/docker-compose.yml"

if (-not (Test-Path $MetaPath)) {
  Write-Host "No local runtime metadata found."
  exit 0
}

$meta = Get-Content -Path $MetaPath | ConvertFrom-Json
$pids = @{}
if (Test-Path $PidPath) {
  $pids = Get-Content -Path $PidPath | ConvertFrom-Json
}

function Stop-TrackedProcess([object]$PidValue, [string]$Name) {
  if ($null -eq $PidValue -or $PidValue -eq "") {
    Write-Host "$Name: not managed by script"
    return
  }
  try {
    Stop-Process -Id ([int]$PidValue) -ErrorAction Stop
    Write-Host "$Name: stopped"
  } catch {
    Write-Host "$Name: already stopped"
  }
}

function Invoke-Compose {
  param(
    [string]$Provider,
    [string[]]$Args
  )
  if ($Provider -eq 'docker_compose') {
    docker compose -f $ComposeFile @Args | Out-Null
    return
  }
  if ($Provider -eq 'podman_compose') {
    podman compose -f $ComposeFile @Args | Out-Null
    return
  }
  if ($Provider -eq 'podman-compose') {
    podman-compose -f $ComposeFile @Args | Out-Null
    return
  }
}

Stop-TrackedProcess -PidValue $pids.WEB_PID -Name "Web"
Stop-TrackedProcess -PidValue $pids.API_PID -Name "API"

if ($meta.COMPOSE_PROVIDER -ne 'none') {
  if ($meta.SANDBOX_TOOLS_STARTED) {
    Invoke-Compose -Provider $meta.COMPOSE_PROVIDER -Args @('stop', 'sandbox-tools')
  }
  if ($meta.MONGO_STARTED) {
    if ($PurgeMongo) {
      Invoke-Compose -Provider $meta.COMPOSE_PROVIDER -Args @('down', '-v')
    } else {
      Invoke-Compose -Provider $meta.COMPOSE_PROVIDER -Args @('stop', 'mongo')
    }
  }
}

Remove-Item -Force -ErrorAction SilentlyContinue $MetaPath, $PidPath
Write-Host "Local stack stopped."
