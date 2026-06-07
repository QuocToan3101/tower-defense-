/**
 * test/preload.test.js
 * Unit Test cho Preload Script
 */
const fs = require('fs');
const path = require('path');

// RADAR QUÉT TÌM preload.js
function findFileRecursive(dir, fileName) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                const found = findFileRecursive(fullPath, fileName);
                if (found) return found;
            }
        } else if (file === fileName) {
            return fullPath;
        }
    }
    return null;
}

// 1. Đặt các thiết bị thu sóng (Mock Functions) ở vũ trụ gốc
const mockExposeInMainWorld = jest.fn();
const mockIpcSend = jest.fn();
const mockIpcOn = jest.fn();
const mockShellOpen = jest.fn();

// 2. Cắm thẳng Mock vào module 'electron'
jest.mock('electron', () => ({
    contextBridge: { exposeInMainWorld: mockExposeInMainWorld },
    ipcRenderer: { send: mockIpcSend, on: mockIpcOn },
    shell: { openExternal: mockShellOpen }
}), { virtual: true });

describe('Electron Preload Bridge', () => {
    let windowEventListeners = {};
    let exposedAPIs = {};

    beforeAll(() => {
        // Bắt cóc các API khi preload.js chạy
        mockExposeInMainWorld.mockImplementation((key, api) => {
            exposedAPIs[key] = api;
        });

        // Giả lập window.addEventListener
        jest.spyOn(window, 'addEventListener').mockImplementation((event, callback) => {
            windowEventListeners[event] = callback;
        });

        // Radar quét và chạy thẳng preload.js
        const projectRoot = path.resolve(__dirname, '../../');
        const filePath = findFileRecursive(projectRoot, 'preload.js');
        if (!filePath) throw new Error("Không tìm thấy preload.js!");

        require(filePath); // Require chạy trực tiếp luôn, không isolate nữa
    });

    beforeEach(() => {
        // Chỉ reset lịch sử gọi hàm, không reset API đã bắt cóc
        mockIpcSend.mockClear();
        mockIpcOn.mockClear();
        mockShellOpen.mockClear();
    });

    test('[UC-01] contextBridge phải expose đúng "electron" và "electronLog"', () => {
        expect(mockExposeInMainWorld).toHaveBeenCalledTimes(2);
        expect(exposedAPIs['electron']).toBeDefined();
        expect(exposedAPIs['electronLog']).toBeDefined();
    });

    test('API electron.openExternal gọi shell.openExternal', () => {
        exposedAPIs['electron'].openExternal('https://github.com');
        expect(mockShellOpen).toHaveBeenCalledWith('https://github.com');
    });

    test('API electron.ipcSend gửi đúng dữ liệu qua ipcRenderer', () => {
        exposedAPIs['electron'].ipcSend('test-channel', { data: 123 });
        expect(mockIpcSend).toHaveBeenCalledWith('test-channel', { data: 123 });
    });

    test('[UC-01] electronLog.error và info gửi đúng IPC log', () => {
        exposedAPIs['electronLog'].error('Lỗi nặng!', { code: 500 });
        expect(mockIpcSend).toHaveBeenCalledWith(
            'log-renderer-error',
            expect.objectContaining({
                message: 'Lỗi nặng!',
                data: { code: 500 },
                timestamp: expect.any(String)
            })
        );
    });

    test('[UC-01] Bắt tự động lỗi window "error" và báo cáo cho Main Process', () => {
        const mockErrorEvent = {
            message: 'Null Pointer',
            filename: 'main.js',
            lineno: 10,
            colno: 5,
            error: { stack: 'Error at main.js:10' }
        };

        windowEventListeners['error'](mockErrorEvent);

        expect(mockIpcSend).toHaveBeenCalledWith(
            'log-renderer-error',
            expect.objectContaining({ type: 'uncaughtError', message: 'Null Pointer' })
        );
    });

    test('[UC-01] Bắt tự động lỗi "unhandledrejection" (Promise)', () => {
        const mockRejectionEvent = { reason: new Error('API Timeout') };
        windowEventListeners['unhandledrejection'](mockRejectionEvent);

        expect(mockIpcSend).toHaveBeenCalledWith(
            'log-renderer-error',
            expect.objectContaining({ type: 'unhandledRejection' })
        );
    });
});