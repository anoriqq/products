FROM node:12.13.1-alpine

ENV PRODUCT_DIR /usr/src/app
WORKDIR $PRODUCT_DIR

CMD node $PRODUCT_DIR/server/dist/bundle.js
