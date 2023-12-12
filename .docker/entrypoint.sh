#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env-example .env
fi

# pnpm install --force
# pnpm test
# pnpm test:e2e

if [ -e $DEBUG ]; then
  pnpm start:debug
else
  pnpm start
fi
