#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  # Force overwrite local changes with the latest from origin/main
  git fetch --all
  git reset --hard origin/main
fi

# Load database configuration from config.yml
if [ -f config.yml ]; then
    DB_USER=$(grep '^[ ]*user:' config.yml | awk '{print $2}' | tr -d '"')
    DB_PASS=$(grep '^[ ]*password:' config.yml | awk '{print $2}' | tr -d '"')
    DB_HOST=$(grep '^[ ]*host:' config.yml | awk '{print $2}' | tr -d '"')
    DB_PORT=$(grep '^[ ]*port:' config.yml | awk '{print $2}' | tr -d '"')
    DB_NAME=$(grep '^[ ]*name:' config.yml | awk '{print $2}' | tr -d '"')
fi

# Build DATABASE_URL from config.yml when not already set
if [ -z "$DATABASE_URL" ] && [ -n "$DB_USER" ]; then
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    export DATABASE_URL
fi

# Ensure PostgreSQL is installed and running for local databases
if [ "$DB_HOST" = "localhost" ] || [ "$DB_HOST" = "127.0.0.1" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql > /dev/null
  fi
  service postgresql start

  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d node_modules ]; then
  npm install
  npx prisma generate
fi
# Ensure database tables are created from the Prisma schema
npx prisma db push

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d client/node_modules ]; then
  cd client && npm install
  cd ..
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d client/dist ]; then
  cd client && npm run build
  cd ..
fi

node index.js
