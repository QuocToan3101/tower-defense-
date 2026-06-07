/**
 * preload.js
 * Cầu nối an toàn (Bridge) giữa Renderer Process (UI) và Main Process.
 */
// TỐI ƯU: Xóa 'ipcMain' vì preload không có quyền truy cập vào nó
const { contextBridge, ipcRenderer, shell } = require('electron');

// ════════════════════════════════════════════════════════════════════
//  PRELOAD - Safe bridge between renderer and main process
// ════════════════════════════════════════════════════════════════════

// [UC-01] Cung cấp các API cơ bản để UI có thể giao tiếp với hệ thống
contextBridge.exposeInMainWorld('electron', {
    openExternal: (url) => shell.openExternal(url),
    ipcSend: (channel, data) => ipcRenderer.send(channel, data),
    ipcOn: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(event, ...args)),
    version: process.versions.electron
});

// [UC-01] Hỗ trợ Ghi log hệ thống an toàn (System Logging)
contextBridge.exposeInMainWorld('electronLog', {
    error: (message, data) => ipcRenderer.send('log-renderer-error', { message, data, timestamp: new Date().toISOString() }),
    info: (message, data) => ipcRenderer.send('log-renderer-info', { message, data, timestamp: new Date().toISOString() })
});

// [UC-01] Bước tự động: Lắng nghe và báo cáo lỗi Crash/Unhandled Exception về Main Process
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
        // TỐI ƯU: Đảm bảo reason luôn được chuyển thành chuỗi để gửi qua IPC không bị mất data
        reason: event.reason ? event.reason.toString() : 'Unknown promise rejection'
    });
});