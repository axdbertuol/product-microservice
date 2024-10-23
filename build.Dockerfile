FROM node:18.19-alpine3.17 as development
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
RUN apk add --no-cache bash git openssh-client

# Set up key

RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

# RUN --mount=type=ssh \
#   ssh -q -T git@github.com
# Set the working directory in the container
# Install pnpm globally
RUN npm install -g pnpm @nestjs/cli@^10
# Copy package.json and pnpm-lock.yaml to the working directory

# Copy the entire project to the working directory
WORKDIR /home/node/app
COPY . .
RUN chmod +x ./wait-for-it.sh
RUN chmod +x ./startup.ci.sh
RUN sed -i 's/\r//g' ./wait-for-it.sh
RUN sed -i 's/\r//g' ./startup.ci.sh

RUN if [ ! -f .env ]; then cp env-example .env; fi

RUN npm install --omit=dev
RUN npm run build 
