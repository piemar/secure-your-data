param(
  [ValidateSet('dev', 'standard', 'high')]
  [string]$ResourceProfile = 'dev',
  [switch]$WithSandboxTools,
  [switch]$NoContainerMongo,
  [switch]$NoAutoInstallRuntime,
  [switch]$YesInstallRuntime
)

$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$StartScript = Join-Path $RootDir "scripts/local/start-local.ps1"

$args = @("-ContainerRuntime", "podman", "-ResourceProfile", $ResourceProfile)
if ($WithSandboxTools) { $args += "-WithSandboxTools" }
if ($NoContainerMongo) { $args += "-NoContainerMongo" }
if ($NoAutoInstallRuntime) { $args += "-NoAutoInstallRuntime" }
if ($YesInstallRuntime) { $args += "-YesInstallRuntime" }

powershell -ExecutionPolicy Bypass -File $StartScript @args
