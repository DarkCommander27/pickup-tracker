@echo off
echo.
echo  🎯 Pickup Tracker App Installer
echo     Food Pantry Management System
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Download the LTS version and run the installer.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found:
node --version

REM Install server dependencies
echo.
echo 📦 Installing server dependencies...
pushd "%~dp0..\server"
call npm install
popd
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Installation complete!
echo.
echo 🚀 To start the server, double-click start.bat
echo.
echo 🌐 Then open your browser to: http://localhost:3000
echo.
pause