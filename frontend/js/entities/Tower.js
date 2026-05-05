/**
 * Tower.js
 * Represents a placed tower.
 * Handles targeting, shooting, upgrading, selling, and rendering.
 */
class Tower {
    /**
     * @param {object} def    - Catalog definition (from backend or local fallback)
     * @param {number} gridX  - Grid column
     * @param {number} gridY  - Grid row
     */
    constructor(def, gridX, gridY) {
        this.id    = Tower._nextId++;
        this.type  = def.type;
        this.name  = def.name;
        this.gridX = gridX;
        this.gridY = gridY;

        // Pixel centre of the cell
        const cs  = CONSTANTS.CELL_SIZE;
        this.x    = gridX * cs + cs / 2;
        this.y    = gridY * cs + cs / 2;

        // ─── Base Stats ───────────────────────────────────
        this.baseCost    = def.baseCost;
        this.upgradeCost = def.upgradeCost;
        this.sellRatio   = def.sellRatio ?? 0.6;

        this.level       = 1;
        this.damage      = def.baseDamage;
        this.range       = def.baseRange;
        this.fireRate    = def.baseFireRate;  // attacks per second
        this.damageType  = Tower._damageType(def.type);
        this.extras      = Tower._extras(def.type);

        // ─── Attack State ─────────────────────────────────
        this._fireCooldown = 0;  // seconds until next shot
        this._target       = null;

        // ─── Rendering ────────────────────────────────────
        this.color         = CONSTANTS.COLOR[`TOWER_${this.type}`] || '#607030';
        this.projColor     = CONSTANTS.COLOR[`PROJ_${this.type}`]  || '#ffff88';
        this.selected      = false;

        /** Projectiles created by this tower, managed by GameManager */
        this.projectiles   = [];
    }

    static _nextId = 0;

    // ─── Static helpers ───────────────────────────────────

    static _damageType(type) {
        if (type === 'MAGE')  return 'magic';
        if (type === 'FLAME') return 'fire';
        return 'normal';
    }

    static _extras(type) {
        if (type === 'ICE')   return { slow: { factor: 0.6, duration: 2.0 } };
        return {};
    }

    // ─── Computed Properties ──────────────────────────────

    get totalInvested() {
        let cost = this.baseCost;
        for (let l = 1; l < this.level; l++) cost += this.upgradeCost * l;
        return cost;
    }

    get sellValue() {
        return Math.floor(this.totalInvested * this.sellRatio);
    }

    get canUpgrade() {
        return this.level < CONSTANTS.MAX_TOWER_LEVEL;
    }

    get nextUpgradeCost() {
        return this.upgradeCost * this.level;
    }

    // ─── Upgrade / Sell ──────────────────────────────────

    upgrade() {
        if (!this.canUpgrade) return;
        this.level++;
        this.damage   = Math.round(this.damage   * CONSTANTS.UPGRADE_DMG_SCALE);
        this.range    *= CONSTANTS.UPGRADE_RANGE_SCALE;
        this.fireRate *= CONSTANTS.UPGRADE_RATE_SCALE;
    }

    // ─── Combat ───────────────────────────────────────────

    /**
     * Per-frame update: find target and shoot.
     * @param {Enemy[]} enemies   - Active enemy array
     * @param {number}  dt        - Delta time in seconds
     * @returns {Projectile|null} - New projectile if fired this frame
     */
    update(enemies, dt) {
        this._fireCooldown = Math.max(0, this._fireCooldown - dt);

        // Validate current target (alive and in range)
        if (this._target && (!this._target.alive || this._distance(this._target) > this.range)) {
            this._target = null;
        }

        // Pick new target: enemy furthest along the path (closest to exit)
        if (!this._target) {
            this._target = this._pickTarget(enemies);
        }

        // Fire if cooled down
        if (this._target && this._fireCooldown <= 0) {
            this._fireCooldown = 1 / this.fireRate;
            return this._createProjectile(this._target);
        }

        return null;
    }

    _pickTarget(enemies) {
        let best     = null;
        let bestDist = Infinity;   // we use distanceTravelled for "furthest along path"
        let bestProg = -Infinity;

        for (const e of enemies) {
            if (!e.alive || e.reached) continue;
            const d = this._distance(e);
            if (d <= this.range && e.distanceTravelled > bestProg) {
                bestProg = e.distanceTravelled;
                best     = e;
            }
        }
        return best;
    }

    _distance(enemy) {
        return Math.hypot(enemy.x - this.x, enemy.y - this.y);
    }

    _createProjectile(target) {
        return new Projectile(
            this.x, this.y,
            target,
            this.damage,
            /* speed px/s */ 350,
            this.projColor,
            this.damageType,
            this.extras,
        );
    }

    // ─── Rendering ────────────────────────────────────────

    /**
     * Draw the tower on the canvas.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        const cs  = CONSTANTS.CELL_SIZE;
        const pad = 4;
        const x   = this.gridX * cs + pad;
        const y   = this.gridY * cs + pad;
        const s   = cs - pad * 2;

        // Range ring (always or on select)
        if (this.selected) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle   = CONSTANTS.COLOR.RANGE_RING_SELECTED;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,220,100,0.5)';
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }

        // Tower base (rounded rect)
        ctx.fillStyle   = this.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth   = 1.5;
        this._roundRect(ctx, x, y, s, s, 4);
        ctx.fill();
        ctx.stroke();

        // Level indicator dots
        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.arc(this.x - (this.level - 1) * 4 + i * 8, this.y + s / 2 - 6, 3, 0, Math.PI * 2);
            ctx.fillStyle = CONSTANTS.COLOR.UI_GOLD;
            ctx.fill();
        }

        // Type letter
        ctx.fillStyle    = 'rgba(255,255,255,0.9)';
        ctx.font         = `bold 14px monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type[0], this.x, this.y - 2);

        // Upgrade glow if selected
        if (this.selected) {
            ctx.strokeStyle = CONSTANTS.COLOR.UI_GOLD;
            ctx.lineWidth   = 2;
            this._roundRect(ctx, x - 1, y - 1, s + 2, s + 2, 5);
            ctx.stroke();
        }
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

    // ─── Server Sync (Upgrade/Delete via API) ──────────────

    /**
     * Call backend API to upgrade this tower.
     * Backend validates and returns new stats.
     * On success, updates local tower state.
     * 
     * @param {Long} catalogTowerId - Tower catalog ID (from definition)
     * @returns {Promise<TowerUpgradeResponse>}
     */
    async upgradeAsync(catalogTowerId) {
        if (!this.canUpgrade) {
            throw new Error('Tower already at max level');
        }

        try {
            const res = await api.upgradeTower(catalogTowerId, this.level);
            if (!res.success) {
                throw new Error(res.message || 'Upgrade failed');
            }

            // Update tower stats with response from backend
            const data = res.data;
            this.level    = data.newLevel;
            this.damage   = data.newDamage;
            this.range    = data.newRange;
            this.fireRate = data.newFireRate;
            return data;
        } catch (err) {
            console.error(`Failed to upgrade tower:`, err);
            throw err;
        }
    }

    /**
     * Call backend API to delete/sell this tower.
     * Returns refund amount.
     * 
     * @param {Long} catalogTowerId - Tower catalog ID (from definition)
     * @returns {Promise<TowerDeleteResponse>}
     */
    async deleteAsync(catalogTowerId) {
        try {
            const res = await api.deleteTower(catalogTowerId, this.level);
            if (!res.success) {
                throw new Error(res.message || 'Delete failed');
            }

            const data = res.data;
            return data;
        } catch (err) {
            console.error(`Failed to delete tower:`, err);
            throw err;
        }
    }

    /** Serialise for save system. */
    toJSON() {
        return {
            type:  this.type,
            gridX: this.gridX,
            gridY: this.gridY,
            level: this.level,
        };
    }
}
