@echo off
echo.
echo ========================================
echo   Pickup Tracker Setup Verification
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js installed: %NODE_VERSION%
echo.

REM Check dependencies
echo [2/5] Checking dependencies...
if not exist "node_modules" (
    echo ❌ Dependencies not installed
    echo Run: npm install
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Check server directory
echo [3/5] Checking server directory...
if not exist "server" (
    echo ❌ Server directory not found
    pause
    exit /b 1
)
echo ✅ Server directory exists
echo.

REM Check server dependencies
echo [4/5] Checking server dependencies...
if not exist "server\node_modules" (
    echo ❌ Server dependencies not installed
    cd server
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Failed to install server dependencies
        pause
        exit /b 1
    )
)
echo ✅ Server dependencies installed
echo.

REM Test server startup (quick check)
echo [5/5] Testing server startup...
echo Starting server for 5 seconds...
start /B npm start >nul 2>&1
timeout /t 5 /nobreak >nul

REM Try to hit health endpoint
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is responding correctly
    echo.
    echo ========================================
    echo   ✅ Setup Verification PASSED
    echo ========================================
    echo.
    echo Your Pickup Tracker is ready to use!
    echo Access it at: http://localhost:3000
    echo.
    echo Press Ctrl+C to stop the server, then run start.bat to use it normally.
) else (
    echo ⚠️  Could not verify server response
    echo The server may still be starting up. Try accessing http://localhost:3000 manually.
    echo.
    echo ========================================
    echo   ⚠️  Setup Verification INCOMPLETE
    echo ========================================
)

echo.
pause
