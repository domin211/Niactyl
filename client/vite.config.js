import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const configPath = path.resolve(__dirname, '../config.yml');
const config = YAML.parse(fs.readFileSync(configPath, 'utf8'));
const { port } = new URL(config.domain);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // listen locally so the external domain works
    port: port ? parseInt(port, 10) : 5173,
  },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(config.domain),
  },
});
