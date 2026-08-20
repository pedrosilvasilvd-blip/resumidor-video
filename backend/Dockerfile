FROM ghcr.io/imputnet/cobalt:11

USER root
COPY start-render.sh /usr/local/bin/start-render.sh
RUN chmod 755 /usr/local/bin/start-render.sh
USER node

ENTRYPOINT ["/usr/local/bin/start-render.sh"]
