const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("dns", {
  isShekanDNS: () => ipcRenderer.invoke("isShekanDNS"),
  disableShekan: () => ipcRenderer.invoke("disableShekan"),
  enableShekan: () => ipcRenderer.invoke("enableShekan"),
});
