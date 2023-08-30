FROM node:18.14-alpine3.17 as development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
RUN apk add --no-cache bash git openssh-client

# Set up key

RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
WORKDIR /app

# RUN --mount=type=ssh \
#   ssh -q -T git@github.com
# Set the working directory in the container
# Install pnpm globally
RUN npm install -g pnpm
# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

RUN  --mount=type=ssh pnpm install --frozen-lockfile --production
# Copy the entire project to the working directory
COPY . .

USER node

WORKDIR /home/node/app