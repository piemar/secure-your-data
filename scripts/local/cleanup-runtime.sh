#!/usr/bin/env bash
set -euo pipefail

REMOVE_PODMAN=0
REMOVE_COLIMA=0
ASSUME_YES=0

for arg in "$@"; do
  case "$arg" in
    --podman)
      REMOVE_PODMAN=1
      ;;
    --colima)
      REMOVE_COLIMA=1
      ;;
    --all)
      REMOVE_PODMAN=1
      REMOVE_COLIMA=1
      ;;
    --yes)
      ASSUME_YES=1
      ;;
    *)
      echo "Unknown flag: ${arg}"
      echo "Usage: $0 [--podman] [--colima] [--all] [--yes]"
      exit 1
      ;;
  esac
done

if [[ "${REMOVE_PODMAN}" -eq 0 && "${REMOVE_COLIMA}" -eq 0 ]]; then
  REMOVE_PODMAN=1
  REMOVE_COLIMA=1
fi

os_name() {
  uname -s | tr '[:upper:]' '[:lower:]'
}

confirm() {
  local prompt="$1"
  if [[ "${ASSUME_YES}" -eq 1 ]]; then
    return 0
  fi
  if [[ ! -t 0 || ! -t 1 ]]; then
    echo "Non-interactive shell detected; use --yes to continue."
    return 1
  fi
  local answer
  read -r -p "${prompt} [y/N]: " answer
  case "${answer}" in
    y|Y|yes|YES) return 0 ;;
  esac
  return 1
}

print_version() {
  local tool="$1"
  if command -v "${tool}" >/dev/null 2>&1; then
    echo "${tool}: $("${tool}" --version 2>/dev/null | head -n 1 || echo 'version unknown')"
  else
    echo "${tool}: not installed"
  fi
}

remove_podman_assets() {
  if command -v podman >/dev/null 2>&1; then
    podman machine stop >/dev/null 2>&1 || true
    if podman machine list >/dev/null 2>&1; then
      while IFS= read -r machine; do
        [[ -z "${machine}" ]] && continue
        podman machine rm -f "${machine}" >/dev/null 2>&1 || true
      done < <(podman machine list --format '{{.Name}}' 2>/dev/null || true)
    fi
  fi
}

remove_colima_assets() {
  if command -v colima >/dev/null 2>&1; then
    colima stop >/dev/null 2>&1 || true
    colima delete -f >/dev/null 2>&1 || true
  fi
}

uninstall_podman() {
  local os
  os="$(os_name)"
  remove_podman_assets
  case "${os}" in
    darwin*)
      if command -v brew >/dev/null 2>&1; then
        brew uninstall podman >/dev/null 2>&1 || true
      fi
      ;;
    linux*)
      if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get remove -y podman >/dev/null 2>&1 || true
      elif command -v dnf >/dev/null 2>&1; then
        sudo dnf remove -y podman >/dev/null 2>&1 || true
      fi
      ;;
    *)
      echo "Podman uninstall is not automated on this OS. Use package manager manually."
      ;;
  esac
}

uninstall_colima() {
  local os
  os="$(os_name)"
  remove_colima_assets
  case "${os}" in
    darwin*)
      if command -v brew >/dev/null 2>&1; then
        brew uninstall colima >/dev/null 2>&1 || true
      fi
      ;;
    linux*)
      echo "Colima uninstall is typically not needed on Linux; remove manually if installed."
      ;;
    *)
      echo "Colima uninstall is not automated on this OS."
      ;;
  esac
}

echo "Runtime cleanup plan:"
echo "- Remove Podman: $([[ "${REMOVE_PODMAN}" -eq 1 ]] && echo yes || echo no)"
echo "- Remove Colima: $([[ "${REMOVE_COLIMA}" -eq 1 ]] && echo yes || echo no)"
echo
echo "Before cleanup:"
print_version podman
print_version colima
echo

if ! confirm "Proceed with runtime cleanup?"; then
  echo "Cancelled."
  exit 0
fi

if [[ "${REMOVE_PODMAN}" -eq 1 ]]; then
  uninstall_podman
fi
if [[ "${REMOVE_COLIMA}" -eq 1 ]]; then
  uninstall_colima
fi

echo
echo "After cleanup:"
print_version podman
print_version colima
