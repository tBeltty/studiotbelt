#!/usr/bin/env bash
# scripts/set_fal_key.sh — Prompt securely for FAL_KEY and save to .env
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=================================================="
echo " Configure FAL_KEY for tBelt Studio"
echo "=================================================="
echo ""
echo -n "Paste your FAL_KEY (input hidden): "
read -s FAL_INPUT
echo ""

if [ -z "${FAL_INPUT}" ]; then
  echo "Error: Key cannot be empty."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

sed -i '' '/^FAL_KEY=/d' .env 2>/dev/null || sed -i '/^FAL_KEY=/d' .env
echo "FAL_KEY=\"${FAL_INPUT}\"" >> .env
chmod 600 .env

echo "✓ FAL_KEY saved successfully to .env (permissions 600)"
echo ""
