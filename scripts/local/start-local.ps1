param(
  [ValidateSet('auto', 'docker', 'podman')]
  [string]$ContainerRuntime = 'auto',
  [ValidateSet('dev', 'standard', 'high')]
  [string]$ResourceProfile = 'dev',
  [switch]$WithSandboxTools,
  [switch]$NoContainerMongo,
  [switch]$NoAutoInstallRuntime,
  [switch]$YesInstallRuntime
)

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$RuntimeDir = Join-Path $RootDir ".local/dev"
$LogDir = Join-Path $RuntimeDir "logs"
$MetaPath = Join-Path $RuntimeDir "meta.json"
$PidPath = Join-Path $RuntimeDir "pids.json"
$ComposeFile = Join-Path $RootDir "server/docker-compose.yml"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Test-PortInUse([int]$Port) {
  $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
  return $lines.Count -gt 0
}

function Test-DockerReady {
  try {
    docker compose version | Out-Null
    docker info | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Test-PodmanReady {
  try {
    podman info | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Confirm-InstallRuntime([string]$RuntimeName) {
  if ($NoAutoInstallRuntime) { return $false }
  if ($YesInstallRuntime) { return $true }
  if (-not [Environment]::UserInteractive) {
    Write-Host "Skipping $RuntimeName auto-install (non-interactive shell). Use -YesInstallRuntime to auto-approve."
    return $false
  }
  $ans = Read-Host "$RuntimeName is not installed. Install it now? [y/N]"
  return ($ans -match '^(y|yes)$')
}

function Get-ToolVersion([string]$ToolName, [string[]]$Args = @('--version')) {
  if (-not (Get-Command $ToolName -ErrorAction SilentlyContinue)) { return $null }
  try {
    $out = & $ToolName @Args 2>$null
    if (-not $out) { return $null }
    return ($out | Select-Object -First 1)
  } catch {
    return $null
  }
}

function Get-ComposeProvider {
  param([string]$RequestedRuntime)

  if ($RequestedRuntime -eq 'docker' -or $RequestedRuntime -eq 'auto') {
    if (Test-DockerReady) {
      return @{ Runtime = 'docker'; Provider = 'docker_compose' }
    }
  }

  if ($RequestedRuntime -eq 'podman' -or $RequestedRuntime -eq 'auto') {
    if (-not (Test-PodmanReady) -and (Confirm-InstallRuntime -RuntimeName 'Podman')) {
      if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "Podman not found. Attempting install via winget..."
        try {
          winget install -e --id RedHat.Podman --silent --accept-package-agreements --accept-source-agreements | Out-Null
          $podmanVersion = Get-ToolVersion -ToolName 'podman'
          if ($podmanVersion) { Write-Host "Podman version: $podmanVersion" }
        } catch {
          Write-Host "Warning: Podman auto-install failed."
        }
      }
    }
    if (Test-PodmanReady) {
      try {
        podman compose version | Out-Null
        return @{ Runtime = 'podman'; Provider = 'podman_compose' }
      } catch {
        if (Get-Command podman-compose -ErrorAction SilentlyContinue) {
          return @{ Runtime = 'podman'; Provider = 'podman-compose' }
        }
      }
    }

    if ($RequestedRuntime -eq 'podman' -and Test-DockerReady) {
      Write-Host "Podman unavailable; falling back to Docker on Windows."
      return @{ Runtime = 'docker'; Provider = 'docker_compose' }
    }
  }

  return @{ Runtime = 'none'; Provider = 'none' }
}

function Set-ResourceProfileDefaults {
  param([string]$Profile)

  switch ($Profile) {
    'dev' {
      if (-not $env:MONGO_MEM_LIMIT) { $env:MONGO_MEM_LIMIT = '384m' }
      if (-not $env:MONGO_CPUS) { $env:MONGO_CPUS = '0.50' }
      if (-not $env:MONGO_PIDS_LIMIT) { $env:MONGO_PIDS_LIMIT = '256' }
      if (-not $env:MONGO_WT_CACHE_GB) { $env:MONGO_WT_CACHE_GB = '0.20' }
      if (-not $env:SANDBOX_TOOLS_MEM_LIMIT) { $env:SANDBOX_TOOLS_MEM_LIMIT = '256m' }
      if (-not $env:SANDBOX_TOOLS_CPUS) { $env:SANDBOX_TOOLS_CPUS = '0.50' }
      if (-not $env:SANDBOX_TOOLS_PIDS_LIMIT) { $env:SANDBOX_TOOLS_PIDS_LIMIT = '256' }
    }
    'standard' {
      if (-not $env:MONGO_MEM_LIMIT) { $env:MONGO_MEM_LIMIT = '1024m' }
      if (-not $env:MONGO_CPUS) { $env:MONGO_CPUS = '1.00' }
      if (-not $env:MONGO_PIDS_LIMIT) { $env:MONGO_PIDS_LIMIT = '512' }
      if (-not $env:MONGO_WT_CACHE_GB) { $env:MONGO_WT_CACHE_GB = '0.50' }
      if (-not $env:SANDBOX_TOOLS_MEM_LIMIT) { $env:SANDBOX_TOOLS_MEM_LIMIT = '512m' }
      if (-not $env:SANDBOX_TOOLS_CPUS) { $env:SANDBOX_TOOLS_CPUS = '1.00' }
      if (-not $env:SANDBOX_TOOLS_PIDS_LIMIT) { $env:SANDBOX_TOOLS_PIDS_LIMIT = '512' }
    }
    'high' {
      if (-not $env:MONGO_MEM_LIMIT) { $env:MONGO_MEM_LIMIT = '2048m' }
      if (-not $env:MONGO_CPUS) { $env:MONGO_CPUS = '2.00' }
      if (-not $env:MONGO_PIDS_LIMIT) { $env:MONGO_PIDS_LIMIT = '1024' }
      if (-not $env:MONGO_WT_CACHE_GB) { $env:MONGO_WT_CACHE_GB = '1.00' }
      if (-not $env:SANDBOX_TOOLS_MEM_LIMIT) { $env:SANDBOX_TOOLS_MEM_LIMIT = '1024m' }
      if (-not $env:SANDBOX_TOOLS_CPUS) { $env:SANDBOX_TOOLS_CPUS = '1.50' }
      if (-not $env:SANDBOX_TOOLS_PIDS_LIMIT) { $env:SANDBOX_TOOLS_PIDS_LIMIT = '1024' }
    }
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
  throw "No compose provider available."
}

$compose = Get-ComposeProvider -RequestedRuntime $ContainerRuntime
Set-ResourceProfileDefaults -Profile $ResourceProfile
$mongoStarted = $false
$sandboxToolsStarted = $false
$webStarted = $false
$apiStarted = $false

if (-not $NoContainerMongo -and $compose.Provider -ne 'none') {
  try {
    $runtimeVersion = Get-ToolVersion -ToolName $compose.Runtime
    if ($runtimeVersion) { Write-Host "$($compose.Runtime) version: $runtimeVersion" }
    if ($compose.Provider -eq 'docker_compose') {
      $providerVersion = Get-ToolVersion -ToolName 'docker' -Args @('compose', 'version')
      if ($providerVersion) { Write-Host "compose provider: $providerVersion" }
    } elseif ($compose.Provider -eq 'podman_compose') {
      $providerVersion = Get-ToolVersion -ToolName 'podman' -Args @('compose', 'version')
      if ($providerVersion) { Write-Host "compose provider: $providerVersion" }
    } elseif ($compose.Provider -eq 'podman-compose') {
      $providerVersion = Get-ToolVersion -ToolName 'podman-compose' -Args @('--version')
      if ($providerVersion) { Write-Host "compose provider: $providerVersion" }
    }
    Write-Host "Starting MongoDB via $($compose.Runtime)/$($compose.Provider)..."
    Write-Host "Resource profile: $ResourceProfile (mongo $($env:MONGO_MEM_LIMIT), $($env:MONGO_CPUS) CPU, WT cache $($env:MONGO_WT_CACHE_GB)GB)"
    Invoke-Compose -Provider $compose.Provider -Args @('up', '-d', 'mongo')
    $mongoStarted = $true
    if ($WithSandboxTools) {
      Invoke-Compose -Provider $compose.Provider -Args @('--profile', 'sandbox', 'up', '-d', 'sandbox-tools')
      $sandboxToolsStarted = $true
    }
  } catch {
    Write-Host "Warning: failed to start containerized MongoDB."
  }
}

$apiPid = $null
$webPid = $null
$defaultTerminalExecutor = 'local'
$defaultTerminalDockerImage = ''
if ($WithSandboxTools -and $compose.Provider -ne 'none') {
  $defaultTerminalExecutor = 'docker'
  $defaultTerminalDockerImage = 'server-sandbox-tools'
}

if (-not (Test-PortInUse 3001)) {
  $apiLog = Join-Path $LogDir "api.log"
  $apiErr = Join-Path $LogDir "api.err.log"
  $apiCmd = "set CONTAINER_TERMINAL_ENABLED=true&& set TERMINAL_WS_SHELL_ENABLED=true&& set TERMINAL_WS_EXECUTOR=$defaultTerminalExecutor&& set TERMINAL_DOCKER_IMAGE=$defaultTerminalDockerImage&& npm run dev"
  $apiProc = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $apiCmd) -WorkingDirectory (Join-Path $RootDir "server") -RedirectStandardOutput $apiLog -RedirectStandardError $apiErr -PassThru
  $apiPid = $apiProc.Id
  $apiStarted = $true
}

if (-not (Test-PortInUse 8080)) {
  $webLog = Join-Path $LogDir "web.log"
  $webErr = Join-Path $LogDir "web.err.log"
  $webProc = Start-Process -FilePath "npm" -ArgumentList @("run", "dev") -WorkingDirectory $RootDir -RedirectStandardOutput $webLog -RedirectStandardError $webErr -PassThru
  $webPid = $webProc.Id
  $webStarted = $true
}

@{
  WEB_PID = $webPid
  API_PID = $apiPid
} | ConvertTo-Json | Set-Content -Path $PidPath

@{
  MONGO_STARTED = $mongoStarted
  SANDBOX_TOOLS_STARTED = $sandboxToolsStarted
  WEB_STARTED = $webStarted
  API_STARTED = $apiStarted
  CONTAINER_RUNTIME = $compose.Runtime
  COMPOSE_PROVIDER = $compose.Provider
  RESOURCE_PROFILE = $ResourceProfile
  MONGO_MEM_LIMIT = $env:MONGO_MEM_LIMIT
  MONGO_CPUS = $env:MONGO_CPUS
  MONGO_WT_CACHE_GB = $env:MONGO_WT_CACHE_GB
  SANDBOX_TOOLS_MEM_LIMIT = $env:SANDBOX_TOOLS_MEM_LIMIT
  SANDBOX_TOOLS_CPUS = $env:SANDBOX_TOOLS_CPUS
  RUNTIME_VERSION = (Get-ToolVersion -ToolName $compose.Runtime)
  STARTED_AT = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json | Set-Content -Path $MetaPath

Write-Host "Local stack started."
Write-Host "Web: http://localhost:8080"
Write-Host "API: http://localhost:3001"
