const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  saveProjectDialog: (data, defaultName) => ipcRenderer.invoke('dialog:saveProject', { data, defaultName }),
  openProjectDialog: () => ipcRenderer.invoke('dialog:openProject'),
});
