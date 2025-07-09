# Niactyl Server

A Fastify server that serves API endpoints, handles Discord authentication and creates/associates Pterodactyl users. Static assets are served from the built React app.

## Available scripts

- `npm run start` - start the server (after installing dependencies)
- `npm run dev` - run the server in development

## Endpoints

- `GET /api/message` - returns a JSON greeting
- `GET /api/user` - returns the logged in Discord user or `null`
- `GET /auth/discord` - redirect to Discord OAuth
- `GET /auth/discord/callback` - OAuth callback
- `GET /logout` - destroy the session

Static files from `../client/dist` are also served.
