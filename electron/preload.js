const { contextBridge, ipcMain, ipcRenderer, shell } = require('electron');

// ════════════════════════════════════════════════════════════════════
//  PRELOAD - Safe bridge between renderer and main process
// ════════════════════════════════════════════════════════════════════

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electron', {
  openExternal: (url) => shell.openExternal(url),
  ipcSend: (channel, data) => ipcRenderer.send(channel, data),
  ipcOn: (channel, callback) => ipcRenderer.on(channel, callback),
  version: process.versions.electron
});

// Also expose console methods to log to main process
contextBridge.exposeInMainWorld('electronLog', {
  error: (message, data) => ipcRenderer.send('log-renderer-error', { message, data, timestamp: new Date().toISOString() }),
  info: (message, data) => ipcRenderer.send('log-renderer-info', { message, data, timestamp: new Date().toISOString() })
});

// Log script errors from renderer process
window.addEventListener('error', (event) => {
  ipcRenderer.send('log-renderer-error', {
    type: 'uncaughtError',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  ipcRenderer.send('log-renderer-error', {
    type: 'unhandledRejection',
    reason: event.reason,
    promise: event.promise
  });
});
