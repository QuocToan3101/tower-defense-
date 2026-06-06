/**
 * test/ApiClient.test.js
 * Unit Test cho ApiClient (Offline-first / LocalStorage)
 */
const fs = require('fs');
const path = require('path');

// Tự động quét toàn bộ ngóc ngách của dự án để tìm file ApiClient.js
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

describe('ApiClient (Quản lý Lưu/Tải Game)', () => {
    let apiClient;
    let ApiClientClass;
    let mockStore = {};

    beforeAll(() => {
        const projectRoot = path.resolve(__dirname, '../../');
        const filePath = findFileRecursive(projectRoot, 'ApiClient.js');

        if (!filePath) {
            throw new Error("Không tìm thấy ApiClient.js!");
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        ApiClientClass = new Function(fileContent + '\nreturn ApiClient;')();
    });

    beforeEach(() => {
        // 1. Giả lập LocalStorage
        mockStore = {};
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(key => mockStore[key] || null),
                setItem: jest.fn((key, value) => { mockStore[key] = value.toString(); }),
                removeItem: jest.fn(key => { delete mockStore[key]; }),
                clear: jest.fn(() => { mockStore = {}; })
            },
            writable: true
        });

        // 2. Giả lập MockCatalog toàn cục
        window.MockCatalog = {
            getTowers: jest.fn().mockReturnValue([{ type: 'ARCHER', damage: 15 }]),
            getEnemies: jest.fn().mockReturnValue([{ type: 'GOBLIN', hp: 42 }])
        };

        // 3. Khởi tạo ApiClient cho mỗi test case
        apiClient = new ApiClientClass();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Khởi tạo đúng các giá trị mặc định và chế độ Offline', () => {
        expect(apiClient.isOffline).toBe(true);
        // Do lúc này chưa có token/userId trong mockStore, nên nó phải là null
        expect(apiClient.token).toBeNull();
    });

    test('getTowers() và getEnemies() lấy dữ liệu chính xác từ MockCatalog', async () => {
        const towers = await apiClient.getTowers();
        const enemies = await apiClient.getEnemies();

        expect(towers.success).toBe(true);
        expect(towers.data[0].type).toBe('ARCHER');

        expect(enemies.success).toBe(true);
        expect(enemies.data[0].type).toBe('GOBLIN');
    });

    test('[UC-01] Bước 1.2.2.2: saveGame() lưu chính xác trạng thái game vào localStorage', async () => {
        // Giả lập lưu một màn chơi
        const result = await apiClient.saveGame(
            'My Epic Save',
            15,      // playerHp
            500,     // gold
            3,       // currentWave
            1,       // levelId
            '[]'     // towersJson (giả lập mảng rỗng)
        );

        // API phải trả về success và có saveId
        expect(result.success).toBe(true);
        expect(result.data.saveId).toBeDefined();

        // Kiểm tra xem dữ liệu đã được ghi vào mảng 'td_saves' trong localStorage chưa
        expect(window.localStorage.setItem).toHaveBeenCalledWith('td_saves', expect.any(String));

        // Phân tích dữ liệu vừa lưu để kiểm chứng
        const savedData = JSON.parse(mockStore['td_saves']);
        expect(savedData.length).toBe(1);
        expect(savedData[0].name).toBe('My Epic Save');
        expect(savedData[0].playerHp).toBe(15);
        expect(savedData[0].currentWave).toBe(3);
    });

    test('[UC-01] Bước 1.2.1: listSaves() và loadSave() đọc dữ liệu thành công', async () => {
        // Chuẩn bị sẵn 1 bản lưu trong mockStore
        const dummySave = { id: 'save-123', name: 'Level 5 Boss', levelId: 5 };
        mockStore['td_saves'] = JSON.stringify([dummySave]);

        // Test listSaves()
        const listResult = await apiClient.listSaves();
        expect(listResult.success).toBe(true);
        expect(listResult.data.length).toBe(1);
        expect(listResult.data[0].name).toBe('Level 5 Boss');

        // Test loadSave() với ID hợp lệ
        const loadResult = await apiClient.loadSave('save-123');
        expect(loadResult.success).toBe(true);
        expect(loadResult.data.levelId).toBe(5);

        // Test loadSave() với ID không tồn tại
        const failedLoad = await apiClient.loadSave('ghost-save');
        expect(failedLoad.success).toBe(false);
        expect(failedLoad.message).toBe('Save not found');
    });

    test('deleteSave() xóa bản lưu khỏi localStorage', async () => {
        // Chuẩn bị sẵn 2 bản lưu
        const save1 = { id: 'save-1' };
        const save2 = { id: 'save-2' };
        mockStore['td_saves'] = JSON.stringify([save1, save2]);

        // Thực hiện xóa save-1
        const result = await apiClient.deleteSave('save-1');

        expect(result.success).toBe(true);

        // Kiểm tra localStorage xem save-1 đã bay màu chưa
        const remainingSaves = JSON.parse(mockStore['td_saves']);
        expect(remainingSaves.length).toBe(1);
        expect(remainingSaves[0].id).toBe('save-2'); // Chỉ còn lại save-2
    });
});