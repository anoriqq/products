FROM node:12.14.0-alpine3.11

ENV PRODUCT_DIR /usr/src/app
WORKDIR $PRODUCT_DIR

CMD ["yarn", "debug"]
