/**
 * test/GameManager.test.js
 * Unit Test cho các logic cốt lõi trong GameManager
 */
const fs = require('fs');
const path = require('path');

// Tự động quét toàn bộ ngóc ngách của dự án để tìm file
function findFileRecursive(dir, fileName) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Bỏ qua thư mục rác để quét chớp nhoáng
            if (file !== 'node_modules' && file !== '.git') {
                const found = findFileRecursive(fullPath, fileName);
                if (found) return found;
            }
        } else if (file === fileName) {
            return fullPath; // Bắt được rồi!
        }
    }
    return null;
}

describe('GameManager Core Logic', () => {
    let gameManager;
    let mockApiClient;
    let mockUiManager;
    let GameManagerClass;

    beforeAll(() => {
        // Lùi về tận thư mục gốc của project (tower-defense-)
        const projectRoot = path.resolve(__dirname, '../../');

        // Kích hoạt radar quét toàn bộ project
        const filePath = findFileRecursive(projectRoot, 'GameManager.js');

        if (!filePath) {
            throw new Error("LỤC TUNG PROJECT RỒI MÀ KHÔNG THẤY! Bro có lỡ đổi tên file GameManager.js không?");
        }

        console.log("Đã bắt được GameManager.js tại:", filePath); // In ra để confirm
        const fileContent = fs.readFileSync(filePath, 'utf8');
        GameManagerClass = new Function(fileContent + '\nreturn GameManager;')();
    });

    beforeEach(() => {
        // 1. Giả lập DOM Elements
        document.body.innerHTML = `
            <canvas id="game-canvas"></canvas>
            <div id="btn-start"></div>
            <div id="btn-pause" class="hidden"></div>
            <div id="btn-resume" class="hidden"></div>
            <div id="btn-next-wave" class="hidden"></div>
            <div id="btn-restart"></div>
            <div id="end-modal" class="hidden"></div>
            <div id="tower-shop"></div>
            <div id="tower-info"></div>
            <div id="wave-info"></div>
            <div id="wave-announcement"></div>
            <div id="wave-text"></div>
            <div id="combat-log"></div>
            <h2 id="end-title"></h2>
            <p id="end-message"></p>
            <span id="end-icon"></span>
            <span id="end-wave"></span>
            <span id="end-score"></span>
            <span id="end-hp"></span>
        `;

        // 2. Giả lập Global Constants và Biến toàn cục
        window.CONSTANTS = {
            STARTING_HP: 20,
            STARTING_GOLD: 300,
            MAX_TOWER_LEVEL: 3,
            GRID_COLS: 20,
            GRID_ROWS: 12,
            CELL_SIZE: 40
        };

        window.eventBus = { on: jest.fn(), emit: jest.fn() };
        window.getLevelById = jest.fn().mockReturnValue({ name: 'Test Level', totalWaves: 5 });

        // GIẢ LẬP LEVEL MANAGER & WAVE MANAGER NGAY TRÊN GLOBAL (Thay thế cho jest.mock bị lỗi)
        window.LevelManager = jest.fn().mockImplementation(() => ({}));
        window.WaveManager = jest.fn().mockImplementation(() => ({}));

        mockApiClient = {
            getTowers: jest.fn().mockResolvedValue({ data: [] }),
            getEnemies: jest.fn().mockResolvedValue({ data: [] })
        };
        mockUiManager = {
            setLevelTitle: jest.fn(),
            updateHUD: jest.fn()
        };

        // 3. Khởi tạo GameManager
        gameManager = new GameManagerClass(mockApiClient, mockUiManager, {});

        // Tắt hàm log ra console để Terminal sạch sẽ lúc test
        gameManager.log = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        if (gameManager && gameManager.countdownTimer) clearInterval(gameManager.countdownTimer);
        if (gameManager && gameManager.nextWaveTimer) clearTimeout(gameManager.nextWaveTimer);
        document.body.innerHTML = '';
    });

    test('setupLevel() khởi tạo đúng máu, vàng và reset trạng thái game', () => {
        gameManager.setupLevel(1);
        expect(gameManager.playerHp).toBe(20);
        expect(gameManager.gold).toBe(300);
        expect(gameManager.score).toBe(0);
        expect(gameManager.gameStarted).toBe(false);
        expect(mockUiManager.setLevelTitle).toHaveBeenCalledWith("Realm's Last Stand - Test Level");
    });

    test('upgradeTower() trừ vàng và gọi hàm nâng cấp nếu đủ tiền', () => {
        gameManager.gold = 100;
        const mockTower = {
            name: 'Test Tower',
            level: 1,
            nextUpgradeCost: 40,
            canUpgrade: true,
            upgrade: jest.fn(),
            sellValue: 20
        };
        gameManager.selectedTower = mockTower;
        gameManager.upgradeTower();

        expect(gameManager.gold).toBe(60);
        expect(mockTower.upgrade).toHaveBeenCalledTimes(1);
        expect(mockUiManager.updateHUD).toHaveBeenCalled();
    });

    test('upgradeTower() TỪ CHỐI nâng cấp nếu KHÔNG đủ tiền', () => {
        gameManager.gold = 10;
        const mockTower = {
            name: 'Test Tower',
            level: 1,
            nextUpgradeCost: 40,
            canUpgrade: true,
            upgrade: jest.fn()
        };
        gameManager.selectedTower = mockTower;
        gameManager.upgradeTower();

        expect(mockTower.upgrade).not.toHaveBeenCalled();
        expect(gameManager.gold).toBe(10);
    });

    test('gameOver(false) hiển thị màn hình thua cuộc chính xác', () => {
        gameManager.waveManager = { currentWave: 3 };
        gameManager.score = 500;
        gameManager.playerHp = 0;
        gameManager.gameOver(false);

        expect(gameManager.isGameOver).toBe(true);
        expect(document.getElementById('end-modal').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('end-title').textContent).toBe('Defeat');
    });

    test('gameOver(true) hiển thị màn hình chiến thắng chính xác', () => {
        gameManager.waveManager = { currentWave: 5 };
        gameManager.score = 1200;
        gameManager.playerHp = 15;
        gameManager.gameOver(true);

        expect(document.getElementById('end-modal').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('end-title').textContent).toBe('Victory!');
    });
});