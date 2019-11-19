FROM node:12.13.0-alpine

ENV WORKDIR /usr/src/app

WORKDIR /usr/src/app

COPY ./package.json ./

RUN yarn install

COPY . .

RUN yarn build:client
RUN yarn build:server

EXPOSE 8000
CMD ["node", "dist/index.js"]
