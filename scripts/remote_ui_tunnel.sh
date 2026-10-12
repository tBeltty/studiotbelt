#!/usr/bin/env bash
# scripts/remote_ui_tunnel.sh — Quick Cloudflare Tunnel to access tBelt Studio from mobile / remote browser
set -euo pipefail

PORT="${PORT:-8770}"

CLOUDFLARED_BIN="$(command -v cloudflared || echo '/opt/homebrew/bin/cloudflared')"

if [ ! -x "${CLOUDFLARED_BIN}" ]; then
  echo "Error: cloudflared binary not found in PATH or /opt/homebrew/bin/cloudflared."
  echo "Install it via 'brew install cloudflared' or from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  exit 1
fi

echo "Starting Cloudflare quick tunnel for tBelt Studio on port ${PORT}..."
echo "Open the resulting https://*.trycloudflare.com URL on your phone or tablet."
echo "Press Ctrl+C to stop."
echo "----------------------------------------------------------------------"

exec "${CLOUDFLARED_BIN}" tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate
