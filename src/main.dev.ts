/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  Display,
  ipcMain,
  ipcRenderer,
  screen,
  shell,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log, { create } from 'electron-log';
import { getByDisplayValue } from '@testing-library/dom';
import { electron } from 'process';
import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const windows: { [key: number]: BrowserWindow } = {};

ipcMain.on('cue-start-task', (event, task) => {
  event.reply('start-task', task);
});

ipcMain.on('cue-end-task', (event) => {
  event.reply('end-task');
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  // require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow: (display: Display) => BrowserWindow = (display) => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let window: BrowserWindow | null = new BrowserWindow({
    x: display.bounds.x,
    y: display.bounds.y,
    show: false,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    fullscreen: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  window.setIgnoreMouseEvents(true);

  window.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  window.webContents.on('did-finish-load', () => {
    if (!window) {
      throw new Error('"window" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window.minimize();
    } else {
      window.show();
      window.focus();
    }
  });

  window.on('closed', () => {
    window = null;
  });

  const menuBuilder = new MenuBuilder(window);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  return window;
};

const createWindows = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  screen.getAllDisplays().forEach((display) => {
    console.log(display.id);
    windows[display.id] = createWindow(display);
  });

  screen.on('display-added', (_, newDisplay) => {
    windows[newDisplay.id] = createWindow(newDisplay);
  });

  screen.on('display-removed', (_, oldDisplay) => {
    delete windows[oldDisplay.id];
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindows).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window === null) createWindows();
});
