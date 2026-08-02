#!/usr/bin/env bash
set -e

# Controlla che sia stata passata una cartella come parametro
if [ -z "$1" ]; then
  echo "❌ Errore: Specifica il percorso della cartella contenente le GIF."
  echo "👉 Uso: ./converti-gif-folder.sh /percorso/alla/cartella"
  exit 1
fi

SOURCE_DIR="$1"

# Controlla se la cartella esiste realmente
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Errore: La cartella '$SOURCE_DIR' non esiste."
  exit 1
fi

# Crea la cartella di output dentro la cartella specificata
OUTPUT_DIR="$SOURCE_DIR/gif_convertite"
mkdir -p "$OUTPUT_DIR"

echo "🚀 Inizio conversione GIF -> WebM"
echo "📂 Cartella sorgente: $SOURCE_DIR"
echo "📂 Cartella destinazione: $OUTPUT_DIR"
echo "--------------------------------------------------------"

COUNT=0

# Scansiona tutte le GIF presenti nella cartella sorgente
for file in "$SOURCE_DIR"/*.gif "$SOURCE_DIR"/*.GIF; do
  # Verifica se ci sono effettivamente file GIF
  [ -e "$file" ] || continue

  FILENAME=$(basename -- "$file")
  NAME="${FILENAME%.*}"
  OUTPUT_FILE="$OUTPUT_DIR/${NAME}.webm"

  echo "🎬 Convertendo: $FILENAME -> ${NAME}.webm"

  ffmpeg -hide_banner -loglevel error -stats -i "$file" \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -c:v libvpx-vp9 \
    -crf 20 \
    -b:v 0 \
    -deadline good \
    -cpu-used 4 \
    -pix_fmt yuv420p \
    -an \
    "$OUTPUT_FILE"

  COUNT=$((COUNT + 1))
done

echo "--------------------------------------------------------"
if [ "$COUNT" -eq 0 ]; then
  echo "⚠️  Nessun file .gif trovato in '$SOURCE_DIR'."
else
  echo "✅ Completato! Convertite con successo $COUNT GIF."
  echo "📁 Trovi i file convertiti in: $OUTPUT_DIR"
fi
echo "--------------------------------------------------------"