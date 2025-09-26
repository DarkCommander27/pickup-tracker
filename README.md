nonprofit-pickup-tracker
========================

This folder contains a local-first pickup tracker server and static client pages. Use the installer or Docker to package and run the server on a laptop.

## Security

**Important:** This application uses default credentials for demonstration purposes. In production:

- Set `ADMIN_USER` environment variable (default: 'admin')
- Set `ADMIN_PASS` environment variable (default: 'password')  
- Set `SESSION_SECRET` environment variable to a strong random string

The application includes:
- XSS protection via HTML escaping
- Input validation and sanitization
- Session-based authentication for admin functions

Quick run (developer):

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
