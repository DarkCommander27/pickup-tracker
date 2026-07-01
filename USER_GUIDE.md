# Pickup Tracker User Guide

## Quick Start

### For Windows Users
1. **Double-click** `start.bat` to install and run the app
2. **Open browser** to http://localhost:3000

### For Mac/Linux Users
1. **Open Terminal** in the app folder
2. **Run:** `bash start.sh`
3. **Open browser** to http://localhost:3000

On first run you'll be asked to set a username and password.

---

## How to Use - Step by Step

### For Clients (Pickup Process)

1. **Start Pickup**
   - Click "Sign a Pickup" on the main page

2. **Step 1: Who is coming?**
   - Type your name (suggestions will appear if you've visited before)
   - Date is filled automatically
   - Click "Next: Items Received"

3. **Step 2: What did they receive?**
   - Check boxes for items being picked up
   - Add optional notes about the visit
   - Click "Next: Signature"

4. **Step 3: Sign here**
   - Sign with your finger or stylus on the gray box
   - Tap "Clear & Try Again" to start over
   - Tap "Save Pickup" when done

5. **Complete**
   - A success message appears
   - Tap "Record Another Pickup" for the next person

### For Administrators

1. **Log in**
   - From the home page, click "Admin Area"
   - Enter the username and password set during first run

2. **Admin Dashboard**
   - **View All Pickups** - See all records with signatures (click a signature to enlarge)
   - **Manage People** - Add or remove people from the list
   - **Organization Settings** - Change your org name, logo, pickup items
   - **Download PDF/CSV/JSON** - Export your data
   - **Delete All Data** - Start fresh (requires two confirmations)

---

## Network Setup (Multiple Devices)

To use tablets or phones for the pickup process:

1. **Connect all devices to the same WiFi network**
2. **Find your computer's IP address:**
   - Windows: Open Command Prompt, type `ipconfig`
   - Mac: System Settings > Network
   - Linux: Type `ip addr` in terminal

3. **On tablets/phones, open browser to:**
   - `http://[YOUR-IP]:3000`
   - Example: `http://192.168.1.100:3000`

4. **Bookmark this address** on each tablet for easy access

---

## Changing Password

Run `bash start.sh --setup` (Mac/Linux) or `start.bat --setup` (Windows) and enter a new password.

---

## Reports & Data Export

- **PDF** - Formatted report with signatures, good for printing
- **CSV** - Spreadsheet format for Excel or Google Sheets
- **JSON** - Raw data backup for developers

All exports are available from the Admin Dashboard.

---

## Troubleshooting

### App Won't Start
- Make sure Node.js is installed from https://nodejs.org (click the LTS button)
- Close and reopen your terminal, then try again

### Can't Access from Tablet
- Are all devices on the same WiFi?
- Is the computer running the server?
- Use the correct IP address shown in the startup message

### Lost Admin Password
- Run `bash start.sh --setup` (Mac/Linux) or `start.bat --setup` (Windows) to set a new one

---

## Tips for Success

1. **Test with a few volunteers** before using with clients
2. **Have backup paper forms** ready in case of technical issues
3. **Export data regularly** for safekeeping
4. **Keep tablets charged** and ready
5. **Use a reliable WiFi connection**