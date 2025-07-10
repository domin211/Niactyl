import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyOauth2 from '@fastify/oauth2';
import fs from 'fs';
import YAML from 'yaml';
import fetch from 'node-fetch';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const fastify = Fastify({ logger: false });

  const configPath = path.join(__dirname, 'config.yml');
  const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

  if (config.devMode) {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    spawn(npmCmd, ['run', 'dev'], {
      cwd: path.join(__dirname, '../client'),
      stdio: 'inherit',
    });
  }

  await fastify.register(cors);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: config.sessionSecret || 'change_this',
    cookie: { secure: false },
  });

  await fastify.register(fastifyOauth2, {
    name: 'discordOAuth2',
    scope: ['identify', 'email'],
    credentials: {
      client: {
        id: config.discord.clientId,
        secret: config.discord.clientSecret,
      },
      auth: {
        authorizeHost: 'https://discord.com',
        authorizePath: '/oauth2/authorize',
        tokenHost: 'https://discord.com',
        tokenPath: '/api/oauth2/token',
      },
    },
    startRedirectPath: '/auth/discord',
    callbackUri: config.discord.callbackUrl,
  });

fastify.get('/api/message', async () => {
  return { message: 'Hello from server!' };
});

fastify.get('/api/user', async (req) => {
  return { user: req.session.user || null };
});

fastify.get('/auth/discord/callback', async function (req, reply) {
  const token = await this.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const discordUser = await userRes.json();
  req.session.user = discordUser;
  await ensurePteroUser(discordUser, config);
  reply.redirect('/dashboard');
});

fastify.get('/logout', async (req, reply) => {
  await req.destroySession();
  reply.redirect('/');
});

  const distPath = path.join(__dirname, '../client/dist');
  if (!config.devMode && fs.existsSync(distPath)) {
    await fastify.register(fastifyStatic, {
      root: distPath,
      prefix: '/',
      wildcard: false,
    });

    fastify.setNotFoundHandler((req, reply) => {
      reply.sendFile('index.html');
    });
  } else if (!config.devMode) {
    console.warn(
      `Static files not found at ${distPath}. Run 'npm run build' in the client directory.`
    );
  }

  fastify.listen({ port: 3000 }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(
      '\x1b[32m%s\x1b[0m',
      `Niactyl server is ready at ${config.domain}`
    );
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function ensurePteroUser(discordUser, config) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.pterodactyl.apiKey}`,
  };
  try {
    // Attempt to find existing user by external_id
    const res = await fetch(
      `${config.pterodactyl.panelUrl}/api/application/users?filter[external_id]=${discordUser.id}`,
      { headers }
    );
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }

    // If not found, create one
    const createRes = await fetch(
      `${config.pterodactyl.panelUrl}/api/application/users`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: discordUser.username,
          email: discordUser.email,
          first_name: discordUser.username,
          last_name: 'Niactyl',
          external_id: discordUser.id,
        }),
      }
    );
    return await createRes.json();
  } catch (err) {
    console.error(err);
  }
}