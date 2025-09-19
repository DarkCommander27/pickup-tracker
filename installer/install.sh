#!/usr/bin/env bash
set -euo pipefail

# Simple installer for nonprofit-pickup-tracker (Linux, systemd)
# Usage: sudo ./install.sh --user <run-as-user> --port 3000 --admin-user admin --admin-pass secret

USER="$(whoami)"
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=password
SESSION_SECRET="$(head -c 32 /dev/urandom | base64)"

while [[ $# -gt 0 ]]; do
  case $1 in
    --user) USER="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --admin-user) ADMIN_USER="$2"; shift 2;;
    --admin-pass) ADMIN_PASS="$2"; shift 2;;
    --session-secret) SESSION_SECRET="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Installing nonprofit-pickup-tracker to $ROOT_DIR as user $USER on port $PORT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing Node.js 18 (Debian/Ubuntu)..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

cd "$ROOT_DIR/server"
echo "Installing npm dependencies..."
npm install --production

SERVICE_FILE="/etc/systemd/system/nonprofit-pickup-tracker.service"
echo "Creating systemd service at $SERVICE_FILE"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Nonprofit Pickup Tracker
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$ROOT_DIR/server
Environment=PORT=$PORT
Environment=ADMIN_USER=$ADMIN_USER
Environment=ADMIN_PASS=$ADMIN_PASS
Environment=SESSION_SECRET=$SESSION_SECRET
ExecStart=$(which node) $ROOT_DIR/server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd and starting service..."
systemctl daemon-reload
systemctl enable --now nonprofit-pickup-tracker.service

echo "Installation complete. Server should be listening on port $PORT."
echo "Visit http://<your-laptop-ip>:$PORT/ to open the client pages from a tablet." 
