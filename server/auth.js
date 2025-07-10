import fastifyOauth2 from '@fastify/oauth2';
import fetch from 'node-fetch';
import { ensurePteroUser } from './ptero.js';
import { saveUser } from './db.js';

export default async function (fastify, opts) {
  const { discord, domain } = opts.config;

  await fastify.register(fastifyOauth2, {
    name: 'discordOAuth2',
    scope: ['identify', 'email'],
    credentials: {
      client: {
        id: discord.clientId,
        secret: discord.clientSecret,
      },
      auth: {
        authorizeHost: 'https://discord.com',
        authorizePath: '/oauth2/authorize',
        tokenHost: 'https://discord.com',
        tokenPath: '/api/oauth2/token',
      },
    },
    startRedirectPath: '/auth/discord',
    callbackUri: discord.callbackUrl,
  });

  fastify.get('/auth/discord/callback', async function (req, reply) {
    const { token } = await this.discordOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    let discordUser;
    try {
      discordUser = await userRes.json();
    } catch (err) {
      const text = await userRes.text();
      this.log.error(`Unexpected response from Discord: ${text}`);
      reply.code(500);
      return { error: 'Failed to fetch Discord user' };
    }

    if (!discordUser.id) {
      this.log.error('Discord user response missing id');
      reply.code(500);
      return { error: 'Invalid Discord user data' };
    }

    req.session.user = discordUser;

    const pteroUser = await ensurePteroUser(discordUser);
    await saveUser({
      discord_id: discordUser.id,
      username: discordUser.username,
      email: discordUser.email,
      ptero_id: pteroUser ? pteroUser.attributes?.id ?? null : null,
    });
    reply.redirect('/dashboard');
  });
}
