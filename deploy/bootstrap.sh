#!/usr/bin/env bash
# 一键部署到自己的 Linux 服务器（Debian / Ubuntu）
#
#   curl -fsSL https://raw.githubusercontent.com/wumu1111111/interest-manual/main/deploy/bootstrap.sh | bash
#
# 或者先下载再跑：
#   bash deploy/bootstrap.sh
#
# 环境变量：
#   PORT=80                         监听端口（默认 80，需要 root 才能绑）
#   SITE_URL=http://1.2.3.4         对外地址，写进 og:image 等绝对链接
#   REPO=https://github.com/...     仓库地址
set -euo pipefail

REPO="${REPO:-https://github.com/wumu1111111/interest-manual.git}"
APP_DIR="${APP_DIR:-/opt/interest-manual}"
SERVICE="${SERVICE:-interest-manual}"
PORT="${PORT:-80}"
NODE_MAJOR="${NODE_MAJOR:-22}"

# 80 经常被机器上已有的站点（nginx 之类）占着，占了就自动退到 8080
if ss -lnt 2>/dev/null | grep -qE "[:.]${PORT}[[:space:]]"; then
  NEW_PORT="${FALLBACK_PORT:-8080}"
  while ss -lnt 2>/dev/null | grep -qE "[:.]${NEW_PORT}[[:space:]]"; do
    NEW_PORT=$((NEW_PORT + 1))
  done
  echo "==> 端口 ${PORT} 已被占用，改用 ${NEW_PORT}（记得在控制台防火墙放行）"
  PORT="$NEW_PORT"
fi

if [ "$PORT" = "80" ]; then
  SITE_URL="${SITE_URL:-http://$(curl -fsS --max-time 3 https://api.ipify.org || echo localhost)}"
else
  SITE_URL="${SITE_URL:-http://$(curl -fsS --max-time 3 https://api.ipify.org || echo localhost):${PORT}}"
fi

echo "==> 目标：$APP_DIR  端口 $PORT  对外地址 $SITE_URL"

# 1) 基础依赖
if command -v apt-get >/dev/null; then
  apt-get update -y
  apt-get install -y curl git ca-certificates
fi

# 2) swap：2G 内存构建 Next 很容易 OOM
if ! swapon --show 2>/dev/null | grep -q '/swapfile'; then
  echo "==> 加 2G swap"
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi

# 3) Node + pnpm
#    Debian 12/13 的仓库里就有 Node 20+，优先用它；不够再回落到官方二进制。
if ! command -v node >/dev/null || [ "$(node -v | tr -d 'v' | cut -d. -f1)" -lt 20 ]; then
  echo "==> 安装 Node（发行版仓库）"
  apt-get install -y nodejs npm || true
fi

if ! command -v node >/dev/null || [ "$(node -v | tr -d 'v' | cut -d. -f1)" -lt 20 ]; then
  echo "==> 仓库版本不够，改用官方二进制"
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) NARCH="x64" ;;
    aarch64) NARCH="arm64" ;;
    *) NARCH="x64" ;;
  esac
  VER="$(curl -fsSL https://nodejs.org/dist/index.json | grep -o '"version":"v22[^"]*"' | head -1 | cut -d'"' -f4)"
  echo "==> node $VER"
  curl -fsSL "https://nodejs.org/dist/${VER}/node-${VER}-linux-${NARCH}.tar.xz" -o /tmp/node.tar.xz
  tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
fi

if ! command -v pnpm >/dev/null; then
  echo "==> 安装 pnpm"
  npm i -g pnpm@10
fi
echo "==> node $(node -v) / pnpm $(pnpm -v)"

# 4) 拉代码
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  echo "==> 更新代码"
  git -C "$APP_DIR" fetch --all --quiet
  git -C "$APP_DIR" reset --hard origin/main --quiet
else
  echo "==> 克隆仓库"
  git clone --quiet "$REPO" "$APP_DIR"
fi

# 5) 构建
cd "$APP_DIR"
echo "==> 安装依赖"
pnpm install --frozen-lockfile
echo "==> 构建"
NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL="$SITE_URL" pnpm build

# 6) systemd
echo "==> 配置 systemd"
cat >"/etc/systemd/system/${SERVICE}.service" <<UNIT
[Unit]
Description=interest-manual (Next.js)
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
Environment=PORT=${PORT}
Environment=NEXT_PUBLIC_SITE_URL=${SITE_URL}
ExecStart=/usr/bin/node ${APP_DIR}/node_modules/next/dist/bin/next start -p ${PORT}
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable "$SERVICE" >/dev/null 2>&1 || true
systemctl restart "$SERVICE"
sleep 4

echo "==> 状态"
systemctl --no-pager --lines=0 status "$SERVICE" || true
echo "==> 自检"
curl -sS -o /dev/null -w "本地 http://127.0.0.1:${PORT}/  ->  %{http_code}\n" "http://127.0.0.1:${PORT}/" || true

echo
echo "完成。对外地址： ${SITE_URL}"
echo "改代码后重新部署：bash ${APP_DIR}/deploy/update.sh"
echo "看日志：journalctl -u ${SERVICE} -f"
