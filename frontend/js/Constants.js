/**
 * Constants.js
 * Central configuration: grid, colours, timing, balance.
 * Edit values here to tune gameplay without touching logic.
 */
const CONSTANTS = Object.freeze({

    // ─── Canvas / Grid ─────────────────────────────────────
    CANVAS_WIDTH:   800,
    CANVAS_HEIGHT:  560,
    CELL_SIZE:      40,       // pixels per grid cell
    GRID_COLS:      20,
    GRID_ROWS:      14,

    // ─── Game Balance ──────────────────────────────────────
    STARTING_HP:    20,
    STARTING_GOLD:  150,
    GOLD_PER_WAVE:  30,       // bonus gold at wave start

    // ─── Tower Upgrade Scaling ─────────────────────────────
    UPGRADE_DMG_SCALE:   1.40,   // ×1.40 damage per upgrade level
    UPGRADE_RANGE_SCALE: 1.10,
    UPGRADE_RATE_SCALE:  1.15,
    MAX_TOWER_LEVEL:     3,

    // ─── Enemy Scaling per Wave ────────────────────────────
    ENEMY_HP_SCALE:    1.20,   // ×1.20 HP per wave
    ENEMY_SPEED_SCALE: 1.05,
    ENEMY_COUNT_SCALE: 1.15,

    // ─── Wave Timings ──────────────────────────────────────
    SPAWN_INTERVAL_MS:   800,   // ms between enemy spawns
    BETWEEN_WAVE_MS:    3000,   // break between waves

    // ─── Colours (Canvas rendering) ───────────────────────
    COLOR: {
        PATH:        '#3a3020',
        PATH_BORDER: '#2a2010',
        GRASS:       '#1a2810',
        GRASS_ALT:   '#162210',

        // Tower colours by type
        TOWER_ARCHER: '#4a7a3a',
        TOWER_CANNON: '#6a5a3a',
        TOWER_MAGE:   '#5a3a8a',
        TOWER_ICE:    '#3a7a9a',
        TOWER_FLAME:  '#9a4a2a',

        // Tower range ring
        RANGE_RING: 'rgba(255,255,255,0.12)',
        RANGE_RING_SELECTED: 'rgba(255,220,100,0.20)',

        // Enemy colours by type
        ENEMY_GOBLIN: '#50a030',
        ENEMY_ORC:    '#7a5020',
        ENEMY_TROLL:  '#5a7030',
        ENEMY_WOLF:   '#808090',
        ENEMY_DRAGON: '#c03020',

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
        UI_GOLD:     '#f0c040',
        UI_HP_RED:   '#e04040',
        UI_TEXT:     '#e8dfc8',
    },

    // ─── Path tile indicator ───────────────────────────────
    TILE: {
        GRASS: 0,
        PATH:  1,
        TOWER: 2,
    },
});
