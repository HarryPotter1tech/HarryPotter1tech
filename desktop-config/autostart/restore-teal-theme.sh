#!/bin/bash
# 每次登录恢复青色主题（防止「设置→外观→强调色」把 GTK/图标主题改回 Yaru 默认）
sleep 3
gsettings set org.gnome.desktop.interface icon-theme 'Papirus-Teal'
gsettings set org.gnome.desktop.interface gtk-theme 'Yaru-viridian-dark'
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
