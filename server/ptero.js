import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { fileURLToPath } from 'url';
import { saveEggs, saveNodes } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, '..', 'config.yml');
const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.pterodactyl.apiKey}`,
};

export async function ensurePteroUser(discordUser) {
  try {
    const res = await fetch(
      `${config.pterodactyl.panelUrl}/api/application/users?filter[external_id]=${discordUser.id}`,
      { headers }
    );

    let data;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      console.error('Unexpected response from Pterodactyl when fetching user:', text);
      return null;
    }

    if (data.data && data.data.length > 0) {
      return data.data[0];
    }

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

    try {
      return await createRes.json();
    } catch (err) {
      const text = await createRes.text();
      console.error('Unexpected response from Pterodactyl when creating user:', text);
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function importEggsAndNodes() {
  try {
    const eggsRes = await fetch(
      `${config.pterodactyl.panelUrl}/api/application/nests?include=eggs`,
      { headers }
    );
    const eggsData = await eggsRes.json();
    const eggs = [];
    if (eggsData.data) {
      for (const nest of eggsData.data) {
        if (nest.attributes.eggs) {
          for (const egg of nest.attributes.eggs) {
            eggs.push({
              id: egg.id,
              uuid: egg.uuid,
              name: egg.name,
              description: egg.description,
              docker_image: egg.docker_image,
              startup: egg.startup,
            });
          }
        }
      }
    }
    await saveEggs(eggs);
  } catch (err) {
    console.error('Failed to import eggs', err);
  }

  try {
    const nodeRes = await fetch(`${config.pterodactyl.panelUrl}/api/application/nodes`, { headers });
    const nodeData = await nodeRes.json();
    const nodes = [];
    if (nodeData.data) {
      for (const node of nodeData.data) {
        nodes.push({
          id: node.attributes.id,
          name: node.attributes.name,
          location_id: node.attributes.location_id,
        });
      }
    }
    await saveNodes(nodes);
  } catch (err) {
    console.error('Failed to import nodes', err);
  }
}
