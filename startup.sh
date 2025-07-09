#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  git pull
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d server/node_modules ]; then
  cd server && npm install
  cd ..
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d client/node_modules ]; then
  cd client && npm install && npm run build
  cd ..
fi

node server/index.js

