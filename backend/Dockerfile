FROM ghcr.io/imputnet/cobalt:11

USER root

# yt-dlp lista vídeos de perfis/canais (YouTube e TikTok) sem baixar os
# arquivos. O binário standalone é atualizado sempre que o Render recompila.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -L --fail --retry 3 \
       https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
       -o /usr/local/bin/yt-dlp \
    && chmod 755 /usr/local/bin/yt-dlp \
    && apt-get purge -y --auto-remove curl \
    && rm -rf /var/lib/apt/lists/*

COPY start-render.sh /usr/local/bin/start-render.sh
COPY profile-server.mjs /opt/blind-engine/profile-server.mjs
RUN chmod 755 /usr/local/bin/start-render.sh

USER node
ENTRYPOINT ["/usr/local/bin/start-render.sh"]
