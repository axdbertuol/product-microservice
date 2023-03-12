#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

pnpm install
pnpm test
if [ -e $DEBUG ]; then
  pnpm start:debug
else
  pnpm start
fi
