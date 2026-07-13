import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

export default defineConfig({
  // Architettura 100% Static Site Generation (SSG). 
  // Nessun server locale, nessun emulatore, stabilità assoluta.
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    markdoc(),
    keystatic()
  ],
});
