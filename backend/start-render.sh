#!/bin/sh
set -eu

# O Render informa automaticamente o domínio público e a porta do serviço.
# A porta pública fica com o proxy/listador; o Cobalt roda internamente em 9001.
if [ -z "${API_URL:-}" ]; then
  if [ -n "${RENDER_EXTERNAL_HOSTNAME:-}" ]; then
    export API_URL="https://${RENDER_EXTERNAL_HOSTNAME}/"
  else
    export API_URL="http://localhost:${PORT:-9000}/"
  fi
fi

export COBALT_INTERNAL_PORT="${COBALT_INTERNAL_PORT:-9001}"
export API_PORT="$COBALT_INTERNAL_PORT"
export API_LISTEN_ADDRESS="127.0.0.1"

# Inicia o motor de download interno. O processo principal abaixo mantém o
# container vivo e também encaminha todas as rotas normais para o Cobalt.
docker-entrypoint.sh node src/cobalt &

exec node /opt/blind-engine/profile-server.mjs
