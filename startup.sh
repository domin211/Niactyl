#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  git pull
fi

# Load DATABASE_URL from config.yml when not set
if [ -z "$DATABASE_URL" ] && [ -f config.yml ]; then
  DB_USER=$(grep '^[ ]*user:' config.yml | awk '{print $2}' | tr -d '"')
  DB_PASS=$(grep '^[ ]*password:' config.yml | awk '{print $2}' | tr -d '"')
  DB_HOST=$(grep '^[ ]*host:' config.yml | awk '{print $2}' | tr -d '"')
  DB_PORT=$(grep '^[ ]*port:' config.yml | awk '{print $2}' | tr -d '"')
  DB_NAME=$(grep '^[ ]*name:' config.yml | awk '{print $2}' | tr -d '"')
  DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
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

