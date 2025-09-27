# Pickup Tracker App
## Loaves and Fishes of Hinton, WV
*Operated by Catholic Charities West Virginia*

A simple, user-friendly web application for tracking food pantry pickups with digital signatures.

## 🌟 Features

- 📝 **Digital Pickup Forms** - Step-by-step wizard for recording pickups
- ✍️ **Digital Signatures** - Canvas-based signature capture
- 👥 **Name Autocomplete** - Smart name suggestions with auto-add functionality
- 📊 **Admin Dashboard** - Manage people and view pickup history
- 📋 **Export Options** - PDF and CSV exports for reporting
- 🔒 **Secure Admin Access** - Protected administrative functions
- 📱 **Mobile Friendly** - Works on tablets and mobile devices

## 🚀 Quick Start

### Option 1: Easy Installer (Recommended)
```bash
chmod +x installer/install.sh
./installer/install.sh
```

### Option 2: Manual Setup
1. **Install Node.js** (version 14 or higher)
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Open in browser:** http://localhost:3000

## 🔐 Default Admin Credentials
- **Username:** admin
- **Password:** password

⚠️ **IMPORTANT:** Change these credentials in production!

## 📖 How to Use

### For Clients (Pickup Users)
1. Go to **Sign Pickup** from the main page
2. Enter your name (autocomplete will suggest existing names)
3. Select items being picked up
4. Sign with finger/stylus on the signature pad
5. Submit - your name is automatically saved for future visits

### For Administrators
1. Go to `/admin.html` and login
2. **Manage People** - View, add, edit, or remove people from the system
3. **View Pickups** - See all pickup records with signatures
4. **Export Data** - Download PDF reports or CSV spreadsheets

## 🔒 Security

**Important:** This application uses default credentials for demonstration purposes. In production:

- Set `ADMIN_USER` environment variable (default: 'admin')
- Set `ADMIN_PASS` environment variable (default: 'password')  
- Set `SESSION_SECRET` environment variable to a strong random string

The application includes:
- XSS protection via HTML escaping
- Input validation and sanitization  
- Session-based authentication for admin functions

## ⚡ Quick run (developer):

```bash
cd server
npm install
node index.js
```

Packaging options

1) Systemd installer (Linux)

Run the included installer to install Node (Debian/Ubuntu), install dependencies, and create a systemd service:

```bash
sudo ./installer/install.sh --user yourusername --port 3000 --admin-user admin --admin-pass 'S3cureP@ss'
```

2) Docker

Build and run with docker-compose (bind-mount keeps `server/db.json` persistent):

```bash
docker-compose up --build -d
```

After either method, open the client in a tablet: `http://<laptop-ip>:3000/pickup.html` and admin: `http://<laptop-ip>:3000/admin.html`.
