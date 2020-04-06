FROM node:12.16.1-alpine

ENV PRODUCT_DIR /usr/src/app

WORKDIR $PRODUCT_DIR

COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./client/package.json ./client/
COPY ./client/yarn.lock ./client/
COPY ./server/package.json ./server/
COPY ./server/yarn.lock ./server/

RUN yarn install:all:silent

COPY . .

RUN yarn build:all:prod

CMD export $(grep -v '^#' ./secret/prod.env | xargs) \
  && node $PRODUCT_DIR/server/dist/bundle.js
