#!/usr/bin/env bash

set -e

/opt/wait-for-it.sh db:27017
/opt/wait-for-it.sh rabbitmq:5672
npm run build
npm run start:prod > /dev/null 2>&1 &
echo "Waiting for api localhost:3333 ..."
# /opt/wait-for-it.sh localhost:3333 -t 30
npm run lint
npm run test:unit -- --runInBand
npm run test:e2e -- --runInBand
