# Buyer's Guide - Pickup Tracker

Thank you for purchasing the Pickup Tracker application. This guide will help you get started with customizing and deploying the application for your organization.

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Customization](#customization)
3. [Deployment](#deployment)
4. [Security Setup](#security-setup)
5. [Support](#support)

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- npm (comes with Node.js)
- A web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Extract the files** to your desired location
2. **Open a terminal** in the extracted folder
3. **Create `.env` from the example:**
   ```bash
   cp .env.example .env
   ```
4. **Edit `.env`** and update the following:
   - `ADMIN_USER` - Your admin username
   - `ADMIN_PASS` - Your admin password (use a strong password!)
   - `SESSION_SECRET` - A long random string for session security
   - `PORT` - The port you want the server to run on (default: 3000)

5. **Install server dependencies:**
   ```bash
   cd server && npm install && cd ..
   ```

6. **Start the server:**
   ```bash
   npm start
   ```

7. **Open your browser** to `http://localhost:3000`

## 🎨 Customization

### Using the Settings Page (Recommended)

Log into the Admin Area and click **Organization Settings**. You can change:
- Organization name and tagline
- Logo image URL (with live preview)
- App title (browser tab name)
- Pickup items (the checkboxes shown in step 2)

Changes take effect immediately — no restart needed.

### Editing config.json Directly

You can also edit `server/config.json` by hand:

```json
{
  "organization": {
    "name": "Your Organization Name",
    "subtitle": "Your Tagline or Description",
    "logoUrl": "https://your-website.com/logo.png",
    "logoText": "Your Logo Text"
  },
  "app": {
    "title": "Pickup Tracker",
    "port": 3000
  },
  "items": [
    "Food",
    "Household Items",
    "Clothes"
  ]
}
```

**Options:**
- `name` - Your organization's name (displayed in header)
- `subtitle` - A tagline or description (displayed below name)
- `logoUrl` - URL to your organization's logo image (leave empty to use text placeholder)
- `logoText` - Text to display if no logo URL is provided
- `title` - The application title
- `items` - List of items available for pickup (shown in step 2 of pickup wizard)

### Adding Your Logo

1. **Option 1: Use a URL**
   - Upload your logo to your website or image hosting service
   - Copy the URL and paste it into `config.json` under `logoUrl`

2. **Option 2: Use a local file**
   - Place your logo file in `server/public/`
   - Update `logoUrl` to `/your-logo-filename.png`

### Customizing Pickup Items

Edit the `items` array in `config.json` to match what your organization offers:

```json
"items": [
  "Food",
  "Household Items",
  "Clothes",
  "Baby Supplies",
  "Pet Food"
]
```

### Advanced Customization

For more advanced customization (colors, fonts, layout), you can edit the CSS file:
- `server/public/style.css`

## 🌐 Deployment

### Local Network Deployment

To use tablets/phones on the same network:

1. **Find your computer's IP address:**
   - Windows: Open Command Prompt, type `ipconfig`
   - Mac: System Preferences > Network
   - Linux: Type `ip addr` in terminal

2. **On tablets/phones, open browser to:**
   - `http://[YOUR-IP]:3000`
   - Example: `http://192.168.1.100:3000`

### Production Deployment

#### Using the Installer (Linux)

```bash
sudo ./installer/install.sh --user yourusername --port 3000 --admin-user admin --admin-pass 'YourSecurePassword'
```

#### Using Docker

1. **Build and run with docker-compose:**
   ```bash
   docker-compose up --build -d
   ```

2. **The application** will be available at `http://localhost:3000`

#### Manual Production Setup

1. **Set environment variables:**
   ```bash
   export NODE_ENV=production
   export ADMIN_USER=admin
   export ADMIN_PASS=your-secure-password
   export SESSION_SECRET=your-long-random-string
   export PORT=3000
   ```

2. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name pickup-tracker
   pm2 startup
   pm2 save
   ```

3. **Set up a reverse proxy** (nginx recommended) for SSL/HTTPS

## 🔒 Security Setup

### Important Security Steps

1. **Change Default Credentials**
   - Never use the default `admin/password` in production
   - Set strong, unique passwords in your `.env` file

2. **Use HTTPS in Production**
   - Set up SSL/TLS certificates
   - Use a reverse proxy (nginx, Apache) to handle HTTPS

3. **Secure Session Secret**
   - Generate a long random string for `SESSION_SECRET`
   - Use a different secret for each deployment

4. **Regular Backups**
   - Back up `server/db.json` regularly
   - This contains all your pickup data

5. **Firewall Configuration**
   - Only allow necessary ports (usually 3000)
   - Restrict access to admin functions if needed

## 📊 Data Management

### Backing Up Data

Your data is stored in `server/db.json`. To back up:

```bash
cp server/db.json server/db.json.backup
```

### Restoring Data

```bash
cp server/db.json.backup server/db.json
```

### Exporting Data

Use the admin dashboard to export:
- **PDF** - Formatted reports with signatures
- **CSV** - Spreadsheet format for analysis
- **JSON** - Raw data backup

## 🆘 Troubleshooting

### Server Won't Start
- Check if Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Review the error messages in the terminal

### Can't Access from Tablets
- Ensure all devices are on the same WiFi network
- Check firewall settings
- Verify the correct IP address is being used

### Signatures Not Working
- Ensure JavaScript is enabled in the browser
- Try a modern browser (Chrome, Firefox, Safari, Edge)
- Clear browser cache and try again

### Lost Admin Password
- Edit the `.env` file to reset `ADMIN_PASS`
- Restart the server for changes to take effect

## 📞 Support

For technical support or questions:
- Review the [README.md](README.md) for technical details
- Check the [USER_GUIDE.md](USER_GUIDE.md) for end-user instructions
- Contact support through the channel provided with your purchase

## 🎉 Best Practices

1. **Test thoroughly** before first use with clients
2. **Train volunteers** on the pickup process
3. **Have backup paper forms** ready in case of technical issues
4. **Export data regularly** for safekeeping
5. **Keep tablets charged** and ready for use
6. **Use a reliable WiFi connection**
7. **Update the application** when new versions are released

---

*This guide covers the essential information for getting started with the Pickup Tracker. For advanced configuration and development information, see the technical documentation in README.md.*
