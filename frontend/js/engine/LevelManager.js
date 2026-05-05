/**
 * LevelManager.js
 * Manages the game map grid, tower placement/removal, and map rendering.
 */
class LevelManager {
    /**
     * @param {object}   levelData     - Level definition (grid, waypoints)
     * @param {object[]} towerCatalog  - Tower definitions from backend
     */
    constructor(levelData, towerCatalog) {
        this.levelData = levelData;
        this.grid = levelData.grid;
        this.waypoints = levelData.waypoints;
        this.towerCatalog = towerCatalog;
        this.towers = [];

        this._towerGrid = Object.create(null);
    }

    _cellKey(col, row) {
        return `${col},${row}`;
    }

    // ─── Grid Queries ─────────────────────────────────────

    isPath(col, row) {
        const row_ = this.grid[row];
        return row_ ? row_[col] === CONSTANTS.TILE.PATH : false;
    }

    hasTower(col, row) {
        return !!this._towerGrid[this._cellKey(col, row)];
    }

    isBuildable(col, row) {
        return !this.isPath(col, row) && !this.hasTower(col, row);
    }

    towerAt(col, row) {
        return this._towerGrid[this._cellKey(col, row)] || null;
    }

    // ─── Tower Placement ──────────────────────────────────

    /**
     * Place a tower if the cell is buildable.
     * @param {string} towerType - Catalog type key
     * @param {number} col
     * @param {number} row
     * @returns {Tower|null}     - The placed tower, or null if invalid
     */
    placeTower(towerType, col, row) {
        if (!this.isBuildable(col, row)) return null;

        const def = this.towerCatalog.find(t => t.type === towerType);
        if (!def) return null;

        const tower = new Tower(def, col, row);
        this.towers.push(tower);
        this._towerGrid[this._cellKey(col, row)] = tower;
        return tower;
    }

    /**
     * Remove (sell) a tower from the map.
     * @param {Tower} tower
     */
    removeTower(tower) {
        this.towers = this.towers.filter(t => t !== tower);
        delete this._towerGrid[this._cellKey(tower.gridX, tower.gridY)];
    }

    /**
     * Restore towers from a save game (towersJson).
     * @param {Array} savedTowers - [{type, gridX, gridY, level}, ...]
     */
    restoreTowers(savedTowers) {
        this.towers = [];
        this._towerGrid = {};

        for (const saved of savedTowers) {
            const t = this.placeTower(saved.type, saved.gridX, saved.gridY);
            if (t) {
                // Reapply upgrade levels
                for (let l = 1; l < saved.level; l++) t.upgrade();
            }
        }
    }

    // ─── Update / Render ──────────────────────────────────

    /**
     * Update all towers, collecting new projectiles.
     * @param {Enemy[]} enemies
     * @param {number}  dt
     * @returns {Projectile[]} - New projectiles fired this frame
     */
    update(enemies, dt) {
        const newProjectiles = [];
        for (const tower of this.towers) {
            const proj = tower.update(enemies, dt);
            if (proj) newProjectiles.push(proj);
        }
        return newProjectiles;
    }

    /**
     * Draw the map grid, then all towers.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        this._renderGrid(ctx);
        for (const tower of this.towers) {
            tower.render(ctx);
        }
    }

    _renderGrid(ctx) {
        const cs   = CONSTANTS.CELL_SIZE;
        const rows = this.grid.length;
        const cols = this.grid[0].length;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const isPath = this.grid[row][col] === CONSTANTS.TILE.PATH;
                const x      = col * cs;
                const y      = row * cs;

                if (isPath) {
                    ctx.fillStyle = CONSTANTS.COLOR.PATH;
                } else {
                    // Checker-pattern grass for visual interest
                    ctx.fillStyle = ((row + col) % 2 === 0)
                        ? CONSTANTS.COLOR.GRASS
                        : CONSTANTS.COLOR.GRASS_ALT;
                }
                ctx.fillRect(x, y, cs, cs);

                // Subtle grid lines on grass only
                if (!isPath) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                    ctx.lineWidth   = 0.5;
                    ctx.strokeRect(x, y, cs, cs);
                }
            }
        }

        // Path border lines
        ctx.strokeStyle = CONSTANTS.COLOR.PATH_BORDER;
        ctx.lineWidth   = 1;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (this.grid[row][col] === CONSTANTS.TILE.PATH) {
                    ctx.strokeRect(col * cs, row * cs, cs, cs);
                }
            }
        }

        // Draw entry/exit arrows
        this._renderEntryExit(ctx);
    }

    _renderEntryExit(ctx) {
        const cs   = CONSTANTS.CELL_SIZE;
        const wp   = this.waypoints;
        const last = wp[wp.length - 1];

        // Entry label
        ctx.fillStyle    = 'rgba(255,200,50,0.8)';
        ctx.font         = 'bold 10px monospace';
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('▶ IN',  4, wp[0].y);

        // Exit label
        ctx.textAlign = 'right';
        ctx.fillText('EXIT ▶', CONSTANTS.CANVAS_WIDTH - 4, last.y);
    }

    // ─── Hover Cell Highlight ──────────────────────────────

    /**
     * Draws a placement preview highlight for mouse hover.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} col
     * @param {number} row
     * @param {boolean} valid - true = green, false = red
     */
    renderHoverCell(ctx, col, row, valid) {
        const cs = CONSTANTS.CELL_SIZE;
        ctx.fillStyle   = valid ? 'rgba(80,180,80,0.25)' : 'rgba(180,60,60,0.25)';
        ctx.strokeStyle = valid ? 'rgba(80,200,80,0.7)'  : 'rgba(200,60,60,0.7)';
        ctx.lineWidth   = 1.5;
        ctx.fillRect(col * cs, row * cs, cs, cs);
        ctx.strokeRect(col * cs, row * cs, cs, cs);
    }
}
