import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// L'import di cloudflare è stato rimosso

export default defineConfig({
  // Il sito sarà puramente statico (niente crash per colpa dei worker)
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    markdoc(),
    // Forziamo Keystatic a funzionare come Single Page App statica per il pannello Admin
    keystatic({
      configPath: './keystatic.config',
    })
  ]
  
  // L'adapter di Cloudflare è stato rimosso completamente.
  // Astro genererà puro HTML/CSS/JS nella cartella /dist
});