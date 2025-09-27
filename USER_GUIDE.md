# 📖 Pickup Tracker User Guide
## Loaves and Fishes of Hinton, WV
*Catholic Charities West Virginia*

---

## 🎯 Quick Setup Guide

### For Windows Users
1. **Download** the pickup-tracker folder to your computer
2. **Double-click** `installer/install.bat` to install
3. **Double-click** `start.bat` to run the app
4. **Open browser** to http://localhost:3000

### For Mac/Linux Users
1. **Download** the pickup-tracker folder to your computer
2. **Open Terminal** and navigate to the folder
3. **Run:** `./installer/install.sh` to install
4. **Run:** `./start.sh` to start the app
5. **Open browser** to http://localhost:3000

---

## 👥 User Roles

### 📝 **Clients (People picking up food)**
- Can sign pickup forms
- Names are automatically saved for future visits
- No login required

### 🔐 **Administrators (Staff)**
- Can view all pickup records
- Can manage people in the system
- Can export reports (PDF/CSV)
- Requires login

---

## 🖥️ How to Use - Step by Step

### For Clients (Pickup Process)

1. **Start Pickup**
   - Click "Sign Pickup" on the main page
   - You'll see a 3-step wizard

2. **Step 1: Enter Information**
   - Type your name (suggestions will appear if you've visited before)
   - Date will be filled automatically
   - Add any notes if needed
   - Click "Next"

3. **Step 2: Select Items**
   - Check boxes for items you're picking up:
     - Food
     - Household items  
     - Clothes
   - Click "Next"

4. **Step 3: Sign**
   - Sign with your finger/stylus on the gray box
   - Use "Clear" to start over if needed
   - Click "Save Pickup" when done

5. **Complete**
   - You'll see a success message
   - Your name is now saved for faster future visits

### For Administrators

1. **Login**
   - Go to `/admin.html` in your browser
   - Enter username and password
   - Default: admin / password

2. **Admin Dashboard Options**
   - **Manage People** - Add, edit, or remove people
   - **View Pickups** - See all pickup records with signatures
   - **Export Pickups PDF** - Download formatted report
   - **Export Pickups CSV** - Download spreadsheet data
   - **Export Pickups JSON** - Download raw data

3. **Managing People**
   - Add new people manually if needed
   - Edit existing names
   - Delete people who no longer visit

4. **Viewing Pickup Records**
   - See chronological list of all pickups
   - View signatures by clicking on them
   - Filter and search as needed

---

## 🌐 Network Setup (Multiple Devices)

### Using Tablets for Pickup Signing

If you want to use tablets or phones for the pickup process:

1. **Connect all devices to the same WiFi network**
2. **Find your computer's IP address:**
   - Windows: Open Command Prompt, type `ipconfig`
   - Mac: System Preferences > Network
   - Linux: Type `ip addr` in terminal

3. **On tablets/phones, open browser to:**
   - `http://[YOUR-IP]:3000`
   - Example: `http://192.168.1.100:3000`

4. **Bookmark this address** on each tablet for easy access

---

## 🔧 Configuration & Customization

### Changing Admin Password

**Important:** Change the default password before using in production!

1. **Edit** `server/index.js`
2. **Find** these lines:
   ```javascript
   const ADMIN_USER = 'admin';
   const ADMIN_HASH = bcrypt.hashSync('password', 10);
   ```
3. **Change** 'password' to your new password
4. **Restart** the server

### Changing Organization Branding

To update the organization name, logo, or contact info:

1. **Edit** the HTML files in `server/public/`
2. **Update** the nonprofit-header section in each file
3. **Change** logo URL, organization name, and subtitle

---

## 📊 Reports & Data Export

### PDF Reports
- Formatted reports with signatures
- Good for printing and filing
- Includes all pickup details

### CSV Exports  
- Spreadsheet format for analysis
- Import into Excel or Google Sheets
- Columns: ID, Name, Date, Items, Notes, Has Signature

### JSON Exports
- Raw data format for developers
- Complete backup of all data
- Can be imported into other systems

---

## 🆘 Troubleshooting

### App Won't Start
- **Check:** Is Node.js installed? Run `node --version`
- **Try:** Re-run the installer
- **Check:** Is port 3000 already in use?

### Can't Access from Tablet
- **Check:** Are all devices on same WiFi?
- **Check:** Is the computer running the server?
- **Try:** Disable firewall temporarily
- **Check:** Use the correct IP address

### Signatures Not Appearing
- **Check:** Is JavaScript enabled in browser?
- **Try:** Refresh the page
- **Check:** Use a modern browser (Chrome, Firefox, Safari, Edge)

### Lost Admin Password
- **Edit** `server/index.js` and reset the password
- **Restart** the server

---

## 📞 Support

For technical support or questions about this application:

- **Organization:** Catholic Charities West Virginia
- **Program:** Loaves and Fishes of Hinton, WV
- **Documentation:** See README.md for technical details

---

## 🎉 Tips for Success

1. **Test thoroughly** before first use
2. **Train volunteers** on the pickup process
3. **Have backup paper forms** ready
4. **Export data regularly** for safekeeping
5. **Keep tablets charged** and ready
6. **Use a reliable WiFi connection**

---

*This guide covers the essential functions of the Pickup Tracker app. For advanced configuration and development information, see the technical documentation in README.md.*