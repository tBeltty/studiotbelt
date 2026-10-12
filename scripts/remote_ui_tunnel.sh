#!/usr/bin/env bash
# scripts/remote_ui_tunnel.sh — Quick Cloudflare Tunnel to access tBelt Studio from mobile / remote browser
set -euo pipefail

PORT="${PORT:-8770}"

CLOUDFLARED_BIN="$(command -v cloudflared || true)"
if [ -z "${CLOUDFLARED_BIN}" ]; then
  for candidate in /usr/local/bin/cloudflared /opt/homebrew/bin/cloudflared /usr/bin/cloudflared; do
    if [ -x "$candidate" ]; then
      CLOUDFLARED_BIN="$candidate"
      break
    fi
  done
fi

if [ -z "${CLOUDFLARED_BIN}" ] || [ ! -x "${CLOUDFLARED_BIN}" ]; then
  echo "Error: cloudflared binary not found in PATH."
  echo "Install it via your package manager (brew install cloudflared / apt install cloudflared) or from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  exit 1
fi

echo "Starting Cloudflare quick tunnel for tBelt Studio on port ${PORT}..."
echo "Open the resulting https://*.trycloudflare.com URL on your phone or tablet."
echo "Press Ctrl+C to stop."
echo "----------------------------------------------------------------------"

exec "${CLOUDFLARED_BIN}" tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate
