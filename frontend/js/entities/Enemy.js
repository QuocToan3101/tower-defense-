/**
 * Enemy.js
 * Represents a single enemy unit moving along the path.
 * Handles movement, damage, health bar rendering, and death.
 */
class Enemy {
    /**
     * @param {object} def       - Enemy definition from catalog
     * @param {Array}  waypoints - Array of {x,y} path waypoints
     * @param {number} wave      - Current wave number (for scaling)
     */
    constructor(def, waypoints, wave) {
        this.id   = Enemy._nextId++;
        this.type = def.type;
        this.name = def.name;

        // ─── Stats (scaled by wave) ──────────────────────
        const waveScaling = Math.pow(CONSTANTS.ENEMY_HP_SCALE, wave - 1);
        this.maxHp  = Math.round(def.baseHp * waveScaling);
        this.hp     = this.maxHp;
        this.speed  = def.baseSpeed * Math.pow(CONSTANTS.ENEMY_SPEED_SCALE, wave - 1);
        this.armor  = def.armor;                    // 0.0–1.0 damage reduction

        this.goldReward      = def.goldReward;
        this.damageToPlayer  = def.damageToPlayer;

        // ─── Path Navigation ─────────────────────────────
        this.waypoints        = waypoints;
        this.waypointIndex    = 0;
        this.x                = waypoints[0].x;
        this.y                = waypoints[0].y;

        // ─── Status Effects ───────────────────────────────
        this.slowFactor       = 1.0;     // 1.0 = normal speed
        this.slowTimer        = 0;

        // ─── Rendering ────────────────────────────────────
        this.radius = 14;
        this.color  = CONSTANTS.COLOR[`ENEMY_${this.type}`] || '#888888';

        // ─── State ────────────────────────────────────────
        this.alive    = true;
        this.reached  = false;    // true when enemy reached the exit
        this.distanceTravelled = 0;  // used for Z-sorting & progress bar
    }

    /** Unique ID counter across all enemy instances. */
    static _nextId = 0;

    // ─── Update (called each frame) ───────────────────────

    /**
     * Move the enemy toward the next waypoint.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (!this.alive || this.reached) return;

        // Tick slow effect
        if (this.slowTimer > 0) {
            this.slowTimer -= dt;
            if (this.slowTimer <= 0) this.slowFactor = 1.0;
        }

        const effectiveSpeed = this.speed * this.slowFactor * CONSTANTS.CELL_SIZE;
        let remainingMove     = effectiveSpeed * dt;

        while (remainingMove > 0 && this.waypointIndex < this.waypoints.length) {
            const target = this.waypoints[this.waypointIndex];
            const dx     = target.x - this.x;
            const dy     = target.y - this.y;
            const dist   = Math.hypot(dx, dy);

            if (dist <= remainingMove) {
                // Arrived at this waypoint
                this.x = target.x;
                this.y = target.y;
                this.distanceTravelled += dist;
                remainingMove -= dist;
                this.waypointIndex++;

                if (this.waypointIndex >= this.waypoints.length) {
                    // Enemy reached the exit
                    this.reached = true;
                    eventBus.emit('enemy:reached', this);
                    return;
                }
            } else {
                // Move partial distance toward next waypoint
                const ratio = remainingMove / dist;
                this.x += dx * ratio;
                this.y += dy * ratio;
                this.distanceTravelled += remainingMove;
                remainingMove = 0;
            }
        }
    }

    // ─── Combat ───────────────────────────────────────────

    /**
     * Apply incoming damage, factoring in armor.
     * @param {number} rawDamage
     * @param {string} [damageType] - 'normal' | 'magic' | 'fire'
     */
    takeDamage(rawDamage, damageType = 'normal') {
        if (!this.alive) return;

        // Magic damage ignores armor
        const armorReduction = (damageType === 'magic') ? 0 : this.armor;
        const finalDamage    = Math.max(1, Math.round(rawDamage * (1 - armorReduction)));

        this.hp -= finalDamage;

        if (this.hp <= 0) {
            this.hp    = 0;
            this.alive = false;
            eventBus.emit('enemy:killed', this);
        }
    }

    /**
     * Apply a slow effect.
     * @param {number} factor    - Speed multiplier (e.g. 0.6 = 40% slow)
     * @param {number} duration  - Duration in seconds
     */
    applySlow(factor, duration) {
        this.slowFactor = Math.min(this.slowFactor, factor);
        this.slowTimer  = Math.max(this.slowTimer,  duration);
    }

    // ─── Rendering ────────────────────────────────────────

    /**
     * Draw the enemy and its HP bar on the canvas.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (!this.alive || this.reached) return;

        const { x, y, radius } = this;

        // Slow-tint overlay
        if (this.slowTimer > 0) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.fillStyle   = CONSTANTS.COLOR.PROJ_ICE;
            ctx.beginPath();
            ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Enemy body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.6)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Type icon (first letter)
        ctx.fillStyle   = 'rgba(255,255,255,0.85)';
        ctx.font        = `bold ${Math.round(radius * 0.9)}px monospace`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type[0], x, y);

        // HP bar
        this._renderHpBar(ctx);
    }

    _renderHpBar(ctx) {
        const barW  = this.radius * 2.2;
        const barH  = 4;
        const barX  = this.x - barW / 2;
        const barY  = this.y - this.radius - 8;
        const ratio = this.hp / this.maxHp;

        // Background
        ctx.fillStyle = CONSTANTS.COLOR.HP_BG;
        ctx.fillRect(barX, barY, barW, barH);

        // Foreground (colour shifts with HP %)
        let barColor = CONSTANTS.COLOR.HP_FULL;
        if (ratio < 0.6) barColor = CONSTANTS.COLOR.HP_MID;
        if (ratio < 0.3) barColor = CONSTANTS.COLOR.HP_LOW;

        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barW * ratio, barH);
    }

    /** Serialise to JSON (for save system). */
    toJSON() {
        return {
            type: this.type,
            hp:   this.hp,
            x:    this.x,
            y:    this.y,
            waypointIndex: this.waypointIndex,
        };
    }
}
