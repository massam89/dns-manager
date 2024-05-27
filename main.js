const { app, BrowserWindow, Menu } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("node:path");
const { runCmd, checkIfExists } = require("./src/utils/helper");
const { DNSs } = require("./setting.json");

// Menu.setApplicationMenu(null);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    title: "DNS manager",
    maximizable: false,
    width: 300,
    height: 280,
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"),
    },
  });

  mainWindow.loadFile("src/index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("isDNS", () => getIsDNS()); // Inter-Process Communication
  ipcMain.handle("disable", () => disable());
  ipcMain.handle("enable", () => enable());
  ipcMain.handle("DNSs", () => DNSs);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function getIsDNS() {
  try {
    const output = await runCmd(
      `ipconfig /all | findstr /R /C:"DNS Servers"
      exit`
    );
    const currentDNS1 = output.split("\n", 2)[0].split(":").pop().trim();
    const currentDNS2 = output.split("\n", 2)[1].split(":").pop().trim();
    let currentDNS = currentDNS1?.length === 14 ? currentDNS1 : currentDNS2;

    const isCurrentDNSInTheSettingFile = checkIfExists(DNSs, currentDNS);

    return { currentDNS, isCurrentDNSInTheSettingFile };
  } catch (error) {
    console.log(error);
  }
}

async function disable() {
  try {
    return await runCmd(
      `netsh interface ip set dnsservers name="Wi-Fi" source=dhcp && netsh interface ip set dnsservers name="Ethernet" source=dhcp && ipconfig /flushdns
      exit`
    );
  } catch (error) {
    console.log(error);
  }
}

async function enable() {
  try {
    return await runCmd(
      `netsh interface ipv4 add dnsservers "Wi-Fi" address=${DNSs[0]} index=1 && netsh interface ipv4 add dnsservers "Wi-Fi" address=${DNSs[1]} index=2 && netsh interface ipv4 add dnsservers "Ethernet" address=${DNSs[0]} index=1 && netsh interface ipv4 add dnsservers "Ethernet" address=${DNSs[1]} index=2 && ipconfig /flushdns
      exit`
    );
  } catch (error) {
    console.log(error);
  }
}
