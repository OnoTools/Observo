const electron = require('electron')
const importWindow = require('import-window')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
import { enableLiveReload } from "electron-compile"
enableLiveReload();
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
app.disableHardwareAcceleration()
function createWindow() {
  // Create the browser window.
  mainWindow = importWindow.createWindow({
    show: false,
    backgroundColor: '#420024',
    frame: false,
    resizable: true,
    maximizable: true,
    backgroundColor: 'gray',
    webPreferences: {
      zoomFactor: 0.9,
    }
  })

  // and load the index.html of the app.
  mainWindow.setURL(__dirname, "./src/explorer/index.html")
  //mainWindow.win.setFullScreenable(false)
  //mainWindow.win.setResizable(false)
  //mainWindow.win.setMinimumSize(800, 600);
  //mainWindow.win.setMaximumSize(800, 600);
  mainWindow.openDevTools();
  mainWindow.win.once('ready-to-show', () => {
    mainWindow.win.show()
  })
  importWindow.setDir(__dirname)



}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.