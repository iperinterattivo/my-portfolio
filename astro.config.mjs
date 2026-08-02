import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Rileviamo se siamo su Cloudflare (produzione) o sul tuo Mac (sviluppo)
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  // Il sito sarà puramente statico
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),
    markdoc(),
    
    // Il trucco da maestri: iniettiamo il pannello Keystatic SOLO in locale. 
    // In produzione viene ignorato, così Astro non richiede nessun server/adapter 
    // e la build non andrà mai più in crash.
    ...(isProd ? [] : [keystatic({
      configPath: './keystatic.config',
    })])
  ]
});