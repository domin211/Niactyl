# Niactyl

This project provides a simple full‑stack example using a fast Node.js server and a Vite + React front‑end styled with Tailwind CSS. The UI defaults to a dark theme and includes Discord authentication. On first login a Pterodactyl user is created or associated with the Discord account.

## Getting Started

1. Install dependencies for both the server and client:
   ```bash
   cd server && npm install
 cd ../client && npm install
  ```
2. Copy `server/config.yml` and adjust the values for your Discord OAuth and Pterodactyl panel.
3. (Optional) edit `client/src/config.ts` if you need to change the API base URL.
4. Build the React front‑end:
   ```bash
   npm run build
   ```
5. Start the Node server from the `server` directory:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`.

During development you can run `npm run dev` in both `client` and `server` directories for hot‑reloading.

<<<<<<< d5mawf-codex/create-fullstack-web-app-with-node.js-and-vite
## Deploying on Pterodactyl

Import the **Node.js Generic** egg from the official Pterodactyl eggs repository.  Configure it with the following settings to run Niactyl:

1. **Git Repository** – point this to your fork of the Niactyl repository.
2. **Auto Update** – set to `1` so the server pulls the latest changes on each start.
3. **Startup Command** – use `bash startup.sh`.

The provided `startup.sh` script will pull updates when enabled, rebuild the React client and then start the Node.js server.
=======
## Pterodactyl Egg

A sample egg is available at `pterodactyl/niactyl-egg.json`. Import this into your Pterodactyl panel to deploy the app. Set the `GIT_REPO` variable to your repository URL and keep `AUTO_UPDATE` enabled to pull updates on each restart.
>>>>>>> main

