FROM ghcr.io/imputnet/cobalt:11

USER root

# A imagem oficial do Cobalt usa Alpine Linux. Por isso usamos apk e o binário
# musllinux do yt-dlp (o binário linux comum exige glibc e não inicia aqui).
RUN apk add --no-cache ca-certificates \
    && apk add --no-cache --virtual .fetch-deps curl \
    && curl -L --fail --retry 3 \
       https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_musllinux \
       -o /usr/local/bin/yt-dlp \
    && chmod 755 /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version \
    && apk del .fetch-deps

COPY start-render.sh /usr/local/bin/start-render.sh
COPY profile-server.mjs /opt/blind-engine/profile-server.mjs
RUN chmod 755 /usr/local/bin/start-render.sh

USER node
ENTRYPOINT ["/usr/local/bin/start-render.sh"]
