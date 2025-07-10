export default async function (fastify, opts) {
  fastify.get('/api/message', async () => {
    return { message: 'Hello from server!' };
  });

  fastify.get('/api/user', async (req) => {
    return { user: req.session.user || null };
  });
}
