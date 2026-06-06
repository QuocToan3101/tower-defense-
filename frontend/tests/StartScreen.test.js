/**
 * test/StartScreen.test.js
 * Unit Test cho luồng giao diện Main Menu
 */
const fs = require('fs');
const path = require('path');

// Tự động quét toàn bộ ngóc ngách của dự án để tìm file StartScreen.js
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

describe('Giao diện Màn hình bắt đầu (StartScreen.js)', () => {
    let startScreen;
    let mockOnStartGame;
    let StartScreenClass;
    let rootElement;

    beforeAll(() => {
        // Lùi về tận thư mục gốc của project (tower-defense-)
        const projectRoot = path.resolve(__dirname, '../../');

        // Kích hoạt radar
        const filePath = findFileRecursive(projectRoot, 'StartScreen.js');

        if (!filePath) {
            throw new Error("Không tìm thấy StartScreen.js!");
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        // Đọc class StartScreen
        StartScreenClass = new Function(fileContent + '\nreturn StartScreen;')();
    });

    beforeEach(() => {
        // 1. Giả lập DOM theo đúng giao diện yêu cầu
        document.body.innerHTML = `
            <div id="start-screen" class="hidden">
                <button class="btn" data-action="start-game">New Game</button>
                <button class="btn" data-action="start-game">Continue</button>
            </div>
        `;

        rootElement = document.getElementById('start-screen');

        // 2. Giả lập hàm callback khi bấm Start
        mockOnStartGame = jest.fn();

        // 3. Khởi tạo đối tượng StartScreen
        startScreen = new StartScreenClass(rootElement, {
            onStartGame: mockOnStartGame
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });

    test('[UC-01] Bước 1.1.2: show() hiển thị chính xác màn hình Start', () => {
        // Gọi hàm show()
        startScreen.show();

        // Phải mất đi class hidden và thêm vào class is-active
        expect(rootElement.classList.contains('hidden')).toBe(false);
        expect(rootElement.classList.contains('is-active')).toBe(true);
    });

    test('hide() ẩn màn hình Start và xóa hiệu ứng active', () => {
        // Giả lập trạng thái đang hiển thị
        startScreen.show();

        // Gọi hàm hide()
        startScreen.hide();

        // Phải có lại class hidden và mất đi class is-active
        expect(rootElement.classList.contains('hidden')).toBe(true);
        expect(rootElement.classList.contains('is-active')).toBe(false);
    });

    test('[UC-01] Bước 1.1.3: Click vào nút Start Game sẽ kích hoạt callback chuyển màn hình', () => {
        // Tìm tất cả các nút có data-action="start-game"
        const startBtns = document.querySelectorAll('.btn[data-action="start-game"]');

        // Bấm thử nút đầu tiên (New Game)
        startBtns[0].click();

        // Kiểm tra xem hàm onStartGame đã được gọi chưa
        expect(mockOnStartGame).toHaveBeenCalledTimes(1);

        // Bấm thử nút thứ hai (Continue)
        startBtns[1].click();
        expect(mockOnStartGame).toHaveBeenCalledTimes(2);
    });
});