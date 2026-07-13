import { config, fields, collection } from '@keystatic/core';

export default config({
  // Scrittura diretta sul file system locale. 
  // Modifichi -> Push su GitHub -> Cloudflare Pages pubblica in 30 secondi.
  storage: {
    kind: 'local',
  },
  collections: {
    projects: collection({
      label: 'Progetti Portfolio',
      slugField: 'title',
      path: 'src/content/projects/*/',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Titolo Progetto' } }),
        tagline: fields.text({ label: 'Sottotitolo / Tagline ad impatto' }),
        r2VideoUrl: fields.url({ 
          label: 'URL Video da Cloudflare R2', 
          description: 'Incolla qui il link pubblico al file video o .m3u8 caricato nel bucket R2' 
        }),
        coverImage: fields.image({
          label: 'Immagine di Copertina HD',
          description: 'Verrà salvata in locale e ottimizzata in AVIF/WebP durante la build',
          directory: 'src/assets/projects',
          publicPath: '../../assets/projects/',
        }),
        content: fields.markdoc({ label: 'Case Study & Dettagli Progetto' }),
      },
    }),
  },
});
