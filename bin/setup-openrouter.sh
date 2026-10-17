#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
GITIGNORE="${ROOT_DIR}/.gitignore"

echo "=== Configuración Segura de OpenRouter para tBelt Studio ==="
echo "Cumpliendo Blind-Secret Protocol (entrada silenciosa, sin exponer en shell ni chat)"
echo ""

# Asegurar que .env esté en .gitignore
if [ -f "${GITIGNORE}" ]; then
  if ! grep -q "^\.env$" "${GITIGNORE}"; then
    echo ".env" >> "${GITIGNORE}"
  fi
else
  echo ".env" > "${GITIGNORE}"
fi

# Captura interactiva y silenciosa
printf "Introduce tu OPENROUTER_API_KEY: "
read -s -r OPENROUTER_KEY
echo ""

if [ -z "${OPENROUTER_KEY}" ]; then
  echo "Error: La clave no puede estar vacía."
  exit 1
fi

echo "Verificando clave y consultando saldo inicial en OpenRouter..."
AUTH_RESP=$(curl -s -H "Authorization: Bearer ${OPENROUTER_KEY}" https://openrouter.ai/api/v1/auth/key)

if echo "${AUTH_RESP}" | grep -q '"User not found"'; then
  echo "Error: Clave de OpenRouter inválida o expirada."
  exit 1
fi

LABEL=$(echo "${AUTH_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin).get('data', {}); print(data.get('label') or 'Sin etiqueta')")
USAGE=$(echo "${AUTH_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin).get('data', {}); print(data.get('usage', 0.0))")
LIMIT=$(echo "${AUTH_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin).get('data', {}); print(data.get('limit') or 'Ilimitado')")
REMAINING=$(echo "${AUTH_RESP}" | python3 -c "import sys, json; data=json.load(sys.stdin).get('data', {}); print(data.get('limit_remaining') or 'N/A')")

echo " Clave verificada con éxito:"
echo "   - Etiqueta: ${LABEL}"
echo "   - Gasto acumulado: \$${USAGE} USD"
echo "   - Límite asignado: ${LIMIT}"
echo "   - Saldo restante en límite: ${REMAINING}"

# Guardar en .env
touch "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

# Eliminar entradas previas si existen
grep -v "^OPENROUTER_API_KEY=" "${ENV_FILE}" | grep -v "^ACTIVE_PROVIDER=" | grep -v "^OPENROUTER_MODEL=" | grep -v "^OPENROUTER_RESOLUTION=" > "${ENV_FILE}.tmp" || true

# Agregar configuración
cat <<EOF >> "${ENV_FILE}.tmp"
ACTIVE_PROVIDER="openrouter"
OPENROUTER_API_KEY="${OPENROUTER_KEY}"
OPENROUTER_MODEL="alibaba/wan-3.0"
OPENROUTER_RESOLUTION="480p"
EOF

mv "${ENV_FILE}.tmp" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

echo ""
echo " Configuración guardada en .env con permisos 600."
echo " Proveedor activo establecido: openrouter"
echo " Modelo predeterminado: alibaba/wan-3.0 (480p)"
echo "Listo para ejecutar el pipeline con control de saldo."
