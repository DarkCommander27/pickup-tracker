const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (opts) => ipcRenderer.invoke('save-file', opts),
  getBackendUrl: () => process.env.BACKEND_URL || 'http://localhost:3000'
});
