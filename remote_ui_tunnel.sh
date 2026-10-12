#!/usr/bin/env bash
# remote_ui_tunnel.sh — Quick Cloudflare Tunnel to access tBelt Studio from mobile / remote browser
set -euo pipefail

PORT="${PORT:-8770}"

echo "Starting Cloudflare quick tunnel for tBelt Studio on port ${PORT}..."
echo "Open the resulting https://*.trycloudflare.com URL on your phone or tablet."
echo "Press Ctrl+C to stop."
echo "----------------------------------------------------------------------"

exec /opt/homebrew/bin/cloudflared tunnel --url "http://127.0.0.1:${PORT}" --no-autoupdate
