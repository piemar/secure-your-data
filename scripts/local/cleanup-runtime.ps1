param(
  [switch]$Podman,
  [switch]$Yes
)

$ErrorActionPreference = 'Stop'

function Confirm-Continue([string]$Prompt) {
  if ($Yes) { return $true }
  if (-not [Environment]::UserInteractive) {
    Write-Host "Non-interactive shell detected; pass -Yes to continue."
    return $false
  }
  $ans = Read-Host "$Prompt [y/N]"
  return ($ans -match '^(y|yes)$')
}

function Print-Version([string]$Tool, [string]$VersionArgs = '--version') {
  $cmd = Get-Command $Tool -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Write-Host "$Tool: not installed"
    return
  }
  try {
    $out = & $Tool $VersionArgs 2>$null
    if ($out) {
      Write-Host "$Tool: $($out | Select-Object -First 1)"
    } else {
      Write-Host "$Tool: installed"
    }
  } catch {
    Write-Host "$Tool: installed (version unavailable)"
  }
}

$removePodman = $Podman
if (-not $removePodman) {
  $removePodman = $true
}

Write-Host "Runtime cleanup plan (Windows):"
Write-Host "- Remove Podman: $removePodman"
Write-Host ""
Write-Host "Before cleanup:"
Print-Version -Tool 'podman'
Write-Host ""

if (-not (Confirm-Continue "Proceed with runtime cleanup?")) {
  Write-Host "Cancelled."
  exit 0
}

if ($removePodman) {
  try { podman machine stop | Out-Null } catch {}
  try {
    $machines = podman machine list --format '{{.Name}}' 2>$null
    foreach ($m in $machines) {
      if ($m) { podman machine rm -f $m | Out-Null }
    }
  } catch {}

  if (Get-Command winget -ErrorAction SilentlyContinue) {
    try {
      winget uninstall -e --id RedHat.Podman --silent --accept-source-agreements | Out-Null
    } catch {
      Write-Host "Warning: winget uninstall for Podman failed."
    }
  } else {
    Write-Host "winget not found; uninstall Podman manually."
  }
}

Write-Host ""
Write-Host "After cleanup:"
Print-Version -Tool 'podman'
