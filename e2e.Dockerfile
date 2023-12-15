FROM node:18-alpine3.19 as development

RUN apk add --no-cache bash git openssh-client
RUN npm i -g pnpm @nestjs/cli typescript ts-node

RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts

COPY package*.json /tmp/app/
WORKDIR /tmp/app
RUN pnpm install

COPY . /home/node/app
RUN cp -a /tmp/app/node_modules /home/node/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh
COPY ./startup.ci.sh /opt/startup.ci.sh
RUN chmod +x /opt/startup.ci.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.ci.sh

WORKDIR /home/node/app
RUN if [ ! -f .env ]; then cp env-example .env; fi
RUN npm run build
CMD ["/opt/startup.ci.sh"]