#!/bin/bash

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

npm install pnpm
pnpm install 
pnpm run start:dev