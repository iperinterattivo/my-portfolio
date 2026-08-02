import { config, fields, collection, singleton } from '@keystatic/core';

// Helper 1: Selettore del tipo di media
const mediaTypeField = fields.select({
  label: 'Tipo di Media',
  options: [
    { label: 'Immagine / GIF Animata Locale', value: 'image' },
    { label: 'Video HLS (.m3u8) o Loop MP4/WebM da R2', value: 'video' },
    { label: 'YouTube (Loop Silenzioso / Autoplay)', value: 'youtube' },
  ],
  defaultValue: 'image',
});

// Helper 2: Selettore Proporzioni (Aspect Ratio)
const aspectRatioField = (defaultValue = '16-9') => fields.select({
  label: 'Proporzione Canvas (Aspect Ratio)',
  options: [
    { label: '21:9 Cinema Ultrawide', value: '21-9' },
    { label: '16:9 Landscape Standard', value: '16-9' },
    { label: '4:3 Fotografia Orizzontale', value: '4-3' },
    { label: '1:1 Quadrato Perfetto', value: '1-1' },
    { label: '4:5 Social Portrait (Instagram)', value: '4-5' },
    { label: '3:4 Fotografia Verticale', value: '3-4' },
    { label: '9:16 Full Vertical (Reels / TikTok)', value: '9-16' },
  ],
  defaultValue: defaultValue as any,
});

// Helper 3: Checkbox Universale per lo Stack Mobile (utilizzato dagli altri componenti)
const mobileStackField = fields.checkbox({
  label: '📱 Dividi singolarmente su Mobile (Stack a 1 Colonna)',
  description: 'ATTIVO: su smartphone vanno uno sotto l\'altro. DISATTIVO: restano affiancati in scala.',
  defaultValue: true,
});

// Helper 4: Didascalia Tipografica Universale in alto a sinistra
const sectionCaptionField = fields.text({
  label: '🏷️ Didascalia Sezione (In alto a sinistra)',
  description: 'Testo opzionale che appare sopra il layout in elegante font mono tecnico (es: // PHASE 01 — CONCEPT ARTWORK).',
});

export default config({
  storage: { kind: 'local' },

  singletons: {
    siteSettings: singleton({
      label: 'Impostazioni Sito',
      path: 'src/content/siteSettings',
      schema: {
        gridColumns: fields.select({
          label: 'Colonne della Griglia Progetti (Desktop)',
          description: 'Scegli il layout della galleria nella homepage.',
          options: [
            { label: '2 Colonne', value: '2' },
            { label: '3 Colonne', value: '3' },
            { label: '4 Colonne', value: '4' },
            { label: '5 Colonne', value: '5' },
          ],
          defaultValue: '5',
        }),
        
        orderedProjects: fields.array(
          fields.relationship({
            label: 'Progetto',
            collection: 'projects',
          }),
          {
            label: 'Ordine Progetti (Drag & Drop)',
            description: 'Aggiungi i progetti e trascinali per decidere l\'ordine esatto in cui appariranno. I progetti non inclusi appariranno alla fine.',
            itemLabel: props => props.value || 'Seleziona un progetto'
          }
        ),
      },
    }),
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
        category: fields.text({ label: 'Categoria / Studio', defaultValue: 'URBANFRAME STUDIO' }),
        coverImage: fields.image({
          label: 'Immagine di Copertina (Thumbnail Griglia Works)',
          directory: 'src/assets/projects/covers',
          publicPath: '/src/assets/projects/covers/',
        }),

        mediaFlow: fields.blocks({
          
          heroCinematic: {
            label: '██████████ [01] Hero Cinematic Full-Bleed',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              aspectRatio: aspectRatioField('21-9'),
              type: mediaTypeField,
              image: fields.image({ label: 'Immagine', directory: 'src/assets/projects/m01', publicPath: '/src/assets/projects/m01/' }),
              r2Url: fields.url({ label: 'URL Video / Link YouTube' }),
              caption: fields.text({ label: 'Didascalia inferiore (opzionale)' }),
            }),
          },

          gridTop8x2: {
  label: '⊞ ⊞ ⊞ ⊞ ⊞ ⊞ ⊞ ⊞  [02] Top Preview Grid',
  schema: fields.object({
    sectionCaption: sectionCaptionField,
    mobileStack: mobileStackField,
    folderName: fields.text({ label: '⚡ CARTELLA AUTOMATICA LOCALE: Nome cartella in src/assets/projects/.' }),
    
    // 👇 NUOVO CAMPO: Supporta link Cloudflare R2 / HLS / YouTube
    items: fields.array(
      fields.object({
        r2Url: fields.text({ label: 'Link Esterno / Cloudflare (MP4, M3U8, YouTube)' }),
        image: fields.image({ 
          label: 'Oppure File Locale', 
          directory: 'src/assets/projects/m02', 
          publicPath: '/src/assets/projects/m02/' 
        }),
      }),
      { 
        label: '🔗 MEDIA CLOUDFLARE E MISTI', 
        itemLabel: props => props.value.r2Url ? `☁️ ${props.value.r2Url}` : '🎞️ Media Locale' 
      }
    ),

    // Campo legacy mantenuto per non rompere i vecchi progetti
    images: fields.array(
      fields.image({ 
        label: 'Frame Griglia', 
        directory: 'src/assets/projects/m02', 
        publicPath: '/src/assets/projects/m02/' 
      }),
      { label: 'METODO MANUALE (Solo Immagini Locali)', itemLabel: props => '🎞️ Frame Griglia Caricato' }
    ),
  }),
},

          split5050: {
            label: '▌▌│▐▐  [03] Split Screen 50 / 50',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              mobileStack: mobileStackField,
              aspectRatio: aspectRatioField('1-1'),
              leftType: mediaTypeField,
              leftImage: fields.image({ label: 'Immagine Sinistra', directory: 'src/assets/projects/m03l', publicPath: '/src/assets/projects/m03l/' }),
              leftR2: fields.url({ label: 'Video Sinistra / YouTube' }),
              rightType: mediaTypeField,
              rightImage: fields.image({ label: 'Immagine Destra', directory: 'src/assets/projects/m03r', publicPath: '/src/assets/projects/m03r/' }),
              rightR2: fields.url({ label: 'Video Destra / YouTube' }),
            }),
          },

          asymmetric7030: {
            label: '████│██  [04] Asimmetrico 70 / 30',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              leftRatio: aspectRatioField('16-9'),
              leftType: mediaTypeField,
              leftImage: fields.image({ label: 'Immagine Dominante (70%)', directory: 'src/assets/projects/m04l', publicPath: '/src/assets/projects/m04l/' }),
              leftR2: fields.url({ label: 'Video Dominante / YouTube' }),
              rightRatio: aspectRatioField('3-4'),
              rightType: mediaTypeField,
              rightImage: fields.image({ label: 'Immagine Secondaria (30%)', directory: 'src/assets/projects/m04r', publicPath: '/src/assets/projects/m04r/' }),
              rightR2: fields.url({ label: 'Video Secondario / YouTube' }),
            }),
          },

          asymmetric3070: {
            label: '██│████  [05] Asimmetrico 30 / 70',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              leftRatio: aspectRatioField('3-4'),
              leftType: mediaTypeField,
              leftImage: fields.image({ label: 'Immagine Secondaria (30%)', directory: 'src/assets/projects/m05l', publicPath: '/src/assets/projects/m05l/' }),
              leftR2: fields.url({ label: 'Video Secondario / YouTube' }),
              rightRatio: aspectRatioField('16-9'),
              rightType: mediaTypeField,
              rightImage: fields.image({ label: 'Immagine Dominante (70%)', directory: 'src/assets/projects/m05r', publicPath: '/src/assets/projects/m05r/' }),
              rightR2: fields.url({ label: 'Video Dominante / YouTube' }),
            }),
          },

          triptychGrid: {
            label: '▮ │ ▮ │ ▮  [06] Trittico Gallery',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              mobileStack: mobileStackField,
              folderName: fields.text({ label: '⚡ CARTELLA AUTOMATICA LOCALE' }),
              aspectRatio: aspectRatioField('4-3'),
              items: fields.array(
                fields.object({
                  type: mediaTypeField,
                  image: fields.image({ label: 'Immagine', directory: 'src/assets/projects/m06', publicPath: '/src/assets/projects/m06/' }),
                  r2Url: fields.url({ label: 'URL Video / YouTube' }),
                  title: fields.text({ label: 'Etichetta interna' }),
                }),
                { label: 'METODO MANUALE', itemLabel: props => props.fields.title.value || '🖼️ Elemento Trittico' }
              ),
            }),
          },

          verticalReelsGrid: {
            label: '║ ║ ║ ║ ║  [07] Vertical Reels Grid (2-20 Colonne)',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              
              // LA LOGICA CONDIZIONALE: La tendina appare solo se la spunta è attiva
              mobileLayout: fields.conditional(
                fields.checkbox({
                  label: '📱 Dividi su Mobile (Multicolonna)',
                  description: 'Seleziona per dividere i reel in più colonne su smartphone. Se non spuntato, andranno in fila indiana (1 colonna).',
                  defaultValue: false,
                }),
                {
                  true: fields.select({
                    label: 'Numero Colonne Mobile',
                    options: [
                      { label: '2 Colonne', value: '2' },
                      { label: '3 Colonne', value: '3' },
                      { label: '4 Colonne', value: '4' },
                      { label: '5 Colonne', value: '5' },
                    ],
                    defaultValue: '2',
                  }),
                  false: fields.empty(), // Se non c'è la spunta, nasconde il selettore
                }
              ),

              folderName: fields.text({ label: '⚡ CARTELLA AUTOMATICA LOCALE' }),
              aspectRatio: aspectRatioField('9-16'),
              columns: fields.select({
                label: 'Densità Griglia (Desktop)',
                options: [
                  { label: '2 Colonne', value: '2' },
                  { label: '3 Colonne', value: '3' },
                  { label: '4 Colonne', value: '4' },
                  { label: '5 Colonne', value: '5' },
                  { label: '10 Colonne', value: '10' },
                  { label: '15 Colonne', value: '15' },
                  { label: '20 Colonne', value: '20' },
                ],
                defaultValue: '5',
              }),
              items: fields.array(
                fields.object({
                  type: mediaTypeField,
                  image: fields.image({ label: 'Immagine', directory: 'src/assets/projects/m07', publicPath: '/src/assets/projects/m07/' }),
                  r2Url: fields.url({ label: 'URL Video / YouTube' }),
                  caption: fields.text({ label: 'Etichetta/Titolo' }),
                }),
                { label: 'METODO MANUALE', itemLabel: props => props.fields.caption.value || '📱 Elemento Griglia' }
              ),
            }),
          },

          bentoGrid: {
            label: '███│█  [08] Bento Grid Editoriale (1 Grande + 2 Piccoli)',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              mainType: mediaTypeField,
              mainImage: fields.image({ label: 'Immagine Principale', directory: 'src/assets/projects/m08m', publicPath: '/src/assets/projects/m08m/' }),
              mainR2: fields.url({ label: 'Video Principale / YouTube' }),
              topRightType: mediaTypeField,
              topRightImage: fields.image({ label: 'Immagine Alto Destra', directory: 'src/assets/projects/m08tr', publicPath: '/src/assets/projects/m08tr/' }),
              topRightR2: fields.url({ label: 'Video Alto Destra / YouTube' }),
              bottomRightType: mediaTypeField,
              bottomRightImage: fields.image({ label: 'Immagine Basso Destra', directory: 'src/assets/projects/m08br', publicPath: '/src/assets/projects/m08br/' }),
              bottomRightR2: fields.url({ label: 'Video Basso Destra / YouTube' }),
            }),
          },

          galleryIsolated: {
            label: '── ■ ──  [09] Gallery Isolated (Singolo Centrato)',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              aspectRatio: aspectRatioField('4-3'),
              type: mediaTypeField,
              image: fields.image({ label: 'Immagine', directory: 'src/assets/projects/m09', publicPath: '/src/assets/projects/m09/' }),
              r2Url: fields.url({ label: 'URL Video / YouTube' }),
              caption: fields.text({ label: 'Didascalia inferiore' }),
            }),
          },

          doubleIsolated: {
            label: '── ■ ■ ──  [13] Double Gallery Isolated (Coppia Centrata)',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              mobileStack: mobileStackField,
              leftType: mediaTypeField,
              leftImage: fields.image({ label: 'Immagine Sinistra', directory: 'src/assets/projects/m13l', publicPath: '/src/assets/projects/m13l/' }),
              leftR2: fields.url({ label: 'URL Video Sinistra' }),
              rightType: mediaTypeField,
              rightImage: fields.image({ label: 'Immagine Destra', directory: 'src/assets/projects/m13r', publicPath: '/src/assets/projects/m13r/' }),
              rightR2: fields.url({ label: 'URL Video Destra' }),
            }),
          },

          filmstrip: {
            label: '▣─▣─▣─▣  [10] Filmstrip Marquee',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              folderName: fields.text({ label: '⚡ CARTELLA AUTOMATICA LOCALE' }),
              images: fields.array(
                fields.image({ label: 'Frame Pellicola', directory: 'src/assets/projects/m10', publicPath: '/src/assets/projects/m10/' }),
                { label: 'METODO MANUALE', itemLabel: props => '🎞️ Frame Pellicola' }
              ),
            }),
          },

          editorialQuote: {
            label: '“ …”    [11] Interruzione Editoriale',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              quote: fields.text({ label: 'Citazione', multiline: true }),
              author: fields.text({ label: 'Autore / Nota Tecnica' }),
            }),
          },

          animatedLoopsGrid: {
            label: '↻ ↻ ↻ ↻ ↻  [12] Animated Loops Grid',
            schema: fields.object({
              sectionCaption: sectionCaptionField,
              mobileStack: mobileStackField,
              folderName: fields.text({ label: '⚡ CARTELLA AUTOMATICA LOCALE' }),
              columns: fields.select({
                label: 'Numero Colonne Griglia',
                options: [{ label: '2 Colonne', value: '2' }, { label: '3 Colonne', value: '3' }, { label: '4 Colonne', value: '4' }],
                defaultValue: '3',
              }),
              items: fields.array(
                fields.object({
                  type: fields.select({
                    label: 'Tipo',
                    options: [{ label: 'Immagine / GIF Locale', value: 'image' }, { label: 'Video R2 / YouTube', value: 'video' }],
                    defaultValue: 'image',
                  }),
                  image: fields.image({ label: 'File Animato', directory: 'src/assets/projects/m12', publicPath: '/src/assets/projects/m12/' }),
                  r2Url: fields.url({ label: 'URL Video / YouTube' }),
                  caption: fields.text({ label: 'Etichetta Loop' }),
                }),
                { label: 'METODO MANUALE', itemLabel: props => props.fields.caption.value || '↻ Animazione Loop' }
              ),
            }),
          },

        }, { label: 'Costruisci il Layout della Pagina' }),

        content: fields.markdoc({ label: 'Case Study & Descrizione Testuale' }),
      },
    }),
  },
});