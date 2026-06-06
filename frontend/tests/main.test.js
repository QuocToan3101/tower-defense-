/**
 * test/main.test.js
 * Unit Test cho luồng khởi tạo Game Flow (UC-01)
 */

describe('Tích hợp khởi tạo Game (main.js) [UC-01]', () => {

    beforeEach(() => {
        // 1. Giả lập DOM Elements cần thiết trong main.js
        document.body.innerHTML = `
            <div id="start-screen"></div>
            <div id="level-screen"></div>
            <div id="game-container"></div>
            <div id="error-display" class="hidden"></div>
            <div id="error-message"></div>
            <div id="error-details"></div>
        `;

        // 2. Giả lập (Mock) LocalStorage để test tiến trình lưu
        let store = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(key => store[key] || null),
                setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
                clear: () => { store = {}; }
            },
            writable: true
        });

        // 3. Giả lập các thư viện/class nội bộ
        window.ApiClient = jest.fn().mockImplementation(() => ({}));
        window.UIManager = jest.fn().mockImplementation(() => ({}));
        window.ScreenManager = jest.fn().mockImplementation(() => ({
            show: jest.fn(),
            register: jest.fn()
        }));

        window.GameManager = jest.fn().mockImplementation(() => ({
            bootstrap: jest.fn().mockResolvedValue(),
            setupLevel: jest.fn(),
            renderStatic: jest.fn()
        }));

        window.StartScreen = jest.fn().mockImplementation(() => ({}));
        window.LevelSelectScreen = jest.fn().mockImplementation(() => ({}));
        window.GameScreen = jest.fn().mockImplementation(() => ({}));

        // Chặn log không cần thiết in ra Terminal
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // 4. Gọi file main.js thật vào môi trường Test
        // isolateModules giúp mỗi test case chạy một môi trường độc lập, không bị đụng độ nhau
        jest.isolateModules(() => {
            // LƯU Ý: Đường dẫn này giả định main.js nằm ngay trong thư mục frontend
            // Nếu main.js nằm ở thư mục khác (ví dụ frontend/js/main.js), bro sửa lại thành '../js/main.js' nhé!
            require('../js/main.js');
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = ''; // Dọn dẹp DOM sau mỗi test
    });

    test('[UC-01] Bước 1.1.1: Báo lỗi Fatal Error nếu thiếu class cốt lõi', () => {
        // Xóa GameManager để giả lập lỗi thiếu class
        window.GameManager = undefined;

        // Kích hoạt sự kiện để main.js bắt đầu chạy
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Kiểm tra xem đã in ra lỗi Fatal Error đúng như code gốc chưa
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Fatal initialization error: Missing required classes: GameManager')
        );
    });

    test('[UC-01] Bước 1.2.1: Đọc chính xác Level từ LocalStorage', () => {
        // 1. Giả lập người chơi đã chơi đến level 5
        window.localStorage.setItem('td.unlockedLevel', '5');
        // 2. Kích hoạt khởi tạo game
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // 3. Trích xuất hàm getUnlockedLevel mà main.js đã truyền cho LevelSelectScreen
        // (Lấy tham số thứ 2 của hàm khởi tạo LevelSelectScreen)
        const levelSelectOptions = window.LevelSelectScreen.mock.calls[0][1];

        // 4. Giả lập việc màn hình chọn màn chơi yêu cầu đọc Level
        const currentLevel = levelSelectOptions.getUnlockedLevel();

        // 5. Kiểm tra: Hàm getItem đã được gọi chưa? Kết quả có đúng là 5 không?
        expect(window.localStorage.getItem).toHaveBeenCalledWith('td.unlockedLevel');
        expect(currentLevel).toBe(5);

        // Kiểm tra phụ các manager đã sẵn sàng
        expect(window.uiManager).toBeDefined();
        expect(window.gameManager).toBeDefined();
        expect(window.screenManager).toBeDefined();
    });

    test('[UC-01] Bước 1.1.2: Chuyển sang Start Screen sau khi Bootstrap thành công', async () => {
        document.dispatchEvent(new Event('DOMContentLoaded'));

        // Đợi Promise bootstrap của GameManager xử lý xong
        await new Promise(process.nextTick);

        expect(window.gameManager.bootstrap).toHaveBeenCalled();
        expect(window.screenManager.show).toHaveBeenCalledWith('start');
    });
});