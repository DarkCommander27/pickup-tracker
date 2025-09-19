const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // Prevent navigation to external sites
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) {
      e.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-file', async (event, { filename, contents }) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save export',
    defaultPath: path.join(app.getPath('documents'), filename || 'pickups.json')
  });
  if (canceled) return { saved: false };
  try {
    fs.writeFileSync(filePath, contents, 'utf8');
    return { saved: true, path: filePath };
  } catch (err) {
    return { saved: false, error: err.message };
  }
});
