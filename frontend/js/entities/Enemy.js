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
                    console.log('[Enemy] reached exit:', this.name, 'id=', this.id);
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
        console.log('[Enemy] takeDamage', this.name, 'raw=', rawDamage, 'final=', finalDamage, 'hp=', this.hp);

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

        // Enemy body — gradient + soft rim for a modern look
        ctx.save();
        const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.4, radius * 0.1, x, y, radius);
        grad.addColorStop(0, this._lighten(this.color, 0.25));
        grad.addColorStop(0.6, this.color);
        grad.addColorStop(1, this._darken(this.color, 0.15));

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Soft shadow / rim
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ctx.restore();

        // Type icon (first letter) with subtle shadow
        ctx.save();
        ctx.fillStyle   = 'rgba(255,255,255,0.95)';
        ctx.font        = `bold ${Math.round(radius * 0.9)}px monospace`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur  = 2;
        ctx.fillText(this.type[0], x, y);
        ctx.restore();

        // HP bar
        this._renderHpBar(ctx);
    }

    _renderHpBar(ctx) {
        const barW  = this.radius * 2.2;
        const barH  = 4;
        const barX  = this.x - barW / 2;
        const barY  = this.y - this.radius - 8;
        const ratio = this.hp / this.maxHp;

        // Rounded HP bar background
        ctx.save();
        const r = 3;
        ctx.fillStyle = CONSTANTS.COLOR.HP_BG;
        this._roundRect(ctx, barX, barY, barW, barH, r);
        ctx.fill();

        // Foreground (colour shifts with HP %)
        let barColor = CONSTANTS.COLOR.HP_FULL;
        if (ratio < 0.6) barColor = CONSTANTS.COLOR.HP_MID;
        if (ratio < 0.3) barColor = CONSTANTS.COLOR.HP_LOW;

        ctx.fillStyle = barColor;
        this._roundRect(ctx, barX, barY, barW * ratio, barH, r);
        ctx.fill();
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

    _lighten(hex, amount) {
        const c = this._hexToRgb(hex);
        return `rgba(${Math.min(255, c.r + amount*255)}, ${Math.min(255, c.g + amount*255)}, ${Math.min(255, c.b + amount*255)}, 1)`;
    }

    _darken(hex, amount) {
        const c = this._hexToRgb(hex);
        return `rgba(${Math.max(0, c.r - amount*255)}, ${Math.max(0, c.g - amount*255)}, ${Math.max(0, c.b - amount*255)}, 1)`;
    }

    _hexToRgb(hex) {
        const h = hex.replace('#','');
        const bigint = parseInt(h, 16);
        if (h.length === 6) {
            return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
        }
        // fallback
        return { r: 160, g: 160, b: 160 };
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
