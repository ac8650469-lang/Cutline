#!/usr/bin/env bash
# Encode Arteniq's real portfolio media into public/media/real/.
#
#   bash scripts/encode-real.sh <source-dir> [out-dir]
#
# <source-dir> holds the masters from the "Portfolio/website based cuts" Drive folder, renamed to the
# ids used below (e.g. anneportland.mp4). Per project it writes:
#   <slug>.mp4 / .webm   6 s silent preview loop (grid, services, inline clips)
#   <slug>.jpg / .avif   poster frames
#   <slug>-full.mp4      the full piece with sound, 720p-class, for the player
# plus reel.* (16:9 montage) and reel-m.* (9:16 montage).
# ONLY="kolkata reel" bash scripts/encode-real.sh <dir>   re-encodes just those names.
set -euo pipefail

SRC="${1:?usage: encode-real.sh <source-dir> [out-dir]}"
OUT="${2:-public/media/real}"
mkdir -p "$OUT"
FF="ffmpeg -v error -y -nostdin"
want() { [ -z "${ONLY:-}" ] || [[ " $ONLY " == *" $1 "* ]]; }
H264="-c:v libx264 -crf 28 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an"
VP9="-c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 4 -pix_fmt yuv420p -an"
FULL="-c:v libx264 -crf 27 -preset medium -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k -ac 2"

# geometry <shape> -> scale/crop filter. 16x9 / 9x16 sources keep their frame; 4x3 crops to 16:9.
geometry() {
  case "$1" in
    16x9) echo "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1" ;;
    9x16) echo "scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1" ;;
  esac
}

poster() { # <in.mp4> <name>
  $FF -ss 0.5 -i "$1" -frames:v 1 -q:v 4 "$OUT/$2.jpg"
  $FF -i "$OUT/$2.jpg" -c:v libaom-av1 -still-picture 1 -crf 34 -cpu-used 6 "$OUT/$2.avif"
}

# project <slug> <src-id> <shape> <preview in-point s>
project() {
  local slug="$1" id="$2" shape="$3" ss="$4" g; g="$(geometry "$shape")"
  want "$slug" || return 0
  $FF -ss "$ss" -t 6 -i "$SRC/$id.mp4" -vf "fps=24,$g" $H264 "$OUT/$slug.mp4"
  $FF -i "$OUT/$slug.mp4" $VP9 "$OUT/$slug.webm"
  poster "$OUT/$slug.mp4" "$slug"
  $FF -i "$SRC/$id.mp4" -vf "$g" $FULL "$OUT/$slug-full.mp4"
  echo "  $slug  preview $(du -k "$OUT/$slug.mp4" | cut -f1)KB · full $(du -k "$OUT/$slug-full.mp4" | cut -f1)KB"
}

# montage <name> <shape> <id:in:dur>... — hard cuts, silent, 24 fps
montage() {
  local name="$1" shape="$2"; shift 2
  want "$name" || return 0
  local g; g="$(geometry "$shape")"
  local inputs=() filters="" labels="" i=0
  for seg in "$@"; do
    IFS=: read -r id ss dur <<<"$seg"
    inputs+=(-ss "$ss" -t "$dur" -i "$SRC/$id.mp4")
    filters+="[$i:v]fps=24,$g,format=yuv420p[v$i];"
    labels+="[v$i]"
    i=$((i + 1))
  done
  $FF "${inputs[@]}" -filter_complex "${filters}${labels}concat=n=$i:v=1:a=0[out]" -map "[out]" $H264 "$OUT/$name.mp4"
  $FF -i "$OUT/$name.mp4" $VP9 "$OUT/$name.webm"
  poster "$OUT/$name.mp4" "$name"
  echo "  $name  $(du -k "$OUT/$name.mp4" | cut -f1)KB"
}

echo "Projects"
project old-money-portland   anneportland           16x9 25
project az-coffee            coalition-tech         9x16 12
project neon-nights          reel1                  16x9 8.3
project indianapolis-2026    indianapolis           16x9 0.5
project ai-finance           ai-finance             9x16 0.5
project creator-reel         asli-sample            9x16 20
project houston-market       natasha-houston        16x9 1
project eclipse              jan19                  16x9 3.5
project editing-with-claude  videoeditingwithclaude 16x9 1
project macbook-m4           speedramping           9x16 6.6
project focus-hijacked       focus-hijacked         9x16 22
project denver-market        realestate             16x9 58
project red-signal           reel2                  16x9 1.2
project good-editing         white-folder           9x16 1
project kolkata              notiondown             16x9 2.4
project cinematic-fonts      cinematic-fonts        16x9 1.5
project red-room-mood        jan5                   16x9 1

echo "Showreel"
montage reel 16x9 \
  reel1:8.3:1.6 notiondown:2.6:1.4 jan19:4:1.5 cinematic-fonts:1.5:1.5 jan5:1:1.4 reel2:6.5:1.4 \
  indianapolis:0.5:1.6 ho-ja-yaar:5:1.4 videoeditingwithclaude:1:1.4 anneportland:26:1.4 \
  jan18:1.5:1.3 reel1:12:1.6 notiondown:20.7:1.4 reel2:1.3:1.5
montage reel-m 9x16 \
  coalition-tech:12:1.5 ai-finance:0.5:1.4 asli-sample:20:1.5 speedramping:1.8:1.5 \
  focus-hijacked:22:1.4 white-folder:1:1.4 jan6:8:1.4 coalition-tech:28:1.5 \
  asli-sample:100:1.4 ai-finance:7:1.5 speedramping:10:1.5
