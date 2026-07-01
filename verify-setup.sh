#!/usr/bin/env bash

echo ""
echo "========================================"
echo "  Pickup Tracker Setup Verification"
echo "========================================"
echo ""

# Check Node.js
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js installed: $NODE_VERSION"
echo ""

# Check server directory
echo "[2/5] Checking server directory..."
if [ ! -d "server" ]; then
    echo "❌ Server directory not found"
    exit 1
fi
echo "✅ Server directory exists"
echo ""

# Check server dependencies
echo "[3/5] Checking server dependencies..."
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    (cd server && npm install)
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install server dependencies"
        exit 1
    fi
fi
echo "✅ Server dependencies installed"
echo ""

# Check .env file
echo "[4/5] Checking configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found — using default credentials"
else
    echo "✅ Configuration file found"
fi
echo ""

# Test server startup (quick check)
echo "[5/5] Testing server startup..."
echo "Starting server for 5 seconds..."

# Start server in background
npm start > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Try to hit health endpoint
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Server is responding correctly"
        echo ""
        echo "========================================"
        echo "  ✅ Setup Verification PASSED"
        echo "========================================"
        echo ""
        echo "Your Pickup Tracker is ready to use!"
        echo "Access it at: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop the server, then run ./start.sh to use it normally."
        
        # Kill the test server
        kill $SERVER_PID 2>/dev/null
    else
        echo "⚠️  Could not verify server response"
        echo "The server may still be starting up. Try accessing http://localhost:3000 manually."
        echo ""
        echo "========================================"
        echo "  ⚠️  Setup Verification INCOMPLETE"
        echo "========================================"
        
        # Kill the test server
        kill $SERVER_PID 2>/dev/null
    fi
else
    echo "⚠️  curl not available, skipping server response test"
    echo "========================================"
    echo "  ⚠️  Setup Verification PARTIAL"
    echo "========================================"
    echo ""
    echo "Install curl to enable full verification, or try accessing http://localhost:3000 manually."
    
    # Kill the test server
    kill $SERVER_PID 2>/dev/null
fi

echo ""
