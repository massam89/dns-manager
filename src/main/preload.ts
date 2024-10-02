/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  getNetworkInterfaces: () => ipcRenderer.invoke('getNetworkInterfaces'),
  getNetworkInterfaceStatus: (networkInterfaceName: string) =>
    ipcRenderer.invoke('get-network-interface-status', networkInterfaceName),
  setPrimaryAndSecondaryDNS: (networkInterfaceName: string, dns: string[]) =>
    ipcRenderer.invoke(
      'set-primary-and-secondary-dns',
      networkInterfaceName,
      dns,
    ),
  disableCustomDNS: (networkInterfaceName: any) =>
    ipcRenderer.invoke('disable-custom-dns', networkInterfaceName),
  getServicePing: (service: any) =>
    ipcRenderer.invoke('get-service-ping', service),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
