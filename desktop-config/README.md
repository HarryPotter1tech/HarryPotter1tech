# GNOME 桌面美化配置（Ubuntu 22.04 / GNOME 42.9 / X11 双屏）

冷调水彩壁纸 + 青色（teal）点缀的整体桌面配置，覆盖壁纸、GTK/Shell 主题、图标、终端、顶栏、Qoder TUI。

## 目录

| 路径 | 内容 |
|---|---|
| `monitors.xml` | 双屏布局：DP-0 左（3408x2130）+ HDMI-0 AOC 右（4096x2304），**AOC 为主屏**；工作区只在主屏切换（`workspaces-only-on-primary=true`） |
| `gsettings/` | 各 GSettings schema 的完整导出（`gsettings list-recursively` 格式） |
| `terminal/gnome-terminal.conf` | gnome-terminal 配置（`dconf dump /org/gnome/terminal/`）：深底 #11151b + 青色 palette + 13% 背景透明 |
| `qoder/settings.json` | Qoder TUI 自定义主题 `opencode-teal`（深底 + 青色点缀） |
| `gnome-shell/blur-my-shell-teal-panel.css` | 顶栏青色文字/图标样式（#0e7490），追加到 blur-my-shell 扩展的 stylesheet.css 末尾 |
| `wallpaper/compose-dual.sh` | 双屏壁纸合成脚本（ffmpeg 模糊填充 + 前景居中，无损 PNG 输出为 spanned 壁纸并应用） |
| `autostart/` | 登录自启守护：恢复 Papirus-Teal 图标 + viridian GTK（防「强调色」覆盖） |

## 关键设置一览

- GTK 主题：`Yaru-viridian-dark`（青色系），`color-scheme=prefer-dark`
- 图标：`Papirus-Teal`
- Shell 主题（user-theme 扩展）：`Colloid-Teal-Dark`
- 顶栏：blur-my-shell `transparent-panel` 半透明 + 青色文字/图标（本仓库 CSS）
- 终端：见 `terminal/gnome-terminal.conf`，透明 13%
- 工作区：固定 4 个，只在主屏（AOC）切换，副屏窗口固定可见
- 壁纸：`picture-options=spanned`，`7504x2304` 横跨双屏（`qy-dual-hd.png`，由 47MB 4x 原图无损合成）

## 恢复方法

### monitors.xml
```bash
cp monitors.xml ~/.config/monitors.xml   # 注销重进生效
```

### gsettings 各文件
逐行恢复（第 2、3 列为 key 和 value）：
```bash
while read schema key val; do gsettings set "$schema" "$key" "$val"; done < gsettings/interface.conf
# 注意：val 含空格/引号时需按行手动处理，或直接对照文件手动设置
```
blur-my-shell 的 schema 需要先设置：
```bash
export GSETTINGS_SCHEMA_DIR=$HOME/.local/share/gnome-shell/extensions/blur-my-shell@aunetx/schemas
```

### 终端
```bash
dconf load /org/gnome/terminal/ < terminal/gnome-terminal.conf
```

### Qoder
```bash
cp qoder/settings.json ~/.qoder/settings.json
# 重启 Qoder，或在会话内运行 /theme 选择 "opencode-teal"
```

### 顶栏青色文字/图标
```bash
cat gnome-shell/blur-my-shell-teal-panel.css >> ~/.local/share/gnome-shell/extensions/blur-my-shell@aunetx/stylesheet.css
gnome-extensions disable blur-my-shell@aunetx && sleep 2 && gnome-extensions enable blur-my-shell@aunetx
```

### 壁纸
源图（4x 高清）位于 `~/.local/share/wallpapers/qy-fan-anime.png`，体积过大不入库：
```bash
bash wallpaper/compose-dual.sh ~/.local/share/wallpapers/qy-fan-anime.png
```

### 主题持久化守护
Ubuntu「设置 → 外观 → 强调色」会同时覆盖 GTK 与图标主题，导致 Papirus-Teal 变回 Yaru 默认。
```bash
mkdir -p ~/.local/bin ~/.config/autostart
cp autostart/restore-teal-theme.sh ~/.local/bin/ && chmod +x ~/.local/bin/restore-teal-theme.sh
cp autostart/restore-teal-theme.desktop ~/.config/autostart/
```
之后每次登录都会自动恢复青色主题。

## 备注

- 顶栏文字/图标颜色通过 blur-my-shell 的 stylesheet.css 实现（保留半透明背景），不要用 user-theme 的 CSS（X11 下不生效）。
- 若某窗口"始终可见"导致不随工作区切换：右键标题栏 → 取消 "Always on Visible Workspace"。
