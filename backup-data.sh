#!/usr/bin/env bash

echo ""
echo "========================================"
echo "  Pickup Tracker Data Backup"
echo "========================================"
echo ""

# Set backup directory
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/pickup-tracker-backup_$TIMESTAMP.json"

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir "$BACKUP_DIR"
    echo "Created backup directory: $BACKUP_DIR"
fi

# Check if server/db.json exists
if [ ! -f "server/db.json" ]; then
    echo "❌ server/db.json not found"
    echo "No data to backup."
    exit 1
fi

# Copy database file to backup directory
echo "Backing up data..."
cp "server/db.json" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully"
    echo "Backup file: $BACKUP_FILE"
    
    # Show backup size
    SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    if [ -n "$SIZE" ]; then
        echo "File size: $SIZE bytes"
    fi
    
    # List recent backups
    echo ""
    echo "Recent backups (most recent first):"
    ls -lt "$BACKUP_DIR"/*.json 2>/dev/null | head -10 | awk '{print $9}' | xargs -n1 basename
else
    echo "❌ Backup failed"
    exit 1
fi

echo ""
echo "========================================"
echo "  Backup Complete"
echo "========================================"
echo ""
