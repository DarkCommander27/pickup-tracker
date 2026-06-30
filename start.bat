@echo off
echo.
echo  🎯 Starting Pickup Tracker App
echo     Food Pantry Management System
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

echo 🚀 Starting server...
echo.
echo 📱 Access the app at: http://localhost:3000
echo.
echo 🔐 Admin login:
echo    Username: admin
echo    Password: password
echo.
echo ⚠️  IMPORTANT: Change admin password in production!
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start