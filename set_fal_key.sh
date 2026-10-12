#!/usr/bin/env bash
# set_fal_key.sh — Prompt securely for FAL_KEY and save to .env
set -euo pipefail
cd "$(dirname "$0")"

echo "=================================================="
echo " Configuración de FAL_KEY para tBelt Studio"
echo "=================================================="
echo ""
echo -n "Pega tu FAL_KEY (la entrada estará oculta): "
read -s FAL_INPUT
echo ""

if [ -z "${FAL_INPUT}" ]; then
  echo "Error: La clave no puede estar vacía."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Eliminar clave anterior si existía y agregar la nueva
sed -i '' '/^FAL_KEY=/d' .env 2>/dev/null || sed -i '/^FAL_KEY=/d' .env
echo "FAL_KEY=\"${FAL_INPUT}\"" >> .env
chmod 600 .env

echo "✓ FAL_KEY guardada exitosamente en .env (permisos 600)"
echo ""
