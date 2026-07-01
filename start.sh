#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "🎯 Pickup Tracker"
echo "   Food Pantry Management System"
echo -e "${NC}"

# Check Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js is not installed.${NC}"
  echo -e "${YELLOW}Download and install it from:${NC}"
  echo "   https://nodejs.org (click the LTS button)"
  echo ""
  echo "After installing, close and reopen your terminal, then run this script again."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$ROOT_DIR/.env"

# Run setup if --setup flag given or no .env yet
if [ "$1" = "--setup" ] || [ ! -f "$ENV_FILE" ]; then
  echo -e "${YELLOW}┌─────────────────────────────────────────────┐${NC}"
  echo -e "${YELLOW}│  First-Time Setup                           │${NC}"
  echo -e "${YELLOW}│                                             │${NC}"
  echo -e "${YELLOW}│  Default admin login:                       │${NC}"
  echo -e "${YELLOW}│    Username: admin                           │${NC}"
  echo -e "${YELLOW}│    Password: password                        │${NC}"
  echo -e "${YELLOW}│                                             │${NC}"
  echo -e "${YELLOW}│  You can change these below.                │${NC}"
  echo -e "${YELLOW}└─────────────────────────────────────────────┘${NC}"
  echo ""
  read -p "Set admin password (press Enter for default 'password'): " CUSTOM_PASS
  CUSTOM_PASS="${CUSTOM_PASS:-password}"

  if [ "$CUSTOM_PASS" = "password" ]; then
    echo -e "${RED}⚠️  Using default password. You can change it later by running: bash start.sh --setup${NC}"
  fi

  read -p "Set admin username (press Enter for default 'admin'): " CUSTOM_USER
  CUSTOM_USER="${CUSTOM_USER:-admin}"

  SESSION_SECRET="$(head -c 32 /dev/urandom | base64 2>/dev/null || echo 'change-this-secret')"

  echo "PORT=3000" > "$ENV_FILE"
  echo "ADMIN_USER=$CUSTOM_USER" >> "$ENV_FILE"
  echo "ADMIN_PASS=$CUSTOM_PASS" >> "$ENV_FILE"
  echo "SESSION_SECRET=$SESSION_SECRET" >> "$ENV_FILE"
  echo "NODE_ENV=production" >> "$ENV_FILE"
  echo ""
  echo -e "${GREEN}✅ Configuration saved.${NC}"
  echo ""
fi

# Install dependencies if needed
if [ ! -d "$ROOT_DIR/server/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing dependencies (one-time)...${NC}"
  cd "$ROOT_DIR/server" && npm install
  echo ""
fi

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

CURRENT_USER=$(grep ADMIN_USER "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "admin")
CURRENT_PASS=$(grep ADMIN_PASS "$ENV_FILE" 2>/dev/null | cut -d= -f2 || echo "password")

echo ""
echo -e "${GREEN}🚀 Server starting...${NC}"
echo ""
echo -e "${YELLOW}📱 Open on this computer:${NC}"
echo -e "   http://localhost:3000"
echo ""
echo -e "${YELLOW}📱 Open from tablets/phones on same WiFi:${NC}"
echo -e "   http://$LOCAL_IP:3000"
echo ""
echo -e "${YELLOW}🔐 Admin login:${NC}"
echo -e "   Go to the page above, click 'Admin Area' at the bottom"
echo -e "   Username: $CURRENT_USER"
echo -e "   Password: $CURRENT_PASS"
echo ""
echo -e "${YELLOW}To change password later, run: bash start.sh --setup${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

cd "$ROOT_DIR" && npm start