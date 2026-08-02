#!/usr/bin/env bash
set -e

# Controlla che l'utente abbia inserito il file di input
if [ -z "$1" ]; then
  echo "❌ Errore: Specifica un video di input."
  echo "👉 Uso: ./scripts/encode-media.sh <video_input.mov|mp4> [nome_output]"
  exit 1
fi

INPUT="$1"

# Controlla se il file di input esiste realmente
if [ ! -f "$INPUT" ]; then
  echo "❌ Errore: Il file '$INPUT' non esiste."
  exit 1
fi

# Se non specifichi il nome output, usa il nome del file originale senza estensione
FILENAME=$(basename -- "$INPUT")
DEFAULT_NAME="${FILENAME%.*}"
NAME="${2:-$DEFAULT_NAME}"
OUTPUT_DIR="media-build/$NAME"

echo "🚀 Avvio pipeline HLS ad alte prestazioni per: $INPUT"
echo "📂 I file verranno salvati in: $OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Transcodifica universale con gestione metadati di rotazione, pixel format web-safe e audio opzionale
ffmpeg -autorotate -i "$INPUT" \
  -vf "scale='min(1920,iw)':-2" \
  -c:v libx264 \
  -profile:v high \
  -level 4.2 \
  -preset fast \
  -crf 22 \
  -maxrate 4500k \
  -bufsize 9000k \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  -ac 2 \
  -map 0:v:0 \
  -map 0:a? \
  -f hls \
  -hls_time 4 \
  -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/segment_%03d.ts" \
  "$OUTPUT_DIR/index.m3u8"

echo "--------------------------------------------------------"
echo "✅ Transcodifica completata con successo!"
echo "👉 Prossimo step: Carica l'INTERA cartella '$OUTPUT_DIR' nel tuo bucket Cloudflare R2."
echo "🔗 Il tuo URL HLS sarà: https://pub-xxxx.r2.dev/$NAME/index.m3u8"
echo "--------------------------------------------------------"