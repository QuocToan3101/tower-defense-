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

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur  = 8;
        ctx.fill();
        ctx.shadowBlur  = 0;
    }
}
