@echo off
chcp 65001 >nul 2>&1
echo.
echo  🎯 Pickup Tracker
echo     Food Pantry Management System
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ❌ Node.js is not installed.
    echo  Download and install it from:
    echo     https://nodejs.org (click the LTS button)
    echo.
    echo  After installing, close and reopen this window, then run this script again.
    pause
    exit /b 1
)

REM Run setup if --setup flag or no .env
if "%1" == "--setup" goto :setup
if not exist ".env" goto :setup
goto :start

:setup
echo  ┌─────────────────────────────────────────────┐
echo  │  First-Time Setup                           │
echo  │                                             │
echo  │  Default admin login:                       │
echo  │    Username: admin                          │
echo  │    Password: password                       │
echo  │                                             │
echo  │  You can change these below.                │
echo  └─────────────────────────────────────────────┘
echo.
set "CUSTOM_PASS="
set /p CUSTOM_PASS=Set admin password (press Enter for default): 
if not defined CUSTOM_PASS set "CUSTOM_PASS=password"
echo.
set "CUSTOM_USER="
set /p CUSTOM_USER=Set admin username (press Enter for default): 
if not defined CUSTOM_USER set "CUSTOM_USER=admin"
echo.

(
echo PORT=3000
echo ADMIN_USER=%CUSTOM_USER%
echo ADMIN_PASS=%CUSTOM_PASS%
for /f %%i in ('powershell -Command "[Convert]::ToBase64String([Guid]::NewGuid().ToByteArray()+[Guid]::NewGuid().ToByteArray())"') do echo SESSION_SECRET=%%i
echo NODE_ENV=production
) > .env
echo  ✅ Configuration saved.
echo To change password later, run: start.bat --setup
echo.

:start
if not exist "server\node_modules" (
    echo  📦 Installing dependencies (one-time)...
    pushd server
    call npm install
    popd
    if %errorlevel% neq 0 (
        echo  ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo  🚀 Server starting...
echo.
echo  📱 Open on this computer: http://localhost:3000
echo.
echo  📱 Open from tablets/phones on same WiFi: http://[THIS-COMPUTER-IP]:3000
echo.
for /f "tokens=2 delims==" %%a in ('findstr "ADMIN_USER" .env') do set "SHOW_USER=%%a"
for /f "tokens=2 delims==" %%a in ('findstr "ADMIN_PASS" .env') do set "SHOW_PASS=%%a"
echo  🔐 Admin login:
echo     Go to the page above, click "Admin Area" at the bottom
echo     Username: %SHOW_USER%
echo     Password: %SHOW_PASS%
echo.
echo  To change password later, run: start.bat --setup
echo  Press Ctrl+C to stop the server
echo.

call npm start