#!/bin/bash
# Bundles everything into one self-contained file: dist/banchory-bampots.html
set -e
cd "$(dirname "$0")"
mkdir -p dist
OUT=dist/banchory-bampots.html
sed '/<!-- Plain scripts/,$d' index.html > "$OUT"
echo '<script>' >> "$OUT"
cat src/*.js >> "$OUT"
printf '</script>\n</body>\n</html>\n' >> "$OUT"
echo "Built $OUT ($(wc -c < "$OUT") bytes)"
