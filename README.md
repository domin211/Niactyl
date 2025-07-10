# Niactyl

Fullstack application with a Fastify backend and simple frontend. Requires Node.js 22 or newer. The server now stores data in a PostgreSQL database via Prisma and automatically imports eggs and nodes from your Pterodactyl panel.

## Getting Started

Run the following commands to install dependencies:

```bash
npm install
npx prisma generate
npx prisma db push
cd client && npm install && npm run build
cd ..
```

The server uses **Prisma** with a PostgreSQL database to store users, eggs and nodes. Set the `DATABASE_URL` environment variable with your Postgres connection string, or provide connection details under the `database` section in `config.yml`. Eggs and nodes are automatically imported from your Pterodactyl panel using the API key provided in `config.yml`.

The server will automatically create the configured database if it does not already exist.

The server listens on the host and port specified under the `listen` section in
`config.yml`. If this section is omitted, the host and port are derived from the
`domain` value.

Then start the server:

```bash
node index.js
```

You can also run the provided `startup.sh` script which will install dependencies if they do not exist and start the server. When the configured database host is `localhost`, the script will also install and start PostgreSQL and create the configured user and database automatically:

```bash
bash startup.sh
```

The script builds `DATABASE_URL` from the `database` section in `config.yml` when not already set and runs `npx prisma generate` and `npx prisma db push` whenever packages are installed.

If you see a warning about missing static files when starting the server, build the client:

```bash
cd client && npm run build
```

Running `startup.sh` will perform this build automatically whenever the `client/dist` directory is absent.

## API Endpoints

- `GET /api/message` - returns a JSON greeting
- `GET /api/user` - returns the logged in Discord user or `null`
- `GET /auth/discord` - redirect to Discord OAuth
- `GET /auth/discord/callback` - OAuth callback
- `GET /logout` - destroy the session

Egg and node information is stored in the database and updated whenever the server starts.

Static files from `client/dist` are served when available.
