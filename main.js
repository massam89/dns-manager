// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("node:path");
const { runCmd, checkIfExists } = require("./src/utils/helper");
const { shekanDNSs } = require("./setting.json");

Menu.setApplicationMenu(null);

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("src/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  ipcMain.handle("isShekanDNS", () => getIsShekanDNS());
  ipcMain.handle("disableShekan", () => disableShekan());
  ipcMain.handle("enableShekan", () => enableShekan());

  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

async function getIsShekanDNS() {
  try {
    const output = await runCmd(
      `ipconfig /all | findstr /R /C:"DNS Servers"
      exit`
    );
    const currentDNS = output.split("\n", 1)[0].split(":").pop().trim();
    const isShekanDNS = checkIfExists(shekanDNSs, currentDNS);

    return isShekanDNS;
  } catch (error) {
    return error;
  }
}

async function disableShekan() {
  try {
    return await runCmd(
      `netsh interface ip set dnsservers name="Wi-Fi" source=dhcp && netsh interface ip set dnsservers name="Ethernet" source=dhcp && ipconfig /flushdns
      exit`
    );
  } catch (error) {
    return error;
  }
}

async function enableShekan() {
  try {
    return await runCmd(
      `netsh interface ipv4 add dnsservers "Wi-Fi" address=178.22.122.100 index=1 && netsh interface ipv4 add dnsservers "Wi-Fi" address=185.51.200.2 index=2 && netsh interface ipv4 add dnsservers "Ethernet" address=178.22.122.100 index=1 && netsh interface ipv4 add dnsservers "Ethernet" address=185.51.200.2 index=2 && ipconfig /flushdns
      exit`
    );
  } catch (error) {
    return error;
  }
}
