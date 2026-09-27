#!/usr/bin/env bash
# Renders the favicon, home screen icons and link preview image from the HTML
# sources in scripts/brand using headless Chrome, then writes them into web/.
# Needs Google Chrome and Python 3 with Pillow.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

shot() { # src out width height [transparent]
	local bg=()
	[ "${5:-}" = transparent ] && bg=(--default-background-color=00000000)
	"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
		--virtual-time-budget=8000 ${bg[@]+"${bg[@]}"} --window-size="$3,$4" \
		--screenshot="$2" "file://$PWD/$1" >/dev/null 2>&1
}

shot scripts/brand/icon.html "$TMP/icon-512.png" 512 512 transparent
shot scripts/brand/og.html web/og-image.png 1200 630

python3 - "$TMP/icon-512.png" <<'PY'
import sys
from PIL import Image
src = Image.open(sys.argv[1]).convert("RGBA")
def out(size, path, bg=None):
    im = src.resize((size, size), Image.LANCZOS)
    if bg:
        flat = Image.new("RGB", im.size, bg)
        flat.paste(im, mask=im.split()[3])
        im = flat
    im.save(path, optimize=True)
out(512, "web/icon-512.png")
out(192, "web/icon-192.png")
out(32, "web/favicon-32.png")
out(16, "web/favicon-16.png")
# iOS ignores transparency on home screen icons; give it the page colour.
out(180, "web/apple-touch-icon.png", bg=(11, 16, 38))
src.save("web/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
PY
echo "Wrote web/favicon.ico, favicon-16/32.png, apple-touch-icon.png, icon-192/512.png, og-image.png"
