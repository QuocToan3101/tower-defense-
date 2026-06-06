/**
 * test/ScreenManager.test.js
 * Unit Test cho hệ thống chuyển màn hình (ScreenManager.js)
 */
const fs = require('fs');
const path = require('path');

// Tự động quét toàn bộ ngóc ngách của dự án để tìm file
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

describe('Bộ điều phối màn hình (ScreenManager.js)', () => {
    let screenManager;
    let ScreenManagerClass;
    let mockStartScreen;
    let mockLevelScreen;

    beforeAll(() => {
        // Lùi về tận thư mục gốc của project (tower-defense-)
        const projectRoot = path.resolve(__dirname, '../../');

        // Kích hoạt radar tìm ScreenManager.js
        const filePath = findFileRecursive(projectRoot, 'ScreenManager.js');

        if (!filePath) {
            throw new Error("Không tìm thấy ScreenManager.js!");
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        ScreenManagerClass = new Function(fileContent + '\nreturn ScreenManager;')();
    });

    beforeEach(() => {
        // Reset DOM trước mỗi test
        document.body.dataset.screen = '';

        // Tắt console.log của ScreenManager để terminal sạch sẽ lúc chạy test
        jest.spyOn(console, 'log').mockImplementation(() => {});

        // 1. Khởi tạo ScreenManager instance
        screenManager = new ScreenManagerClass();

        // 2. Tạo 2 màn hình giả lập (Mock)
        mockStartScreen = { show: jest.fn(), hide: jest.fn() };
        mockLevelScreen = { show: jest.fn(), hide: jest.fn() };

        // 3. Đăng ký các màn hình giả này vào hệ thống
        screenManager.register('start', mockStartScreen);
        screenManager.register('level', mockLevelScreen);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('register() lưu trữ chính xác màn hình vào hệ thống', () => {
        // Kiểm tra xem Map() có chứa các màn hình đã đăng ký chưa
        expect(screenManager.screens.has('start')).toBe(true);
        expect(screenManager.screens.has('level')).toBe(true);
        expect(screenManager.screens.get('start')).toBe(mockStartScreen);
    });

    test('show() chuyển màn hình lần đầu (từ null sang start)', () => {
        const payload = { isFirstLoad: true };

        // Thực thi
        screenManager.show('start', payload);

        // Trạng thái được cập nhật
        expect(screenManager.getCurrentScreen()).toBe('start');
        expect(document.body.dataset.screen).toBe('start');

        // Màn hình start phải được gọi show với đúng dữ liệu
        expect(mockStartScreen.show).toHaveBeenCalledWith(payload);
    });

    test('[UC-01] Bước 1.1.4: show() chuyển từ Start Screen sang Level Select Screen', () => {
        // Giả lập đang ở màn hình Start
        screenManager.show('start');

        // Người chơi chọn New Game -> Chuyển sang màn hình Level
        screenManager.show('level', { unlockLevel: 2 });

        // Màn hình cũ (start) phải bị ẩn đi
        expect(mockStartScreen.hide).toHaveBeenCalledTimes(1);

        // Màn hình mới (level) phải được hiện lên
        expect(mockLevelScreen.show).toHaveBeenCalledWith({ unlockLevel: 2 });

        // Trạng thái hệ thống phải được chuyển sang level
        expect(screenManager.getCurrentScreen()).toBe('level');
        expect(document.body.dataset.screen).toBe('level');
    });

    test('Guard clause: KHÔNG gọi hide() nếu chuyển tới chính màn hình đang hiển thị', () => {
        // Chuyển lần 1
        screenManager.show('start');

        // Chuyển lần 2 (Giả lập việc nhấn lại nút refresh/tải lại cùng một view)
        screenManager.show('start', { refresh: true });

        // Kiểm tra: Màn hình cũ KHÔNG bị hide
        expect(mockStartScreen.hide).not.toHaveBeenCalled();

        // Hàm show được gọi lần 2 với dữ liệu mới
        expect(mockStartScreen.show).toHaveBeenCalledTimes(2);
        expect(mockStartScreen.show).toHaveBeenLastCalledWith({ refresh: true });
    });
});