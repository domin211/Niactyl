# Niactyl

This project provides a simple full‑stack example using a fast Node.js server and a Vite + React front‑end styled with Tailwind CSS. The UI defaults to a dark theme and includes Discord authentication. On first login a Pterodactyl user is created or associated with the Discord account.

## Getting Started

1. Install dependencies from the project root. The repository uses npm workspaces so both the server and client are installed automatically. The client is built during installation:
   ```bash
   npm install
   ```
2. Copy `server/config.yml` and adjust the values for your Discord OAuth and Pterodactyl panel.
3. (Optional) edit `client/src/config.ts` if you need to change the API base URL.
4. Start the server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

During development you can run `npm run dev` in both `client` and `server` directories for hot‑reloading.

## Deploying on Pterodactyl

Import the **Node.js Generic** egg from the official Pterodactyl eggs repository.  Configure it with the following settings to run Niactyl:

1. **Git Repository** – point this to your fork of the Niactyl repository.
2. **Auto Update** – set to `1` so the server pulls the latest changes on each start.
3. **Main File** – set to `server/index.js`.

The egg's startup routine will run `npm install`. Our `postinstall` script builds the client so the server can serve the static files.

