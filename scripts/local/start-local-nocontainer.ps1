param(
  [ValidateSet('auto', 'docker', 'podman')]
  [string]$ContainerRuntime = 'auto',
  [ValidateSet('dev', 'standard', 'high')]
  [string]$ResourceProfile = 'dev',
  [switch]$WithSandboxTools,
  [switch]$NoAutoInstallRuntime,
  [switch]$YesInstallRuntime,
  [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$StartScript = Join-Path $RootDir "scripts/local/start-local.ps1"
$ServerEnv = Join-Path $RootDir "server/.env"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required tool: $Name"
  }
}

function Resolve-MongoUri {
  if (Test-Path $ServerEnv) {
    $line = Select-String -Path $ServerEnv -Pattern '^MONGODB_URI=' -SimpleMatch:$false | Select-Object -First 1
    if ($line) {
      return ($line.Line -replace '^MONGODB_URI=', '')
    }
  }
  return "mongodb://127.0.0.1:27017"
}

function Validate-MongoReachable([string]$MongoUri) {
  $out = & mongosh "$MongoUri/admin" --quiet --eval "db.runCommand({ ping: 1 }).ok" 2>$null
  if (-not $out -or ($out | ForEach-Object { $_.ToString().Trim() } | Select-Object -Last 1) -ne '1') {
    throw "MongoDB is not reachable at $MongoUri. Start local MongoDB or set MONGODB_URI in server/.env."
  }
}

function Redact-MongoUri([string]$MongoUri) {
  return ($MongoUri -replace '^(mongodb(\+srv)?://)[^/@]+@', '$1***:***@')
}

Write-Host "Validating local no-container prerequisites..."
Require-Command "node"
Require-Command "npm"
Require-Command "mongosh"

$mongoUri = Resolve-MongoUri
Validate-MongoReachable -MongoUri $mongoUri
Write-Host "Preflight passed. MongoDB reachable at $(Redact-MongoUri -MongoUri $mongoUri)"

if ($CheckOnly) {
  exit 0
}

$args = @(
  "-ContainerRuntime", $ContainerRuntime,
  "-ResourceProfile", $ResourceProfile,
  "-NoContainerMongo"
)
if ($WithSandboxTools) { $args += "-WithSandboxTools" }
if ($NoAutoInstallRuntime) { $args += "-NoAutoInstallRuntime" }
if ($YesInstallRuntime) { $args += "-YesInstallRuntime" }

powershell -ExecutionPolicy Bypass -File $StartScript @args
