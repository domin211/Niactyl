# Niactyl

Fullstack application with a Fastify backend and simple frontend. Requires Node.js 18 or newer.

## Getting Started

Run the following commands to install dependencies:

```bash
cd server && npm install
cd ../client && npm install
npm run build # or enable devMode in server/config.yml
cd ..
```

Then start the server:

```bash
node server/index.js
```

You can also run the provided `startup.sh` script which will install dependencies if they do not exist and start the server:

```bash
bash startup.sh
```

If you see a warning about missing static files when starting the server, build the client:

```bash
cd client && npm run build
```

Running `startup.sh` will perform this build automatically whenever the `client/dist` directory is absent.

To skip building the client entirely during development, set `devMode: true` in `server/config.yml`. The server will then start the client dev server using `npm run dev`.
