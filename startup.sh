#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  git pull
fi

if [ "$AUTO_UPDATE" = "1" ] || [ ! -d node_modules ]; then
  npm install
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

