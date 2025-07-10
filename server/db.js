import { PrismaClient } from '@prisma/client';
import { Client as PgClient } from 'pg';
import { execSync } from 'child_process';
import { URL } from 'url';

const prisma = new PrismaClient();

async function ensureDatabase() {
  const url = new URL(process.env.DATABASE_URL);
  const dbName = url.pathname.slice(1);
  const client = new PgClient({
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    user: url.username,
    password: url.password,
    database: 'postgres',
  });

  await client.connect();
  const res = await client.query('SELECT 1 FROM pg_database WHERE datname=$1', [dbName]);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }
  await client.end();
}

export async function init() {
  await ensureDatabase();
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to push Prisma schema', err);
  }
  await prisma.$connect();
}

export async function saveUser(user) {
  await prisma.user.upsert({
    where: { discord_id: user.discord_id },
    update: {
      username: user.username,
      email: user.email,
      ptero_id: user.ptero_id,
    },
    create: user,
  });
}

export async function saveEggs(eggs) {
  await Promise.all(
    eggs.map((egg) =>
      prisma.egg.upsert({
        where: { id: egg.id },
        update: {
          uuid: egg.uuid,
          name: egg.name,
          description: egg.description,
          docker_image: egg.docker_image,
          startup: egg.startup,
        },
        create: egg,
      })
    )
  );
}

export async function saveNodes(nodes) {
  await Promise.all(
    nodes.map((node) =>
      prisma.node.upsert({
        where: { id: node.id },
        update: {
          name: node.name,
          location_id: node.location_id,
        },
        create: node,
      })
    )
  );
}

export async function getUser(discordId) {
  return prisma.user.findUnique({ where: { discord_id: discordId } });
}

export { prisma };
