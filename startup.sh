#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  # Force overwrite local changes with the latest from origin/main
  git fetch --all
  git reset --hard origin/main
fi

# Load DATABASE_URL from config.yml when not set
if [ -z "$DATABASE_URL" ] && [ -f config.yml ]; then
  DATABASE_URL=$(grep '^databaseUrl:' config.yml | awk '{print $2}' | tr -d '"')
  export DATABASE_URL
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d node_modules ]; then
  npm install
  npx prisma generate
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d client/node_modules ]; then
  cd client && npm install
  cd ..
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d client/dist ]; then
  cd client && npm run build
  cd ..
fi

node index.js
