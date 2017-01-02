/// <reference path="typings/index.d.ts"/>

const electron = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')
const url = require('url')

//this package is giving error related to electron-edge
//const promoteWindowsTrayItems = require('electron-promote-windows-tray-items');

//require('electron-debug')({showDevTools: true, enabled: true});

const menubar = require('./tray/tray')

// Module to control application life.
const app = electron.app
const Menu = electron.Menu
const dialog = electron.dialog
const globalShortcut = electron.globalShortcut
const shell = electron.shell
const ipc = electron.ipcMain
const Tray = electron.Tray
const BrowserWindow = electron.BrowserWindow


// menu start

const template = [

  {
    label: 'View',
    submenu: [
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('http://electron.atom.io') }
      },
      {
        role: 'about'
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })

  // Window menu.
  template[2].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]

  template[3].submenu = [
    {
      label: 'Learn More',
      click() { require('electron').shell.openExternal('http://electron.atom.io') }
    }
  ]
}

// menu end

var opts = {
  dir: path.join(__dirname, 'tray'),
  icon: path.join(__dirname, 'tray', 'images', 'Icon.png'),
  tooltip: 'Saavn',
  preloadWindow: true,
  width: 390,
  height: 100
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let mb

var fileName

function createSaavnTray() {
  mb = menubar(opts)

  mb.on('ready', function () {

  });

  mb.on('after-close', function () {

  })

  mb.on('after-create-window', function () {
    //mb.window.setResizable(false);
    if (process.env.NODE_ENV === 'dev') {
      mb.window.openDevTools();
      mb.window.setResizable(true);
    }
  });

  mb.appReady()
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1028, height: 720 })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.on('dom-ready', function () {

  })

  mainWindow.webContents.session.on('will-download', function (event, item, webContents) {

    item.setSavePath(app.getPath('music') + '/' + fileName)

    item.once('done', (vent, state) => {
      if (state === 'completed') {
        mainWindow.webContents.send('FROM_MAIN', { 'type': 'NOTIFICATION', 'message': 'Download is finished!' })
      } else {
        mainWindow.webContents.send('FROM_MAIN', { 'type': 'NOTIFICATION', 'message': `Download failed: ${state}` })
      }
      fileName = null
    })

  })

  // Emitted when the window is minimized.
  mainWindow.on('minimize', function () {
    if (process.platform == 'darwin')
      app.dock.hide()
    else {
      mainWindow.setSkipTaskbar(true)
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    mb.window.close()
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {

  createWindow()
  createSaavnTray()
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  globalShortcut.register('CommandOrControl+Alt+Shift+D', function () {

    mainWindow.webContents.send('GLOBAL_SHORTCUT', 'test')

  })
  globalShortcut.register('MediaPlayPause', function () {

    mainWindow.webContents.send('GLOBAL_SHORTCUT', 'MediaPlayPause')

  })

  globalShortcut.register('MediaNextTrack', function () {

    mainWindow.webContents.send('GLOBAL_SHORTCUT', 'MediaNext')

  })

  globalShortcut.register('MediaPreviousTrack', function () {

    mainWindow.webContents.send('GLOBAL_SHORTCUT', 'MediaPrevious')

  })

})

ipc.on('TO_MAIN', (event, data) => {
  switch (data.type) {
    case 'DOWNLOAD':
      fileName = data.fileName
      mainWindow.webContents.downloadURL(data.url)
      break
    case 'SHOW_MAIN_WINDOW':
      if (process.platform == 'darwin') {
        app.dock.show()
      } else {
        mainWindow.setSkipTaskbar(false)

      }
      mainWindow.show()
      break
  }

})

ipc.on('TO_TRAY', (event, data) => {
  mb.window.webContents.send('TO_TRAY', data)
})

ipc.on('FROM_TRAY', (event, data) => {
  mainWindow.webContents.send('FROM_TRAY', data)
})

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})

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
    createSaavnTray()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
