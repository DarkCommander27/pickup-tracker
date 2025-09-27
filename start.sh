#!/usr/bin/env bash

# 🚀 Pickup Tracker Startup Script
# For Loaves and Fishes of Hinton, WV

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎯 Starting Pickup Tracker App${NC}"
echo -e "${BLUE}   Loaves and Fishes of Hinton, WV${NC}"
echo -e "${BLUE}   Catholic Charities West Virginia${NC}"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Get local IP for network access info
LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")

echo -e "${GREEN}🚀 Starting server...${NC}"
echo ""
echo -e "${YELLOW}📱 Access from this computer:${NC}"
echo -e "   http://localhost:3000"
echo ""
echo -e "${YELLOW}📱 Access from tablets/phones on same network:${NC}"
echo -e "   http://$LOCAL_IP:3000"
echo ""
echo -e "${YELLOW}🔐 Admin login:${NC}"
echo -e "   Username: admin"
echo -e "   Password: password"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
npm start