import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    markdoc(),
    // Forziamo Keystatic a funzionare come Single Page App statica per il pannello Admin
    keystatic({
      configPath: './keystatic.config', // o l'estensione che usi (.ts/.js)
    })
  ],

  adapter: cloudflare(),
});