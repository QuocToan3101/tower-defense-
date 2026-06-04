/**
 * LevelManager.js
 * Manages the game map grid, tower placement/removal, and map rendering.
 */
class LevelManager {
    /**
     * @param {object}   levelData     - Level definition (grid, waypoints)
     * @param {object[]} towerCatalog  - Tower definitions from catalog
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

        const newTower = TowerFactory.create(towerDef, gridX, gridY);
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

        // Background gradient for subtle depth
        const bg = ctx.createLinearGradient(0, 0, 0, CONSTANTS.CANVAS_HEIGHT);
        bg.addColorStop(0, CONSTANTS.COLOR.MAP_SKY_TOP || '#081e12');
        bg.addColorStop(1, CONSTANTS.COLOR.MAP_SKY_BOTTOM || '#072012');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const isPath = this.grid[row][col] === CONSTANTS.TILE.PATH;
                const x      = col * cs;
                const y      = row * cs;

                if (isPath) {
                    // Path gradient to suggest dirt with variation
                    const pGrad = ctx.createLinearGradient(x, y, x + cs, y + cs);
                    pGrad.addColorStop(0, '#8b6a3a');
                    pGrad.addColorStop(0.6, CONSTANTS.COLOR.PATH);
                    pGrad.addColorStop(1, CONSTANTS.COLOR.PATH_BORDER);
                    ctx.fillStyle = pGrad;
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
                } else {
                    // Slight inner bevel on path tiles
                    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
                    ctx.lineWidth   = 1;
                    ctx.strokeRect(x + 1, y + 1, cs - 2, cs - 2);
                }
            }
        }

        // Path border lines (stronger outline)
        ctx.strokeStyle = CONSTANTS.COLOR.PATH_BORDER;
        ctx.lineWidth   = 1;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (this.grid[row][col] === CONSTANTS.TILE.PATH) {
                    ctx.strokeRect(col * cs, row * cs, cs, cs);
                }
            }
        }

        // Draw entry/exit arrows with pill backgrounds
        this._renderEntryExit(ctx);
    }

    _renderEntryExit(ctx) {
        const cs   = CONSTANTS.CELL_SIZE;
        const wp   = this.waypoints;
        const last = wp[wp.length - 1];
        // Entry label (pill)
        ctx.save();
        const pad = 6;
        const w = 56, h = 20;
        const ex = 6, ey = wp[0].y - h / 2;
        ctx.fillStyle = 'rgba(255,206,90,0.95)';
        this._roundRect(ctx, ex, ey, w, h, 6);
        ctx.fill();
        ctx.fillStyle = '#2b2b1f';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('▶ IN', ex + pad, wp[0].y);

        // Exit label
        const ex2w = 70;
        const ex2 = CONSTANTS.CANVAS_WIDTH - ex2w - 6;
        const ey2 = last.y - h / 2;
        ctx.fillStyle = 'rgba(255,206,90,0.95)';
        this._roundRect(ctx, ex2, ey2, ex2w, h, 6);
        ctx.fill();
        ctx.fillStyle = '#2b2b1f';
        ctx.textAlign = 'right';
        ctx.fillText('EXIT ▶', ex2 + ex2w - pad, last.y);
        ctx.restore();
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
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
