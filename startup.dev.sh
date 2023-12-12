#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh db:27017
npm run start:dev
