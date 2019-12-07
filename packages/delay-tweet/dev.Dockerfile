# develop docker-compose.yml でボリュームをマウントする用
FROM node:12.13.0-alpine

ARG _PORT
ENV PORT ${_PORT:-80}
ENV PRODUCT_DIR /usr/src/app

WORKDIR $PRODUCT_DIR

EXPOSE $PORT
CMD node $PRODUCT_DIR/server/dist/bundle.js
