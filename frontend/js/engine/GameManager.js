/**
 * GameManager.js
 * Orchestrates gameplay, rendering, input, and UI sync.
 */
class GameManager {
    constructor(apiClient, uiManager, navigation = {}) {
        this.api = apiClient;
        this.ui = uiManager;
        this.navigation = navigation;
        this.onLevelCompleted = navigation.onLevelCompleted ?? null;

        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.level = null;
        this.levelManager = null;
        this.waveManager = null;

        this.projectiles = [];
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.hoverCell = null;
        this.currentLevelId = null;

        this.playerHp = CONSTANTS.STARTING_HP;
        this.gold = CONSTANTS.STARTING_GOLD;
        this.score = 0;
        this.gameStarted = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameSpeed = 1;
        this.nextWaveTimer = null;
        this.countdownTimer = null;

        this.lastTime = performance.now();
        this.loopBound = this.loop.bind(this);

        this.towerCatalog = [];
        this.enemyCatalog = [];
        // 4.3.1 và 4.3.2 ở nhánh quái chạm base làm tụt HP
        this._gateDamaged = new WeakSet();

        this.bindEvents();
        this.bindControls();
        this.bindCanvasInput();
        this.updateHUD();
        this.log('Welcome commander. Pick a tower and prepare your defenses.');
    }

    async bootstrap() {
        await this.loadCatalogs();
    }

    async loadCatalogs() {
        const fallbackTowers = [
            { type: 'ARCHER', name: 'Archer Tower', baseCost: 50, baseDamage: 15, baseRange: 120, baseFireRate: 1.2, upgradeCost: 40, sellRatio: 0.6 },
            { type: 'CANNON', name: 'Cannon Tower', baseCost: 100, baseDamage: 50, baseRange: 100, baseFireRate: 0.5, upgradeCost: 75, sellRatio: 0.6 },
            { type: 'MAGE', name: 'Mage Tower', baseCost: 120, baseDamage: 30, baseRange: 140, baseFireRate: 0.8, upgradeCost: 90, sellRatio: 0.6 },
            { type: 'ICE', name: 'Ice Tower', baseCost: 80, baseDamage: 8, baseRange: 110, baseFireRate: 1.0, upgradeCost: 60, sellRatio: 0.6 },
            { type: 'FLAME', name: 'Flame Tower', baseCost: 90, baseDamage: 20, baseRange: 90, baseFireRate: 1.5, upgradeCost: 70, sellRatio: 0.6 }
        ];
        const fallbackEnemies = [
            { type: 'GOBLIN', name: 'Goblin', baseHp: 42, baseSpeed: 2.5, goldReward: 10, damageToPlayer: 1, armor: 0.0 },
            { type: 'ORC', name: 'Orc', baseHp: 140, baseSpeed: 1.2, goldReward: 20, damageToPlayer: 2, armor: 0.15 },
            { type: 'TROLL', name: 'Troll', baseHp: 280, baseSpeed: 0.8, goldReward: 35, damageToPlayer: 3, armor: 0.25 },
            { type: 'WOLF', name: 'Wolf', baseHp: 56, baseSpeed: 3.5, goldReward: 15, damageToPlayer: 1, armor: 0.05 },
            { type: 'DRAGON', name: 'Dragon', baseHp: 840, baseSpeed: 1.0, goldReward: 80, damageToPlayer: 5, armor: 0.4 }
        ];

        try {
            const [towersRes, enemiesRes] = await Promise.all([
                this.api.getTowers(),
                this.api.getEnemies()
            ]);
            this.towerCatalog = towersRes?.data?.length ? towersRes.data : fallbackTowers;
            this.enemyCatalog = enemiesRes?.data?.length ? enemiesRes.data : fallbackEnemies;
        } catch (err) {
            console.warn('Catalog fetch failed, using fallback data:', err.message);
            this.towerCatalog = fallbackTowers;
            this.enemyCatalog = fallbackEnemies;
        }

        this.renderTowerShop();
    }
	
    /**
     * [UC-01 Bắt đầu trò chơi] Bước 1.1.6: Load map, khởi tạo Gold và HP.
     * Được gọi sau khi người chơi chọn level.
     * Reset trạng thái và khởi tạo các hằng số cấu hình.
     */
    setupLevel(levelId) {
        this.level = getLevelById(levelId);
        this.currentLevelId = levelId;
        this.levelManager = new LevelManager(this.level, this.towerCatalog);
        this.waveManager = new WaveManager(this.level, this.enemyCatalog);
        this.clearNextWaveTimer();
        this.projectiles = [];

        // Reset lựa chọn tháp
        this.selectedTower = null;
        this.selectedTowerType = null;
        this.hoverCell = null;

        // BR-001-2: Khởi tạo giá trị từ Cấu hình, không được tự ý sửa ở đây.
        this.playerHp = CONSTANTS.STARTING_HP;
        this.gold = CONSTANTS.STARTING_GOLD;
        this.score = 0;

        this.gameStarted = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.gameSpeed = 1;

        this.ui.setLevelTitle(`Realm's Last Stand - ${this.level.name}`);

        this.resetControlVisibility();
        this.updateWaveInfo('Game not started. Press Start to begin wave 1.');
        this.updateHUD();
        this.startCountdown(5);
    }

    bindEvents() {
        eventBus.on('enemy:killed', (enemy) => {
            // BƯỚC 3a: Quái bị hạ gục -> cộng thưởng và cập nhật HUD.
            this.gold += enemy.goldReward;
            this.score += enemy.goldReward * 10;
            this.updateHUD();
        });

        eventBus.on('enemy:reached', (enemy) => {
            // BƯỚC 2a: Quái lọt tới căn cứ -> trừ HP căn cứ và cập nhật HUD.
            // Guard: ensure we only apply gate damage once per enemy instance
            try {
                if (this._gateDamaged.has(enemy)) return;
                this._gateDamaged.add(enemy);

                this.playerHp -= enemy.damageToPlayer;
                this.updateHUD();
                this.log(`${enemy.name} breached the gate. -${enemy.damageToPlayer} HP`);
                if (this.playerHp <= 0) {
                    this.playerHp = 0;
                    this.gameOver(false);
                }
            } catch (err) {
                console.warn('Error handling enemy:reached', err);
            }
        });

        eventBus.on('wave:started', (wave) => {
            // BƯỚC 1: Bắt đầu wave mới, đồng bộ HUD và thông báo cho người chơi.
            this.updateHUD();
            this.updateWaveInfo(`Wave ${wave} has begun. Hold the line.`);
            this.showWaveAnnouncement(`Wave ${wave}`);
            this.log(`Wave ${wave} started.`);
            document.getElementById('btn-next-wave').classList.add('hidden');
        });

        eventBus.on('wave:complete', (wave) => {
            // BƯỚC 1: Wave kết thúc -> thưởng vàng, mở nút sang wave tiếp theo.
            this.gold += CONSTANTS.GOLD_PER_WAVE;
            this.updateHUD();
            this.log(`Wave ${wave} complete. +${CONSTANTS.GOLD_PER_WAVE} bonus gold.`);

            if (this.waveManager.isFinalWave) {
                this.gameOver(true);
                return;
            }

            this.updateWaveInfo(`Wave ${wave} cleared. Next wave starts soon.`);
            document.getElementById('btn-next-wave').classList.remove('hidden');

            this.clearNextWaveTimer();
            this.nextWaveTimer = setTimeout(() => {
                this.nextWaveTimer = null;
                if (!this.isGameOver && this.gameStarted && !this.isPaused && !this.waveManager.waveActive) {
                    this.startNextWave();
                }
            }, 1500);
        });
    }

    /**
     * Show a short countdown (seconds) then auto-start the first wave.
     * @param {number} seconds
     */
    startCountdown(seconds = 5) {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }

        let remaining = Math.max(1, Math.floor(seconds));
        this.updateWaveInfo(`Starting in ${remaining}...`);
        this.showWaveAnnouncement(`Starting in ${remaining}`);

        this.countdownTimer = setInterval(() => {
            remaining -= 1;
            if (remaining > 0) {
                this.updateWaveInfo(`Starting in ${remaining}...`);
                this.showWaveAnnouncement(`Starting in ${remaining}`);
                return;
            }

            clearInterval(this.countdownTimer);
            this.countdownTimer = null;

            if (this.gameStarted || this.isGameOver) return;

            this.gameStarted = true;
            document.getElementById('btn-start')?.classList.add('hidden');
            document.getElementById('btn-pause')?.classList.remove('hidden');
            this.startNextWave();
            this.lastTime = performance.now();
            requestAnimationFrame(this.loopBound);
        }, 1000);
    }

    bindControls() {
        document.getElementById('btn-start').addEventListener('click', () => {
            // [UC-01 Bắt đầu trò chơi] Bước 1.1.7 -> 1.1.8: Người chơi chọn New Game / nhấn Start.
            // Hệ thống đếm ngược (handled by WaveManager) rồi chuyển sang trạng thái Running.
            if (this.gameStarted || this.isGameOver) return; // Guard clause

            this.gameStarted = true;
            document.getElementById('btn-start').classList.add('hidden');
            document.getElementById('btn-pause').classList.remove('hidden');

            this.startNextWave();
            this.lastTime = performance.now();
            requestAnimationFrame(this.loopBound);
        });

        document.getElementById('btn-next-wave').addEventListener('click', () => {
            if (this.isPaused || this.isGameOver || this.waveManager.waveActive) return;
            this.clearNextWaveTimer();
            this.startNextWave();
        });

        document.getElementById('btn-pause').addEventListener('click', () => {
            // [UC-01 Bắt đầu trò chơi] Bước 1.2.2: Người dùng nhấn Pause.
            // Hệ thống dừng tiến trình game và hiển thị menu (Continue, Save, Exit).
            if (!this.gameStarted || this.isGameOver) return;

            this.isPaused = true;
            document.getElementById('btn-pause').classList.add('hidden');
            document.getElementById('btn-resume').classList.remove('hidden');
            this.updateWaveInfo('Paused. Press Resume to continue.');
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            // [UC-01 Bắt đầu trò chơi] Bước 1.2.2.1: Người dùng nhấn Continue -> hệ thống tiếp tục chạy.
            if (!this.gameStarted || this.isGameOver) return;

            this.isPaused = false;
            document.getElementById('btn-resume').classList.add('hidden');
            document.getElementById('btn-pause').classList.remove('hidden');

            this.lastTime = performance.now();
            requestAnimationFrame(this.loopBound); // Tiếp tục loop
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.clearNextWaveTimer();
            const levelId = this.currentLevelId ?? 1;
            this.setupLevel(levelId);
            this.renderStatic();
            this.log('Game restarted. Ready for a new defense.');
        });

        const backButton = document.getElementById('btn-back-levels');
        backButton?.addEventListener('click', () => {
            // [UC-01 Bắt đầu trò chơi] Bước 1.2.2.3: Người dùng nhấn Exit -> Hệ thống thoát màn chơi và quay về danh sách màn chơi.
            if (!this.isGameOver && this.gameStarted && !confirm('Leave this run and return to level select?')) {
                return;
            }
            document.getElementById('end-modal').classList.add('hidden');
            this.navigation.goToLevelSelect?.(); // Gọi hàm goToLevelSelect() thoát màn chơi
        });

        const modalBackButton = document.getElementById('btn-back-levels-modal');
        modalBackButton?.addEventListener('click', () => {
            document.getElementById('end-modal').classList.add('hidden');
            this.navigation.goToLevelSelect?.();
        });

        const playAgainButton = document.getElementById('btn-play-again');
        playAgainButton?.addEventListener('click', () => {
            this.clearNextWaveTimer();
            const levelId = this.currentLevelId ?? 1;
            this.setupLevel(levelId);
            this.renderStatic();
            document.getElementById('end-modal').classList.add('hidden');
            this.log('Run restarted.');
        });

        document.querySelectorAll('.speed-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.gameSpeed = Number(btn.dataset.speed || 1);
                document.querySelectorAll('.speed-btn').forEach((b) => b.classList.toggle('active', b === btn));
            });
        });
    }
	//4.1.1 luồng chọn tháp để mua/xây, nâng cấp tháp
    bindCanvasInput() {
        this.canvas.addEventListener('mousemove', (e) => {
            const cell = this.mouseToCell(e);
            if (!cell) {
                this.hoverCell = null;
                return;
            }
            this.hoverCell = cell;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoverCell = null;
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.isGameOver || !this.levelManager) return;
            const cell = this.mouseToCell(e);
            if (!cell) return;

            const { col, row } = cell;
            const towerOnCell = this.levelManager.towerAt(col, row);

            // Always allow selecting an existing tower, even during build mode.
            if (towerOnCell) {
                this.selectedTower = towerOnCell;
                this.selectedTowerType = null;
                this.showSelectedTowerInfo();
                return;
            }

            if (this.selectedTowerType) {
                const def = this.towerCatalog.find((t) => t.type === this.selectedTowerType);
                if (!def) return;
                if (this.gold < def.baseCost) {
                    this.log('Not enough gold for this tower.');
                    return;
                }

                const tower = this.levelManager.placeTower(this.selectedTowerType, col, row);
                if (!tower) {
                    this.log('Cannot build on that tile.');
                    return;
                }

                this.gold -= def.baseCost;
                this.updateHUD();
                this.log(`${tower.name} built at (${col}, ${row}).`);
                this.selectedTower = tower;
                this.showSelectedTowerInfo();
            } else {
                this.selectedTower = null;
                this.showSelectedTowerInfo();
            }
        });
    }

    startNextWave() {
        if (this.waveManager.isFinalWave && this.waveManager.currentWave > 0) return;
        this.clearNextWaveTimer();
        this.waveManager.startNextWave();
    }

    clearNextWaveTimer() {
        if (this.nextWaveTimer) {
            clearTimeout(this.nextWaveTimer);
            this.nextWaveTimer = null;
        }
    }

    loop(now) {
        if (this.isPaused || this.isGameOver) {
            this.renderFrame();
            return;
        }

        const dt = Math.min((now - this.lastTime) / 1000, 0.1) * this.gameSpeed;
        this.lastTime = now;

        this.update(dt);
        this.renderFrame();
        this.updateHUD();

        requestAnimationFrame(this.loopBound);
    }

    update(dt) {
        // BƯỚC 1: WaveManager sinh quái và cập nhật trạng thái wave.
        this.waveManager.update(dt);

        // BƯỚC 3: Tháp quét mục tiêu, tạo đạn mới và cập nhật projectiles.
        const newShots = this.levelManager.update(this.waveManager.aliveEnemies, dt);
        if (newShots.length) this.projectiles.push(...newShots);

        for (const p of this.projectiles) p.update(dt);
        this.projectiles = this.projectiles.filter((p) => p.alive);
    }

    renderStatic() {
        this.renderFrame();
    }

    renderFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.levelManager.render(this.ctx);
        this.waveManager.render(this.ctx);
        for (const p of this.projectiles) p.render(this.ctx);

        if (this.hoverCell && this.selectedTowerType) {
            const valid = this.levelManager.isBuildable(this.hoverCell.col, this.hoverCell.row);
            this.levelManager.renderHoverCell(this.ctx, this.hoverCell.col, this.hoverCell.row, valid);
        }

        this.highlightSelectedTower();
    }

    highlightSelectedTower() {
        for (const t of this.levelManager.towers) t.selected = (t === this.selectedTower);
    }

    mouseToCell(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const col = Math.floor(x / CONSTANTS.CELL_SIZE);
        const row = Math.floor(y / CONSTANTS.CELL_SIZE);

        if (col < 0 || row < 0 || col >= CONSTANTS.GRID_COLS || row >= CONSTANTS.GRID_ROWS) {
            return null;
        }
        return { col, row };
    }

    renderTowerShop() {
        const box = document.getElementById('tower-shop');
        box.innerHTML = '';

        this.towerCatalog.forEach((tower) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-ghost btn-full';
            btn.textContent = `${tower.name} - ${tower.baseCost}g`;
            btn.addEventListener('click', () => {
                this.selectedTowerType = tower.type;
                this.selectedTower = null;
                this.showSelectedTowerInfo(`Building mode: ${tower.name}`);
            });
            box.appendChild(btn);
        });
    }

    showSelectedTowerInfo(prefix) {
        const panel = document.getElementById('tower-info');
        if (this.selectedTower) {
            const upgradeDisabled = !this.selectedTower.canUpgrade ? 'disabled' : '';
            const upgradeBtnClass = !this.selectedTower.canUpgrade ? 'btn-disabled' : 'btn-primary';
            const nextUpgradeCost = this.selectedTower.nextUpgradeCost;
            const goldEnough = this.gold >= nextUpgradeCost ? '' : 'disabled';
            const goldEnoughClass = this.gold >= nextUpgradeCost ? 'btn-success' : 'btn-disabled';

            panel.innerHTML = `
                <p><strong>${this.selectedTower.name}</strong></p>
                <p>Level: ${this.selectedTower.level}</p>
                <p>Damage: ${this.selectedTower.damage}</p>
                <p>Range: ${Math.round(this.selectedTower.range)}</p>
                <p>Sell Value: ${this.selectedTower.sellValue}g</p>
                <div class="tower-actions">
                    <button id="btn-upgrade" class="${upgradeBtnClass}" ${upgradeDisabled}>
                        Upgrade (${nextUpgradeCost}g)
                    </button>
                    <button id="btn-delete" class="btn-danger">
                        Sell (${this.selectedTower.sellValue}g)
                    </button>
                </div>
            `;

            // Attach event listeners
            const upgradeBtnEl = document.getElementById('btn-upgrade');
            const deleteBtnEl = document.getElementById('btn-delete');

            if (upgradeBtnEl && !upgradeDisabled) {
                upgradeBtnEl.addEventListener('click', () => this.upgradeTower());
            }

            if (deleteBtnEl) {
                deleteBtnEl.addEventListener('click', () => this.deleteTower());
            }
            return;
        }

        if (prefix) {
            panel.innerHTML = `<p>${prefix}</p><p class="muted">Click on grass tile to place tower.</p>`;
        } else {
            panel.innerHTML = '<p class="muted">Click a placed tower to inspect it.</p>';
        }
    }

    /**
     * Handle tower upgrade button click (local-only in offline mode).
     */
    upgradeTower() {
        if (!this.selectedTower) return;
        if (this.selectedTower.level >= CONSTANTS.MAX_TOWER_LEVEL) {
            this.log('Tower already at max level.');
            return;
        }

        const cost = this.selectedTower.nextUpgradeCost;
        if (this.gold < cost) {
            this.log(`Not enough gold to upgrade. Need ${cost}g, have ${this.gold}g.`);
            return;
        }

        this.selectedTower.upgrade();
        this.gold -= cost;
        this.updateHUD();
        
        this.log(`${this.selectedTower.name} upgraded to level ${this.selectedTower.level}!`);
        this.showSelectedTowerInfo();
    }

    /**
     * Handle tower delete button click (local-only in offline mode).
     */
    deleteTower() {
        if (!this.selectedTower) return;

        const refund = this.selectedTower.sellValue;
        this.gold += refund;
        this.updateHUD();
        
        this.levelManager.removeTower(this.selectedTower);
        
        this.log(`${this.selectedTower.name} sold for ${refund}g!`);
        this.selectedTower = null;
        this.showSelectedTowerInfo();
    }

    showWaveAnnouncement(text) {
        const wrap = document.getElementById('wave-announcement');
        const t = document.getElementById('wave-text');
        t.textContent = text;
        wrap.classList.remove('hidden');
        setTimeout(() => wrap.classList.add('hidden'), 1400);
    }

    updateWaveInfo(text) {
        const box = document.getElementById('wave-info');
        box.innerHTML = `<p>${text}</p>`;
    }

    log(msg) {
        const box = document.getElementById('combat-log');
        const p = document.createElement('p');
        p.textContent = msg;
        box.prepend(p);

        while (box.childElementCount > 10) {
            box.removeChild(box.lastElementChild);
        }
    }

    updateHUD() {
        const wave = this.waveManager ? this.waveManager.currentWave : 0;
        const maxWaves = this.level ? this.level.totalWaves : 10;
        this.ui.updateHUD(this.playerHp, this.gold, wave, maxWaves, this.score);
    }

    gameOver(victory) {
        this.isGameOver = true;
        this.isPaused = false;
        this.clearNextWaveTimer();

        if (victory && this.currentLevelId) {
            this.onLevelCompleted?.(this.currentLevelId);
        }

        const title = document.getElementById('end-title');
        const message = document.getElementById('end-message');
        const icon = document.getElementById('end-icon');
        const wave = document.getElementById('end-wave');
        const score = document.getElementById('end-score');
        const hp = document.getElementById('end-hp');

        title.textContent = victory ? 'Victory!' : 'Defeat';
        message.textContent = victory ? 'You defended the realm!' : 'The realm has fallen...';
        icon.textContent = victory ? '🏆' : '💀';
        wave.textContent = `${this.waveManager.currentWave}`;
        score.textContent = `${this.score}`;
        hp.textContent = `${this.playerHp}`;

        document.getElementById('end-modal').classList.remove('hidden');
        this.updateWaveInfo(victory ? 'All waves cleared.' : 'Your keep was overrun.');
        this.log(victory ? 'Final wave defeated.' : 'Game over.');
    }

    resetControlVisibility() {
        document.getElementById('btn-start').classList.remove('hidden');
        document.getElementById('btn-pause').classList.add('hidden');
        document.getElementById('btn-resume').classList.add('hidden');
        document.getElementById('btn-next-wave').classList.add('hidden');
        document.getElementById('end-modal').classList.add('hidden');
    }
}