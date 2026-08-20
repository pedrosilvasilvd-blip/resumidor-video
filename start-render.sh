#!/bin/sh
set -eu

# O Render informa automaticamente o domínio público e a porta do serviço.
# O Cobalt precisa dessas duas variáveis para criar links de túnel corretos.
if [ -z "${API_URL:-}" ]; then
  if [ -n "${RENDER_EXTERNAL_HOSTNAME:-}" ]; then
    export API_URL="https://${RENDER_EXTERNAL_HOSTNAME}/"
  else
    export API_URL="http://localhost:${PORT:-9000}/"
  fi
fi

export API_PORT="${PORT:-9000}"
export API_LISTEN_ADDRESS="0.0.0.0"

exec docker-entrypoint.sh node src/cobalt
