#!/usr/bin/env bash
# 拉最新代码 + 重新构建 + 重启服务
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/interest-manual}"
SERVICE="${SERVICE:-interest-manual}"

cd "$APP_DIR"
git fetch --all --quiet
git reset --hard origin/main --quiet
pnpm install --frozen-lockfile
NEXT_TELEMETRY_DISABLED=1 pnpm build
systemctl restart "$SERVICE"
sleep 3
curl -sS -o /dev/null -w "本地自检 -> %{http_code}\n" "http://127.0.0.1:${PORT:-80}/" || true
echo "已更新：$(git log --oneline -1)"
