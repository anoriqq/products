FROM node:12.13.0-alpine

ARG _PORT
ENV PORT ${_PORT:-80}
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

EXPOSE $PORT
CMD node $PRODUCT_DIR/server/dist/bundle.js
