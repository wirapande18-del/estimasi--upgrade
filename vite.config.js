
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const legacyFiles = [
  'config.js',
  'storage.js',
  'excel.js',
  'app.js',
  'styles.css',
];

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-legacy-files',
      apply: 'build',
      closeBundle() {
        for (const file of legacyFiles) {
          if (existsSync(resolve(file))) {
            cpSync(resolve(file), resolve('dist', file));
          }
        }
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
  },
});
