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

    // ─── Token Management ──────────────────────────────────

    setAuth(token, userId, username) {
        this.token    = token;
        this.userId   = userId;
        this.username = username;
        localStorage.setItem('td_token',    token);
        localStorage.setItem('td_userId',   userId);
        localStorage.setItem('td_username', username);
    }

    clearAuth() {
        this.token    = null;
        this.userId   = null;
        this.username = null;
        localStorage.removeItem('td_token');
        localStorage.removeItem('td_userId');
        localStorage.removeItem('td_username');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // ─── Core Request ──────────────────────────────────────
    // In offline mode, no actual HTTP requests are made.
    // All data is stored/retrieved from localStorage.

    async request(method, path, body = null, requiresAuth = true) {
        // Offline mode - no HTTP requests
        console.log(`[API-OFFLINE] ${method} ${path}`);
        return { success: true, data: null };
    }

    // ─── Auth Endpoints ────────────────────────────────────

    async register(username, email, password) {
        this.setAuth('offline-token', '1', username);
        return { success: true, data: { token: 'offline-token', userId: '1', username } };
    }

    async login(username, password) {
        this.setAuth('offline-token', '1', username);
        return { success: true, data: { token: 'offline-token', userId: '1', username } };
    }

    async loginAsGuest() {
        this.setAuth('offline-token', '1', 'Guest');
        return { success: true, data: { token: 'offline-token', userId: '1', username: 'Guest' } };
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

    async upgradeTower(towerId, currentLevel) {
        return { success: true, data: { upgraded: true } };
    }

    async deleteTower(towerId, level) {
        return { success: true, data: { deleted: true } };
    }

    // ─── Save/Load Endpoints ──────────────────────────────
    // All saves stored in localStorage as JSON array

    async saveGame(saveName, playerHp, gold, currentWave, levelId, towersJson) {
        const saves = this._loadSaves();
        const saveId = String(Date.now());
        saves.push({
            id: saveId,
            name: saveName,
            playerHp,
            gold,
            currentWave,
            levelId,
            towersJson,
            timestamp: Date.now()
        });
        localStorage.setItem('td_saves', JSON.stringify(saves));
        return { success: true, data: { saveId } };
    }

    async listSaves() {
        return { success: true, data: this._loadSaves() };
    }

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
