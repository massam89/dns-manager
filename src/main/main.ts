/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import {
  extractIPsAndWords,
  parseLinesToObject,
  resolveHtmlPath,
  runCmd,
} from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

export async function getNetworkInterfaces() {
  try {
    const result: any = await runCmd('netsh interface show interface');
    return parseLinesToObject(result);
  } catch (error) {
    return error;
  }
}

export async function getNetworkInterfaceStatus(interfaceName: any) {
  try {
    const result: any = await runCmd(
      `netsh interface ip show dns name="${interfaceName}"`,
    );
    return extractIPsAndWords(result, ['DHCP', 'Statically']);
  } catch (error) {
    return error;
  }
}

export async function setPrimaryAndSecondaryDNS(
  interfaceName: any,
  dns: string[],
) {
  try {
    const result = await runCmd(
      `netsh interface ip set dnsservers "${interfaceName}" static ${dns[0]} primary & netsh interface ip add dnsservers "${interfaceName}" ${dns[1]} index=2`,
    );
    return result;
  } catch (error) {
    return error;
  }
}

export async function disableCustomDNS(interfaceName: any) {
  try {
    console.log(`netsh interface ip set dnsservers "${interfaceName}" dhcp`);
    const result = await runCmd(
      `netsh interface ip set dnsservers "${interfaceName}" dhcp`,
    );
    return result;
  } catch (error) {
    return error;
  }
}

app
  .whenReady()
  .then(() => {
    ipcMain.handle('getNetworkInterfaces', () => getNetworkInterfaces());
    ipcMain.handle(
      'get-network-interface-status',
      (_, networkInterfaceName) => {
        return getNetworkInterfaceStatus(networkInterfaceName);
      },
    );
    ipcMain.handle(
      'set-primary-and-secondary-dns',
      (_, networkInterfaceName, dns) => {
        return setPrimaryAndSecondaryDNS(networkInterfaceName, dns);
      },
    );
    ipcMain.handle('disable-custom-dns', (_, networkInterfaceName) => {
      return disableCustomDNS(networkInterfaceName);
    });

    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
