FROM node:18.14-alpine3.17 as development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
RUN apk add --no-cache bash

RUN npm install -g @nestjs/cli@7.5.6 pnpm

USER node

WORKDIR /home/node/app