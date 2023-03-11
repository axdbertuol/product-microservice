#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

pnpm install
pnpm test
# pnpm start:debug
