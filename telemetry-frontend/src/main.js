const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    title: 'Embedded Controller Telemetry Dashboard',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Target the dist folder at root level (C:\telemetry\telemetry-frontend\dist)
  const rootDir = process.cwd();
  const pathBrowser = path.join(rootDir, 'dist/telemetry-frontend/browser/index.html');
  const pathRoot = path.join(rootDir, 'dist/telemetry-frontend/index.html');

  if (fs.existsSync(pathBrowser)) {
    mainWindow.loadFile(pathBrowser);
  } else if (fs.existsSync(pathRoot)) {
    mainWindow.loadFile(pathRoot);
  } else {
    console.error('❌ Could not find build index.html in dist folder!');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});