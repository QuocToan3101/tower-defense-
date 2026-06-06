/**
 * Constants.js
 * Central configuration: grid, colours, timing, balance.
 * Edit values here to tune gameplay without touching logic.
 * 
 * REBALANCED May 2026 for new player friendliness
 * See GameBalanceConfig.js for detailed game design analysis
 */
const CONSTANTS = Object.freeze({

    // ─── Canvas / Grid ─────────────────────────────────────
    CANVAS_WIDTH:   800,
    CANVAS_HEIGHT:  560,
    CELL_SIZE:      40,       // pixels per grid cell
    GRID_COLS:      20,
    GRID_ROWS:      14,

    // ─── Game Balance (REBALANCED for new players) ─────────
    STARTING_HP:    32,         // tuned: still forgiving, less over-safe early game
    STARTING_GOLD:  380,        // tuned: enough for flexible openings without snowballing
    GOLD_PER_WAVE:  45,         // tuned: steadier economy progression

    // ─── Tower Upgrade Scaling ─────────────────────────────
    UPGRADE_DMG_SCALE:   1.25,  // was 1.40 - smoother progression per level
    UPGRADE_RANGE_SCALE: 1.08,  // was 1.10
    UPGRADE_RATE_SCALE:  1.12,  // was 1.15
    MAX_TOWER_LEVEL:     5,     // was 3 - more upgrade progression feeling

    // ─── Enemy Scaling per Wave ────────────────────────────
    ENEMY_HP_SCALE:    1.05,    // reduced further to soften mid/late-game HP scaling
    ENEMY_SPEED_SCALE: 1.04,    // was 1.05
    ENEMY_COUNT_SCALE: 1.10,    // tuned: smoother pacing after restoring full enemy roster

    // ─── Wave Timings ──────────────────────────────────────
    SPAWN_INTERVAL_MS:   1100,  // tuned: keeps pressure while preserving reaction time
    BETWEEN_WAVE_MS:    3000,   // break between waves

    // ─── Colours (Canvas rendering) ───────────────────────
    COLOR: {
        // Map palette (warmer, richer greens)
        PATH:        '#6b4f2b',
        PATH_BORDER: '#4b3518',
        GRASS:       '#2b6f3a',
        GRASS_ALT:   '#235a2e',

        // Map background gradient (subtle vignette)
        MAP_SKY_TOP:    '#081e12',
        MAP_SKY_BOTTOM: '#072012',

        // Tower colours by type
        TOWER_ARCHER: '#3d7b3f',
        TOWER_CANNON: '#6b4e3a',
        TOWER_MAGE:   '#5a3a8a',
        TOWER_ICE:    '#3a8aa0',
        TOWER_FLAME:  '#b2502a',

        // Tower range ring
        RANGE_RING: 'rgba(255,255,255,0.12)',
        RANGE_RING_SELECTED: 'rgba(255,220,100,0.20)',

        // Enemy colours by type
        ENEMY_GOBLIN: '#5db13a',
        ENEMY_ORC:    '#7a5020',
        ENEMY_TROLL:  '#567033',
        ENEMY_WOLF:   '#7f7f8f',
        ENEMY_DRAGON: '#c23a28',

        // HP bar
        HP_FULL:    '#40d040',
        HP_MID:     '#d0d040',
        HP_LOW:     '#d04040',
        HP_BG:      'rgba(0,0,0,0.6)',

        // Projectile colours by tower type
        PROJ_ARCHER: '#ffee55',
        PROJ_CANNON: '#ff8820',
        PROJ_MAGE:   '#cc66ff',
        PROJ_ICE:    '#88ddff',
        PROJ_FLAME:  '#ff5510',

        // UI
        UI_GOLD:     '#f4d67a',
        UI_HP_RED:   '#e05050',
        UI_TEXT:     '#f7f5ee',
    },

    // ─── Path tile indicator ───────────────────────────────
    TILE: {
        GRASS: 0,
        PATH:  1,
        TOWER: 2,
    },
});

