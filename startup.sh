#!/bin/bash
set -e

if [ "$AUTO_UPDATE" = "1" ] && [ -d .git ]; then
  git pull
  cd server && npm install
  cd ../client && npm install && npm run build
  cd ..
fi

node server/index.js

