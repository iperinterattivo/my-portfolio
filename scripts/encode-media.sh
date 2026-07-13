#!/usr/bin/env bash
set -e

# Controlla che l'utente abbia inserito il file di input
if [ -z "$1" ]; then
  echo "❌ Error: Specifica un video di input. Uso: ./scripts/encode-media.sh video.mp4 [nome_output]"
  exit 1
fi

INPUT="$1"
# Se non specifichi il nome output, usa "output"
NAME="${2:-output}"
OUTPUT_DIR="media-build/$NAME"

echo "🚀 Avvio pipeline HLS ad alte prestazioni per: $INPUT"
mkdir -p "$OUTPUT_DIR"

# Transcodifica ad altissima efficienza in H.264 / AAC
# Crea un frammentamento HLS in segmenti da 4 secondi (.ts) e genera la playlist (.m3u8)
ffmpeg -i "$INPUT" \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 -profile:v high -level 4.2 \
  -preset slow -crf 22 \
  -maxrate 4500k -bufsize 9000k \
  -c:a aac -b:a 128k -ac 2 \
  -f hls \
  -hls_time 4 \
  -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/segment_%03d.ts" \
  "$OUTPUT_DIR/index.m3u8"

echo "✅ Transcodifica completata! Trovi i file nella cartella: $OUTPUT_DIR"
echo "👉 Prossimo step: Carica l'INTERA cartella '$NAME' nel tuo bucket Cloudflare R2."
