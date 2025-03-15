import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/private-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/certificate.pem')),
    },
    port: 5173, // Adjust port as needed
    host: '0.0.0.0',
  },
});