const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("dns", {
  isDNS: () => ipcRenderer.invoke("isDNS"),
  disable: () => ipcRenderer.invoke("disable"),
  enable: () => ipcRenderer.invoke("enable"),
  DNSs: () => ipcRenderer.invoke("DNSs"),
});
