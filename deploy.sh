#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/pensador-website"
NVM_DIR="/home/ubuntu/.nvm"
NODE_VERSION="24"
SERVICE_NAME="pensador-website"

cd "$APP_DIR"
git pull --ff-only

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  source "$NVM_DIR/nvm.sh"
  nvm use "$NODE_VERSION" >/dev/null
fi

npm ci
npm run lint
npm run build

sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager

sudo nginx -t
sudo systemctl reload nginx

echo "Deploy completed successfully (Next.js server mode)."
