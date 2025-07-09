# Niactyl

Fullstack application with a Fastify backend and simple frontend. Requires Node.js 18 or newer.

## Getting Started

Run the following commands to install dependencies:

```bash
cd server && npm install
cd ../client && npm install && npm run build
cd ..
```

Then start the server:

```bash
node server/index.js
```

You will see a green message like `Niactyl server ready at http://localhost:3000` once the server starts.

You can also run the provided `startup.sh` script which will install dependencies if they do not exist and start the server:

```bash
bash startup.sh
```

If you see a warning about missing static files when starting the server, build the client:

```bash
cd client && npm run build
```

Running `startup.sh` will perform this build automatically whenever the `client/dist` directory is absent.
