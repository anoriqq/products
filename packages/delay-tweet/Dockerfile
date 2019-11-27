FROM node:12.13.0-alpine

ENV PRODUCT_DIR /usr/src/app

WORKDIR $PRODUCT_DIR

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./client/package.json ./client/
COPY ./client/yarn.lock ./client/
COPY ./server/package.json ./server/
COPY ./server/yarn.lock ./server/

RUN yarn install:all

COPY . .

RUN yarn build:client
RUN yarn build:server

EXPOSE 8000
CMD ["node", "$PRODUCT_DIR/dist/server/bundle.js"]
