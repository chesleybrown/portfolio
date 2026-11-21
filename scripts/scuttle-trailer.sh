#!/usr/bin/env bash
# Converts Scuttle's iPhone App Preview into the web trailer at
# web/scuttle/media/trailer.mp4, then checks that the picture still lines up
# with the sound.
#
#   scripts/scuttle-trailer.sh <path to scuttle-sandbox>/Design/trailer/preview-iphone.mp4
#   scripts/scuttle-trailer.sh --check <preview-iphone.mp4>   # check the current file only
#
# Needs ffmpeg, ffprobe and Python 3.
#
# Why this exists: the App Preview has variable frame timing (its picture
# starts 0.1 s in, and some frames are held for longer than 1/30 s). A plain
# re-encode that ignores frame timestamps (e.g. `-vsync passthrough`, or `-r`
# on the input) squeezes those frames together, and the picture then runs ahead
# of the sound. In Nov 2026 that put the site's trailer ~0.65 s out of sync.
# The `fps=30:start_time=0` filter instead resamples to a steady 30 fps on the
# source's own clock, repeating held frames, so timing is kept.
set -euo pipefail
cd "$(dirname "$0")/.."

CHECK_ONLY=0
if [ "${1:-}" = "--check" ]; then CHECK_ONLY=1; shift; fi
SRC="${1:?usage: scripts/scuttle-trailer.sh [--check] path/to/preview-iphone.mp4}"
OUT=web/scuttle/media/trailer.mp4

if [ "$CHECK_ONLY" = 0 ]; then
	TMP="$(mktemp -d)"
	trap 'rm -rf "$TMP"' EXIT
	VF="[0:v]fps=30:start_time=0,scale=1280:592:flags=lanczos,format=yuv420p[v]"
	# Two passes at ~620 kb/s keep the file near 2.7 MB.
	ffmpeg -v error -y -i "$SRC" -filter_complex "$VF" -map "[v]" -an \
		-c:v libx264 -preset slow -b:v 620k -pass 1 -passlogfile "$TMP/pass" -f mp4 /dev/null
	ffmpeg -v error -y -i "$SRC" -filter_complex "$VF" -map "[v]" -map 0:a \
		-c:v libx264 -preset slow -b:v 620k -pass 2 -passlogfile "$TMP/pass" -profile:v high \
		-c:a aac -b:a 96k -ar 48000 -movflags +faststart "$OUT"
	echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
fi

python3 - "$SRC" "$OUT" <<'PY'
import json, re, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
FRAME = 1 / 30

def cuts(path):
    """Times (s) of hard scene cuts, on the file's own clock."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vf", "select='gt(scene,0.3)',showinfo",
                          "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    return [float(t) for t in re.findall(r"pts_time:([0-9.]+)", log)]

def streams(path):
    info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_entries",
                                      "stream=codec_type,start_time,duration", path],
                                     capture_output=True, text=True, check=True).stdout)
    return {s["codec_type"]: s for s in info["streams"]}

problems = []
a, b = cuts(src), cuts(out)
if len(a) != len(b):
    problems.append(f"scene cuts differ: source {a}, web {b}")
else:
    worst = max((abs(x - y) for x, y in zip(a, b)), default=0)
    print(f"{len(a)} scene cuts, worst drift {worst * 1000:.0f} ms")
    if worst > FRAME * 1.5:
        problems.append(f"picture is {worst * 1000:.0f} ms off the source at a scene cut "
                        f"(source {a}, web {b})")

s, o = streams(src), streams(out)
for kind in ("video", "audio"):
    if kind not in o:
        problems.append(f"web trailer has no {kind} stream")
a_off = float(o["audio"]["start_time"]) - float(s["audio"]["start_time"])
if abs(a_off) > 0.02:
    problems.append(f"audio starts {a_off * 1000:.0f} ms away from the source")
if abs(float(o["video"]["duration"]) - float(o["audio"]["duration"])) > 0.25:
    problems.append(f"video ({o['video']['duration']} s) and audio ({o['audio']['duration']} s) lengths differ")

if problems:
    print("OUT OF SYNC:\n  " + "\n  ".join(problems))
    sys.exit(1)
print("in sync with the source")
PY
