#!/usr/bin/env bash
# Encode demo media for the site.
#
#   bash scripts/encode-media.sh <source-dir> [out-dir]
#
# <source-dir> holds the original clips named by their Mixkit id (e.g. 4231.mp4).
# For real work: copy this file, point the table at your own masters, and set out-dir to public/media/real.
#
# Per clip it writes: <slug>.mp4 (H.264, no audio), <slug>.webm (VP9), <slug>.jpg + <slug>.avif posters.
# Notes: no drawtext (fontconfig crashes on some Windows builds). Previews are 6s loops, ~<=1.5 MB.
set -euo pipefail

SRC="${1:?usage: encode-media.sh <source-dir> [out-dir]}"
OUT="${2:-public/media/demo}"
mkdir -p "$OUT"
FF="ffmpeg -v error -y"
H264="-c:v libx264 -crf 28 -preset veryfast -pix_fmt yuv420p -movflags +faststart -an"
VP9="-c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -deadline good -cpu-used 4 -pix_fmt yuv420p -an"
# Simulated "log/raw" look for before/after demos: flat contrast, low saturation, lifted blacks, soft.
LOG="eq=contrast=0.75:saturation=0.45:brightness=0.03,curves=all='0/0.07 1/0.94',gblur=sigma=0.6"

# geometry <aspect> <xpos 0..1> <ypos 0..1>  -> crop/scale filter for the requested aspect
geometry() {
  local a="$1" x="${2:-0.5}" y="${3:-0.5}"
  case "$a" in
    16x9)  echo "scale=1280:-2" ;;
    21x9)  echo "crop=iw:trunc(iw/2.3333/2)*2:0:(ih-iw/2.3333)*$y,scale=1280:-2" ;;
    9x16)  echo "crop=trunc(ih*9/16/2)*2:ih:(iw-ih*9/16)*$x:0,scale=-2:720" ;;
    9x16v) echo "scale=-2:960" ;;               # source is already vertical
    1x1)   echo "crop=ih:ih:(iw-ih)*$x:0,scale=720:720" ;;
    4x5)   echo "crop=trunc(ih*4/5/2)*2:ih:(iw-ih*4/5)*$x:0,scale=-2:720" ;;
  esac
}

poster() { # <in.mp4> <slug>
  $FF -ss 0.6 -i "$1" -frames:v 1 -q:v 4 "$OUT/$2.jpg"
  $FF -i "$OUT/$2.jpg" -c:v libaom-av1 -still-picture 1 -crf 34 -cpu-used 6 "$OUT/$2.avif"
}

# loop <slug> <src-id> <aspect> <in-point s> <duration s> [x] [y] [extra-filter]
loop() {
  local slug="$1" id="$2" aspect="$3" ss="$4" t="$5" x="${6:-0.5}" y="${7:-0.5}" extra="${8:-}"
  local vf; vf="fps=24,$(geometry "$aspect" "$x" "$y")"
  [ -n "$extra" ] && vf="$vf,$extra"
  $FF -ss "$ss" -t "$t" -i "$SRC/$id.mp4" -vf "$vf" $H264 "$OUT/$slug.mp4"
  $FF -i "$OUT/$slug.mp4" $VP9 "$OUT/$slug.webm"
  poster "$OUT/$slug.mp4" "$slug"
  echo "  $slug  $(du -k "$OUT/$slug.mp4" | cut -f1)KB mp4 / $(du -k "$OUT/$slug.webm" | cut -f1)KB webm"
}

echo "Project previews"
loop night-shift  4231  16x9  2   6
loop switchback   41576 21x9  8   6   0.5 0.62
loop red-room     44560 16x9  1   6
loop embers       513   21x9  4   6   0.5 0.55
loop afterhours   51283 9x16v 2   6
loop lash-line    367   9x16  2   6   0.56
loop mic-check    44050 16x9  3   6
loop hot-take     44028 9x16  2   6   0.52
loop side-b       424   1x1   3   6   0.5
loop wet-neon     4332  16x9  3   6

echo "Raw -> final pairs"
loop grade        4629  16x9  0   6.5 0.5 0.5 "eq=contrast=1.08:saturation=1.12"
loop grade-log    4629  16x9  0   6.5 0.5 0.5 "$LOG"
loop talk         44028 16x9  2   6
# Pacing: the "assembly" is the raw walk; the "fine cut" keeps four 1.5s beats of the same take.
loop pace-raw     4855  16x9  0   6
$FF -i "$SRC/4855.mp4" -filter_complex "\
[0:v]trim=0:1.5,setpts=PTS-STARTPTS[a];[0:v]trim=3:4.5,setpts=PTS-STARTPTS[b];\
[0:v]trim=6:7.5,setpts=PTS-STARTPTS[c];[0:v]trim=9:10.5,setpts=PTS-STARTPTS[d];\
[a][b][c][d]concat=n=4:v=1,fps=24,scale=1280:-2[v]" -map "[v]" $H264 "$OUT/pace-cut.mp4"
$FF -i "$OUT/pace-cut.mp4" $VP9 "$OUT/pace-cut.webm"; poster "$OUT/pace-cut.mp4" pace-cut
echo "  pace-cut done"

echo "Showreel montage (cut to a 24fps rhythm)"
# id:in-point:duration — 16:9 sources only
SHOTS="4332:3:1.2 367:2.5:0.8 41576:9:1.5 44560:2:1.0 4231:4:1.2 424:5:0.8 513:5:1.5 44028:3:1.0 4855:2:1.0 44050:6:1.0 4629:1:1.6 41576:30:1.4"
inputs=""; filters=""; n=0
for s in $SHOTS; do
  IFS=: read -r id ss t <<< "$s"
  inputs="$inputs -ss $ss -t $t -i $SRC/$id.mp4"
  filters="$filters[$n:v]fps=24,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,setpts=PTS-STARTPTS[v$n];"
  n=$((n+1))
done
concat=""; for i in $(seq 0 $((n-1))); do concat="$concat[v$i]"; done
# shellcheck disable=SC2086
$FF $inputs -filter_complex "${filters}${concat}concat=n=$n:v=1[out]" -map "[out]" \
  -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an "$OUT/reel.mp4"
$FF -i "$OUT/reel.mp4" $VP9 "$OUT/reel.webm"
poster "$OUT/reel.mp4" reel
# Mobile hero variant: 4:5 crop, smaller.
$FF -i "$OUT/reel.mp4" -vf "$(geometry 4x5 0.5)" -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p -movflags +faststart -an "$OUT/reel-m.mp4"
$FF -i "$OUT/reel-m.mp4" $VP9 "$OUT/reel-m.webm"
poster "$OUT/reel-m.mp4" reel-m
echo "  reel $(du -k "$OUT/reel.mp4" | cut -f1)KB / reel-m $(du -k "$OUT/reel-m.mp4" | cut -f1)KB"
echo "Done -> $OUT"
