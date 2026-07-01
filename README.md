# Pickup Tracker

Food pantry pickup tracking with digital signatures. No internet required. No monthly fees.

## Quick Start

**Windows:** Double-click `start.bat`
**Mac/Linux:** Open terminal, type `bash start.sh`

On first run you'll be asked to set an admin password. Then the app opens at `http://localhost:3000`.

That's it. Everything else is in-app.

## Features

- Step-by-step pickup wizard with name autocomplete
- Digital signature capture (finger or stylus, works on tablets)
- Admin dashboard — manage people, view records, export PDF/CSV/JSON
- Customizable — change org name, logo, and pickup items from the Settings page
- No internet, no account, no subscription — runs entirely on your local network

## Requirements

- **Node.js** 14 or higher (download from https://nodejs.org, click the LTS button)
- A computer to run the server (any old laptop works)
- Tablets or phones to access the pickup form over WiFi

## First-Run Setup

The first time you run `start.sh` or `start.bat`, you'll be prompted to:

1. Set an admin password (or press Enter to use the default)
2. Set an admin username (or press Enter to use the default)

A `.env` file is created automatically. To change these later, run `bash start.sh --setup` (or `start.bat --setup`).

## Customization

Log into the Admin Area and click **Organization Settings** to change:

- Organization name and tagline
- Logo image URL
- App title (browser tab name)
- Pickup items (the checkboxes in the pickup form)

All changes take effect immediately — no restart needed.

## How It Works

1. Volunteers open the pickup page on a tablet
2. They type or select the person's name (auto-saved for next time)
3. Check what items were received
4. Sign with a finger or stylus
5. Done. Records are stored locally on the server.

Admins can view all pickups, manage the people list, and export data.

## Default Admin Login

- Username: `admin`
- Password: `password`

**Change this on first run** — the startup script will prompt you.

## Data

All data is stored in `server/db.json`. Back this file up to save your records. Export is also available from the admin dashboard (PDF, CSV, JSON).

## Advanced

The app can also be run manually:

```bash
cd server
npm install
node index.js
```

Docker and PM2 deployment options are documented in [BUYERS_GUIDE.md](BUYERS_GUIDE.md).

## Documentation

- [BUYERS_GUIDE.md](BUYERS_GUIDE.md) — detailed setup, customization, and deployment
- [USER_GUIDE.md](USER_GUIDE.md) — end-user instructions
- [LICENSE](LICENSE) — license terms
