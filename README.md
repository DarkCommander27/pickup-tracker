# Pickup Tracker App
## Food Pantry Management System

A simple, user-friendly web application for tracking food pantry pickups with digital signatures.

## 📋 License

This software is licensed under commercial terms. See the [LICENSE](LICENSE) file for details.

## 🌟 Features

- **🖥️ Cross-Platform** - Works on Windows, Linux, and macOS
- 📝 **Digital Pickup Forms** - Step-by-step wizard for recording pickups
- ✍️ **Digital Signatures** - Canvas-based signature capture
- 👥 **Name Autocomplete** - Smart name suggestions with auto-add functionality
- 📊 **Admin Dashboard** - Manage people and view pickup history
- 📋 **Export Options** - PDF and CSV exports for reporting
- 🔒 **Secure Admin Access** - Protected administrative functions
- 📱 **Mobile Friendly** - Works on tablets and mobile devices

## � What's Included

- **Complete Application Source Code** - Fully functional pickup tracking system
- **Configuration System** - Easy customization without coding (edit config.json)
- **Cross-Platform Installers** - Windows (.bat) and Linux/Mac (.sh) setup scripts
- **Docker Deployment** - docker-compose.yml and Dockerfile for containerized deployment
- **Comprehensive Documentation**:
  - BUYERS_GUIDE.md - Complete setup and customization guide
  - USER_GUIDE.md - End-user instructions for clients and administrators
  - README.md - Technical documentation and deployment options
- **Security Features** - Environment variable configuration, session-based authentication
- **Export Functionality** - PDF, CSV, and JSON data export options
- **Commercial License** - Ready for production use

## � System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, Linux (Ubuntu 18.04+), or macOS 10.15+
- **Node.js**: Version 14 or higher
- **RAM**: 512 MB minimum, 1 GB recommended
- **Disk Space**: 100 MB for application, additional space for data storage
- **Network**: Local network access for tablet/mobile device connectivity

### Optional Requirements
- **Docker**: For containerized deployment (Docker Desktop or Docker Engine)
- **PM2**: For production process management (Linux/Mac)
- **nginx/Apache**: For reverse proxy and HTTPS setup (production)

### Browser Requirements
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile/Tablet**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+

## ❓ Frequently Asked Questions

**Q: Do I need to know how to code to use this?**
A: No coding required. The application can be customized by editing a simple JSON configuration file. All setup can be done using the provided installers.

**Q: Can I use this on multiple computers?**
A: The license allows installation on a single server/instance. Multiple devices (tablets, phones) can access the application from the same network.

**Q: Is my data secure?**
A: Yes. The application uses session-based authentication, input validation, and environment variables for sensitive credentials. We recommend using HTTPS in production.

**Q: Can I customize the pickup items?**
A: Yes. Edit the `items` array in `server/config.json` to add, remove, or modify the items available for pickup.

**Q: What happens if I lose my admin password?**
A: You can reset it by editing the `.env` file and changing the `ADMIN_PASS` variable, then restarting the server.

**Q: Can I use this without an internet connection?**
A: Yes, the application runs locally on your network. However, tablets/phones need to be on the same local network as the server.

**Q: How do I back up my data?**
A: Your data is stored in `server/db.json`. Simply copy this file regularly to back up your pickup records.

**Q: Can I export data for use in other programs?**
A: Yes. The admin dashboard includes export options for PDF (reports), CSV (spreadsheets), and JSON (raw data).

**Q: Does this work with touchscreens?**
A: Yes, the application is optimized for tablets and touchscreens, including the signature capture feature.

**Q: What support is included?**
A: This purchase includes the complete application and documentation. For technical support, please refer to the BUYERS_GUIDE.md and USER_GUIDE.md files.

## �� Quick Start

### Windows Users

**Option 1: One-Click Installer (Recommended)**
1. Double-click `installer/install.bat`
2. Follow the prompts
3. Double-click `start.bat` to run the app

**Option 2: Docker (Easiest)**
```bash
docker-compose up --build -d
```

**Option 3: Manual Setup**
1. Install Node.js from https://nodejs.org
2. Open Command Prompt in the project directory
3. Run: `npm install`
4. Run: `npm start`
5. Open browser to http://localhost:3000

**Verify Installation**
After installation, run `verify-setup.bat` to confirm everything is working correctly.

### Linux/Mac Users

**Option 1: One-Click Installer (Recommended)**
```bash
chmod +x installer/install.sh
./installer/install.sh
```

**Option 2: Docker (Easiest)**
```bash
docker-compose up --build -d
```

**Option 3: Manual Setup**
1. Install Node.js (version 14 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open in browser: http://localhost:3000

**Verify Installation**
After installation, run `./verify-setup.sh` to confirm everything is working correctly.

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

1. Copy `.env.example` to `.env`
2. Update the following environment variables:
   - `ADMIN_USER` - Admin username (default: 'admin')
   - `ADMIN_PASS` - Admin password (default: 'password') - **CHANGE THIS IN PRODUCTION**
   - `SESSION_SECRET` - Strong random string for session security
   - `PORT` - Server port (default: 3000)

The application includes:
- XSS protection via HTML escaping
- Input validation and sanitization
- Session-based authentication for admin functions
- Security warnings when using default credentials in production

## ⚡ Quick run (developer):

```bash
cd server
npm install
node index.js
```

## 🌐 Deployment

### Production Deployment Options

#### 1. Systemd Installer (Linux)

Run the included installer to install Node (Debian/Ubuntu), install dependencies, and create a systemd service:

```bash
sudo ./installer/install.sh --user yourusername --port 3000 --admin-user admin --admin-pass 'S3cureP@ss'
```

#### 2. Docker

Build and run with docker-compose (bind-mount keeps `server/db.json` persistent):

```bash
docker-compose up --build -d
```

#### 3. Manual Production Setup with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Set environment variables
export NODE_ENV=production
export ADMIN_USER=admin
export ADMIN_PASS=your-secure-password
export SESSION_SECRET=your-long-random-string
export PORT=3000

# Start the application
pm2 start server/index.js --name pickup-tracker
pm2 startup
pm2 save
```

#### 4. Local Network Access

After deployment, access from other devices on the same network:

1. Find your computer's IP address:
   - Windows: `ipconfig`
   - Mac: System Preferences > Network
   - Linux: `ip addr`

2. On tablets/phones, open browser to:
   - `http://[YOUR-IP]:3000`
   - Example: `http://192.168.1.100:3000`

### Security Best Practices for Production

- **Always change default credentials** before production use
- **Use HTTPS** with SSL/TLS certificates
- **Set up a reverse proxy** (nginx, Apache) for production
- **Regular backups** of `server/db.json`
- **Firewall configuration** to restrict access
- **Keep dependencies updated** with `npm audit fix`

## 🎨 Customization

### Quick Customization

Edit `server/config.json` to customize:
- Organization name and branding
- Logo URL or text
- Pickup items available
- Application title

See [BUYERS_GUIDE.md](BUYERS_GUIDE.md) for detailed customization instructions.

## 📚 Documentation

- [BUYERS_GUIDE.md](BUYERS_GUIDE.md) - Complete buyer's guide with setup and customization
- [USER_GUIDE.md](USER_GUIDE.md) - End-user instructions for clients and administrators
- [LICENSE](LICENSE) - Commercial license terms
