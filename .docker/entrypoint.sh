#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

pnpm install --force
# pnpm test:unit
# pnpm test:integ

if [ -e $DEBUG ]; then
  pnpm start:debug
else
  pnpm start
fi
