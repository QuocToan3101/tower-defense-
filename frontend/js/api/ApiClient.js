/**
 * ApiClient.js
 * Centralised HTTP client for all backend communication.
 * Automatically attaches the JWT Bearer token to protected requests.
 */
class ApiClient {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.token   = localStorage.getItem('td_token') || null;
        this.userId  = localStorage.getItem('td_userId') || null;
        this.username = localStorage.getItem('td_username') || null;
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

    async request(method, path, body = null, requiresAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (requiresAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        try {
            const res  = await fetch(`${this.baseUrl}${path}`, opts);
            const rawBody = await res.text();
            let json = null;

            if (rawBody) {
                try {
                    json = JSON.parse(rawBody);
                } catch (_parseErr) {
                    json = { message: rawBody };
                }
            }

            if (!res.ok) {
                const message = json?.message || rawBody || `HTTP ${res.status}`;
                throw new Error(message);
            }

            return json ?? { success: true, message: 'OK', data: null };
        } catch (err) {
            console.error(`[API] ${method} ${path} failed:`, err.message);
            throw err;
        }
    }

    // ─── Auth Endpoints ────────────────────────────────────

    async register(username, email, password) {
        const res = await this.request('POST', '/api/auth/register',
            { username, email, password }, false);
        if (res.success) this.setAuth(res.data.token, res.data.userId, res.data.username);
        return res;
    }

    async login(username, password) {
        const res = await this.request('POST', '/api/auth/login',
            { username, password }, false);
        if (res.success) this.setAuth(res.data.token, res.data.userId, res.data.username);
        return res;
    }

    async loginAsGuest() {
        const res = await this.request('POST', '/api/auth/guest', null, false);
        if (res.success) this.setAuth(res.data.token, res.data.userId, res.data.username);
        return res;
    }

    // ─── Catalog Endpoints (public) ─────────────────────────

    async getTowers() {
        return this.request('GET', '/api/catalog/towers', null, false);
    }

    async getEnemies() {
        return this.request('GET', '/api/catalog/enemies', null, false);
    }

    // ─── Tower Management Endpoints ────────────────────────

    async upgradeTower(towerId, currentLevel) {
        return this.request('POST', '/api/tower/upgrade',
            { towerId, currentLevel });
    }

    async deleteTower(towerId, level) {
        return this.request('POST', '/api/tower/delete',
            { towerId, level });
    }

    // ─── Save/Load Endpoints ──────────────────────────────

    async saveGame(saveName, playerHp, gold, currentWave, levelId, towersJson) {
        return this.request('POST', '/api/saves',
            { saveName, playerHp, gold, currentWave, levelId, towersJson });
    }

    async listSaves() {
        return this.request('GET', '/api/saves');
    }

    async loadSave(saveId) {
        return this.request('GET', `/api/saves/${saveId}`);
    }

    async deleteSave(saveId) {
        return this.request('DELETE', `/api/saves/${saveId}`);
    }
}

// Singleton instance used by all modules
const api = new ApiClient();
