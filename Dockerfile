FROM node:20-alpine3.19 as development
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

# Copy the entire project to the working directory
WORKDIR /home/node/app
COPY . .
RUN pnpm install --production --frozen-lockfile
COPY ./wait-for-it.sh /opt/wait-for-it.sh
COPY ./startup.dev.sh /opt/startup.dev.sh
RUN chmod +x /opt/wait-for-it.sh
RUN chmod +x /opt/startup.dev.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.dev.sh

RUN if [ ! -f .env ]; then cp env-example .env; fi

CMD ["/opt/startup.dev.sh"]
