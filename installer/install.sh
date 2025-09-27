#!/usr/bin/env bash
set -euo pipefail

# 🎯 Pickup Tracker Installer
# For Loaves and Fishes of Hinton, WV (Catholic Charities West Virginia)
# 
# Usage: ./install.sh [options]
# Options:
#   --user <username>      Run as this user (default: current user)
#   --port <port>          Server port (default: 3000)
#   --admin-user <user>    Admin username (default: admin)
#   --admin-pass <pass>    Admin password (default: password)
#   --help                 Show this help

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
USER="$(whoami)"
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=password
SESSION_SECRET="$(head -c 32 /dev/urandom | base64)"

# Help function
show_help() {
    echo -e "${BLUE}🎯 Pickup Tracker Installer${NC}"
    echo -e "${BLUE}For Loaves and Fishes of Hinton, WV${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --user <username>      Run as this user (default: $USER)"
    echo "  --port <port>          Server port (default: $PORT)"
    echo "  --admin-user <user>    Admin username (default: $ADMIN_USER)"
    echo "  --admin-pass <pass>    Admin password (default: $ADMIN_PASS)"
    echo "  --help                 Show this help"
    echo ""
    echo "Example:"
    echo "  $0 --port 8080 --admin-user myuser --admin-pass mysecretpass"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --user) USER="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --admin-user) ADMIN_USER="$2"; shift 2;;
    --admin-pass) ADMIN_PASS="$2"; shift 2;;
    --session-secret) SESSION_SECRET="$2"; shift 2;;
    --help) show_help;;
    *) echo -e "${RED}❌ Unknown argument: $1${NC}"; echo "Use --help for usage info"; exit 1;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo -e "${BLUE}🎯 Installing Pickup Tracker App${NC}"
echo -e "${BLUE}   Loaves and Fishes of Hinton, WV${NC}"
echo -e "${BLUE}   Catholic Charities West Virginia${NC}"
echo ""
echo -e "${YELLOW}📁 Install directory: $ROOT_DIR${NC}"
echo -e "${YELLOW}👤 Run as user: $USER${NC}"
echo -e "${YELLOW}🌐 Port: $PORT${NC}"
echo -e "${YELLOW}🔐 Admin user: $ADMIN_USER${NC}"
echo ""

# Check for Node.js
if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}📦 Node.js not found. Installing Node.js 18...${NC}"
  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
  elif command -v yum >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
  else
    echo -e "${RED}❌ Could not install Node.js automatically.${NC}"
    echo -e "${YELLOW}Please install Node.js 14+ manually from https://nodejs.org${NC}"
    exit 1
  fi
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
