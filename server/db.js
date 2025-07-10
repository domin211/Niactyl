import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function init() {
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
