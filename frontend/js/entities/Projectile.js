/**
 * Projectile.js
 * A bullet/spell fired by a tower toward a target enemy.
 * Moves toward the enemy's current position each frame (homing).
 */
class Projectile {
    /**
     * @param {number} x          - Start X (tower center)
     * @param {number} y          - Start Y (tower center)
     * @param {Enemy}  target     - The enemy being tracked
     * @param {number} damage     - Raw damage dealt on hit
     * @param {number} speed      - Pixels per second
     * @param {string} color      - Rendering colour
     * @param {string} damageType - 'normal' | 'magic' | 'fire'
     * @param {object} [extras]   - { slow: {factor, duration} }
     */
    constructor(x, y, target, damage, speed, color, damageType = 'normal', extras = {}) {
        this.x          = x;
        this.y          = y;
        this.target     = target;
        this.damage     = damage;
        this.speed      = speed;
        this.color      = color;
        this.damageType = damageType;
        this.extras     = extras;
        this.radius     = damageType === 'normal' ? 4 : 5;
        this.alive      = true;
    }

    /**
     * Move toward the target. Returns true when the projectile hits.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (!this.alive) return false;

        // If target died while projectile was in flight, just remove it
        if (!this.target.alive) {
            this.alive = false;
            return false;
        }

        const dx   = this.target.x - this.x;
        const dy   = this.target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= this.speed * dt + this.radius) {
            // Hit!
            this._applyHit();
            this.alive = false;
            return true;
        }

        // Move toward target
        const ratio = (this.speed * dt) / dist;
        this.x += dx * ratio;
        this.y += dy * ratio;
        return false;
    }

    _applyHit() {
        this.target.takeDamage(this.damage, this.damageType);

        if (this.extras.slow) {
            this.target.applySlow(this.extras.slow.factor, this.extras.slow.duration);
        }
    }

    /**
     * Draw the projectile.
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        if (!this.alive) return;

        // Trail: short motion blur using a semi-transparent line toward target
        if (this.target && this.target.alive) {
            ctx.save();
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = 0.35;
            ctx.lineWidth = this.radius * 1.8;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + (this.target.x - this.x) * 0.15, this.y + (this.target.y - this.y) * 0.15);
            ctx.stroke();
            ctx.restore();
        }

        // Projectile body with subtle radial gradient and glow
        ctx.save();
        const g = ctx.createRadialGradient(this.x - this.radius*0.3, this.y - this.radius*0.3, 1, this.x, this.y, this.radius);
        g.addColorStop(0, 'rgba(255,255,255,0.95)');
        g.addColorStop(0.5, this.color);
        g.addColorStop(1, 'rgba(0,0,0,0.15)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.shadowColor = this.color;
        ctx.shadowBlur  = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}
