/**
 * WaveManager.js
 * Controls wave sequencing, enemy spawning, and wave-complete detection.
 */
class WaveManager {
    /**
     * @param {object}   levelData    - Level definition (grid, waypoints, totalWaves)
     * @param {object[]} enemyCatalog - Enemy definitions from catalog
     */
    constructor(levelData, enemyCatalog) {
        this.waypoints    = levelData.waypoints;
        this.totalWaves   = levelData.totalWaves;
        this.enemyCatalog = enemyCatalog;   // array of enemy defs keyed by type

        this.currentWave  = 0;
        this.enemies      = [];            // all active (alive + dead) enemies
        this.waveActive   = false;
        this.waveComplete = false;

        this._spawnQueue  = [];            // enemies yet to spawn this wave
        this._spawnTimer  = 0;            // countdown to next spawn
        this._allSpawned  = false;
    }

    // ─── Public API ───────────────────────────────────────

    get aliveEnemies() {
        return this.enemies.filter(e => e.alive && !e.reached);
    }

    get isWaveFinished() {
        return this._allSpawned && this.aliveEnemies.length === 0;
    }

    get isFinalWave() {
        return this.currentWave >= this.totalWaves;
    }

    /** Start the next wave. */
    startNextWave() {
        if (this.isFinalWave) return;
        this.currentWave++;
        this.enemies      = [];
        this.waveActive   = true;
        this.waveComplete = false;
        this._allSpawned  = false;
        this._spawnQueue  = this._buildSpawnQueue(this.currentWave);
        this._spawnTimer  = 0;

        eventBus.emit('wave:started', this.currentWave);
    }

    /**
     * Update spawning and all enemy positions.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (!this.waveActive) return;

        // ── Spawning ────────────────────────────────────
        if (!this._allSpawned) {
            this._spawnTimer -= dt;
            if (this._spawnTimer <= 0 && this._spawnQueue.length > 0) {
                const def = this._spawnQueue.shift();
                this.enemies.push(new Enemy(def, this.waypoints, this.currentWave));
                this._spawnTimer = CONSTANTS.SPAWN_INTERVAL_MS / 1000;
            }
            if (this._spawnQueue.length === 0) {
                this._allSpawned = true;
            }
        }

        // ── Enemy movement ──────────────────────────────
        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        // ── Wave complete check ─────────────────────────
        if (this.isWaveFinished && !this.waveComplete) {
            this.waveComplete = true;
            this.waveActive   = false;
            eventBus.emit('wave:complete', this.currentWave);
        }
    }

    // ─── Wave Composition ─────────────────────────────────

    /**
     * Build the spawn queue for the given wave.
     * Enemy count and variety scale with wave number.
     */
    _buildSpawnQueue(wave) {
        const queue = [];
        const catalog = this._catalogMap();
        const entry = WAVE_COMPOSITIONS.find(([waveNumber]) => waveNumber === wave)
            || WAVE_COMPOSITIONS[WAVE_COMPOSITIONS.length - 1];
        const groups = entry[1];

        for (const [type, count] of groups) {
            const def = catalog[type];
            if (!def) continue;
            const scaledCount = Math.round(count * Math.pow(CONSTANTS.ENEMY_COUNT_SCALE, wave - 1));
            for (let i = 0; i < scaledCount; i++) {
                queue.push(def);
            }
        }

        // Shuffle for variety
        for (let i = queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queue[i], queue[j]] = [queue[j], queue[i]];
        }

        return queue;
    }

    /** Build a type→def lookup from the catalog array. */
    _catalogMap() {
        const map = Object.create(null);
        for (const def of this.enemyCatalog) map[def.type] = def;
        return map;
    }

    render(ctx) {
        for (const enemy of this.enemies) {
            enemy.render(ctx);
        }
    }
}

const WAVE_COMPOSITIONS = Object.freeze([
    [1, [['GOBLIN', 8]]],
    [2, [['GOBLIN', 10], ['ORC', 2]]],
    [3, [['GOBLIN', 8], ['ORC', 4]]],
    [4, [['GOBLIN', 6], ['ORC', 4], ['WOLF', 4]]],
    // ✓ REBALANCED: Softer early waves for new player friendliness
    [1, [['GOBLIN', 6]]],                    // was 8 - pure intro
    [2, [['GOBLIN', 7], ['ORC', 1]]],        // was 10+2 - gentle Orc intro
    [3, [['GOBLIN', 6], ['ORC', 2]]],        // was 8+4 - gradual difficulty
    [4, [['GOBLIN', 5], ['ORC', 3], ['WOLF', 2]]],  // was 6+4+4 - fewer Wolves
    [5, [['GOBLIN', 8], ['WOLF', 6], ['ORC', 4]]],
    [6, [['ORC', 6], ['WOLF', 8], ['GOBLIN', 6]]],
    [7, [['ORC', 8], ['TROLL', 2], ['WOLF', 6]]],
    [8, [['TROLL', 4], ['ORC', 8], ['WOLF', 4]]],
    [9, [['TROLL', 6], ['ORC', 6], ['GOBLIN', 10]]],
    [10, [['DRAGON', 1], ['TROLL', 4], ['ORC', 6], ['GOBLIN', 8]]],
]);
