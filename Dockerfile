FROM node:18.14-alpine3.17 as development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
RUN apk add --no-cache bash

# Set the working directory in the container
WORKDIR /app
# Install pnpm globally
RUN npm install -g pnpm
# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --production
# Copy the entire project to the working directory
COPY . .

USER node

WORKDIR /home/node/app