/**
 * ApiClient.js
 * Offline-first API client using localStorage for all game data.
 * No backend server required - fully standalone gameplay.
 */
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || 'http://localhost:8080';
        this.token   = localStorage.getItem('td_token') || null;
        this.userId  = localStorage.getItem('td_userId') || null;
        this.username = localStorage.getItem('td_username') || null;
        this.isOffline = true; // Always offline mode
    }

    // ─── Catalog Endpoints (public) ─────────────────────────

    async getTowers() {
        return { success: true, data: MockCatalog.getTowers() };
    }

    async getEnemies() {
        return { success: true, data: MockCatalog.getEnemies() };
    }

    // ─── Tower Management Endpoints ────────────────────────
    // In offline mode, tower management is handled by frontend logic
    // API calls just return success for compatibility

    // ─── Save/Load Endpoints ──────────────────────────────
    // All saves stored in localStorage as JSON array

    // [UC-01 Bắt đầu trò chơi] Bước 1.2.2.2: Người chơi chọn Lưu game
    // Hệ thống đóng gói trạng thái hiện tại (HP, Gold, Wave, Towers...)
    // và lưu vào localStorage.
    async saveGame(saveName, playerHp, gold, currentWave, levelId, towersJson) {
        const saves = this._loadSaves();
        const saveId = String(Date.now());

        // Tạo object lưu trữ trạng thái game
        const newSave = {
            id: saveId,
            name: saveName,
            playerHp,
            gold,
            currentWave,
            levelId,
            towersJson,
            timestamp: Date.now()
        };

        saves.push(newSave); // push vào mảng saves
        // Ghi đè lại mảng vào localStorage
        localStorage.setItem('td_saves', JSON.stringify(saves));

        return { success: true, data: { saveId } };
    }

    // [UC-01 Bắt đầu trò chơi] Bước 1.2.1: Hiển thị danh sách bản lưu
    // listSaves() đọc localStorage 'td_saves' để trả về giao diện
    async listSaves() {
        return { success: true, data: this._loadSaves() };
    }

    // [UC-01 Bắt đầu trò chơi] Bước 1.2.1: Load bản lưu
    // loadSave(id) tìm kiếm trong mảng saves và trả về dữ liệu tương ứng
    async loadSave(saveId) {
        const saves = this._loadSaves();
        const save = saves.find(s => s.id === saveId);

        if (!save) {
            return { success: false, message: 'Save not found' };
        }
        return { success: true, data: save };
    }

    async deleteSave(saveId) {
        let saves = this._loadSaves();
        saves = saves.filter(s => s.id !== saveId);
        localStorage.setItem('td_saves', JSON.stringify(saves));
        return { success: true };
    }

    _loadSaves() {
        try {
            return JSON.parse(localStorage.getItem('td_saves') || '[]');
        } catch (e) {
            return [];
        }
    }

}

// Singleton instance used by all modules
const api = new ApiClient();
