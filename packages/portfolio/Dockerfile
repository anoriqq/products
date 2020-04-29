FROM node:12.16.3-alpine3.11

WORKDIR /usr/src/app

COPY ./package.json ./

RUN yarn install

COPY . .

EXPOSE 8000
CMD ["node", "index.js"]
