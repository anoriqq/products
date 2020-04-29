# develop docker-compose.yml でボリュームマウントとenv設定する用
FROM node:12.16.3-alpine

ENV PRODUCT_DIR /usr/src/app
WORKDIR $PRODUCT_DIR

CMD node $PRODUCT_DIR/server/dist/bundle.js
