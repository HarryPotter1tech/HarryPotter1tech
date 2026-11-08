#!/bin/bash
# 双屏壁纸合成：模糊放大填充 + 原图居中叠加，拼接为 spanned 壁纸并应用
# 无损 PNG 输出（源图建议用 4x 高清原图 qy-fan-anime.png）
# 用法: bash compose-dual.sh <源图路径> [输出png路径]
set -e

SRC="${1:?用法: $0 <源图> [输出png]}"
OUT="${2:-$HOME/.local/share/wallpapers/qy-dual-hd.png}"

W0=3408; H0=2130   # 左屏 DP-0
W1=4096; H1=2304   # 右屏 HDMI-0 (AOC)

ffmpeg -y -v error -i "$SRC" -filter_complex \
  "[0:v]split=2[a][b];[a]scale=${W0}:${H0}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W0}:${H0},boxblur=40:10[bg];[b]scale=${W0}:-2:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" \
  -frames:v 1 -pix_fmt rgb24 /tmp/fill-m0.png

ffmpeg -y -v error -i "$SRC" -filter_complex \
  "[0:v]split=2[a][b];[a]scale=${W1}:${H1}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W1}:${H1},boxblur=40:10[bg];[b]scale=${W1}:-2:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" \
  -frames:v 1 -pix_fmt rgb24 /tmp/fill-m1.png

ffmpeg -y -v error -f lavfi -i "color=black:s=$((W0+W1))x${H1}" \
  -i /tmp/fill-m0.png -i /tmp/fill-m1.png \
  -filter_complex "[0:v][1:v]overlay=0:0[b1];[b1][2:v]overlay=${W0}:0" \
  -frames:v 1 -pix_fmt rgb24 "$OUT"

gsettings set org.gnome.desktop.background picture-options 'spanned'
gsettings set org.gnome.desktop.background picture-uri 'file:///tmp/nonexistent-trigger.png'
sleep 1
gsettings set org.gnome.desktop.background picture-uri "file://$OUT"
gsettings set org.gnome.desktop.background picture-uri-dark "file://$OUT"

echo "完成: $OUT"
