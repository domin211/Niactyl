import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fs from 'fs';
import YAML from 'yaml';

import * as db from './server/db.js';
import authPlugin from './server/auth.js';
import routes from './server/routes.js';
import { importEggsAndNodes } from './server/ptero.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  const fastify = Fastify({ logger: false });

  const configPath = path.join(__dirname, 'config.yml');
  const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

  if (!process.env.DATABASE_URL && config.databaseUrl) {
    process.env.DATABASE_URL = config.databaseUrl;
  }

  await db.init();

  await fastify.register(cors);
  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: config.sessionSecret || 'change_this',
    cookie: { secure: false },
  });

  await fastify.register(authPlugin, { config });
  await fastify.register(routes, { config });

  await importEggsAndNodes();

  const distPath = path.join(__dirname, '../client/dist');
  if (fs.existsSync(distPath)) {
    await fastify.register(fastifyStatic, {
      root: distPath,
      prefix: '/',
      wildcard: false,
    });

    fastify.setNotFoundHandler((req, reply) => {
      reply.sendFile('index.html');
    });
  }

  fastify.get('/logout', async (req, reply) => {
    await req.destroySession();
    reply.redirect('/');
  });

  fastify.listen({ port: 3000 }, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('\x1b[32m%s\x1b[0m', `Niactyl server is ready at ${config.domain}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});