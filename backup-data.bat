@echo off
setlocal enabledelayedexpansion
echo.
echo ========================================
echo   Pickup Tracker Data Backup
echo ========================================
echo.

REM Set backup directory
set BACKUP_DIR=backups
set TIMESTAMP=%date:~-4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=%BACKUP_DIR%\pickup-tracker-backup_%TIMESTAMP%.json

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo Created backup directory: %BACKUP_DIR%
)

REM Check if server/db.json exists
if not exist "server\db.json" (
    echo ❌ server\db.json not found
    echo No data to backup.
    pause
    exit /b 1
)

REM Copy database file to backup directory
echo Backing up data...
copy "server\db.json" "%BACKUP_FILE%" >nul

if %errorlevel% equ 0 (
    echo ✅ Backup created successfully
    echo Backup file: %BACKUP_FILE%
    
    REM Show backup size
    for %%A in ("%BACKUP_FILE%") do (
        set SIZE=%%~zA
        set /a SIZE_MB=!SIZE! / 1048576
        echo File size: !SIZE! bytes
    )
    
    REM List recent backups
    echo.
    echo Recent backups (most recent first):
    dir /B /O-D "%BACKUP_DIR%\*.json" | more /E +0
) else (
    echo ❌ Backup failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Backup Complete
echo ========================================
echo.
pause
