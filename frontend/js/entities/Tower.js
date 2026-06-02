/**
 * TẬP HỢP CÁC CHIẾN THUẬT NGẮM BẮN (STRATEGY PATTERN)
 */
const TargetingStrategies = {
    FIRST: (enemies, tower) => {
        let best = null, bestProg = -Infinity;
        for (const e of enemies) {
            if (!e.alive || e.reached) continue;
            if (tower._distance(e) <= tower.range && e.distanceTravelled > bestProg) {
                bestProg = e.distanceTravelled;
                best = e;
            }
        }
        return best;
    },
    STRONGEST: (enemies, tower) => {
        let best = null, maxHP = -Infinity;
        for (const e of enemies) {
            if (!e.alive || e.reached) continue;
            if (tower._distance(e) <= tower.range && e.hp > maxHP) {
                maxHP = e.hp;
                best = e;
            }
        }
        return best;
    },
    WEAKEST: (enemies, tower) => {
        let best = null, minHP = Infinity;
        for (const e of enemies) {
            if (!e.alive || e.reached) continue;
            if (tower._distance(e) <= tower.range && e.hp < minHP) {
                minHP = e.hp;
                best = e;
            }
        }
        return best;
    }
};

// 1. CLASS CHA (Chứa logic dùng chung)
class BaseTower {
    constructor(def, gridX, gridY) {
        this.id    = BaseTower._nextId++;
        this.type  = def.type;
        this.name  = def.name;
        this.gridX = gridX;
        this.gridY = gridY;

        const cs   = CONSTANTS.CELL_SIZE;
        this.x     = gridX * cs + cs / 2;
        this.y     = gridY * cs + cs / 2;

        this.baseCost    = def.baseCost;
        this.upgradeCost = def.upgradeCost;
        this.sellRatio   = def.sellRatio ?? 0.6;

        this.level      = 1;
        this.damage     = def.baseDamage;
        this.range      = def.baseRange;
        this.fireRate   = def.baseFireRate; 
        
        this.damageType = 'normal'; 
        this.extras     = {};       

        this._fireCooldown = 0;
        this._target       = null;
        
        // Mặc định tháp mới xây sẽ bắn mục tiêu đi xa nhất
        this.targetStrategy = TargetingStrategies.FIRST;

        this.color      = CONSTANTS.COLOR[`TOWER_${this.type}`] || '#607030';
        this.projColor  = CONSTANTS.COLOR[`PROJ_${this.type}`]  || '#ffff88';
        this.selected   = false;
    }

    static _nextId = 0;

    // ─── CÁC HÀM CHỈ SỐ & NÂNG CẤP (Giữ nguyên từ code cũ) ──────────────

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

    upgrade() {
        if (!this.canUpgrade) return;
        this.level++;
        this.damage   = Math.round(this.damage   * CONSTANTS.UPGRADE_DMG_SCALE);
        this.range    *= CONSTANTS.UPGRADE_RANGE_SCALE;
        this.fireRate *= CONSTANTS.UPGRADE_RATE_SCALE;
    }

    // ─── HỆ THỐNG CHIẾN ĐẤU (Đã gắn Strategy Pattern) ─────────────

    // Hàm để UI gọi khi người chơi bấm nút đổi mục tiêu
    setStrategy(strategyName) {
        if (TargetingStrategies[strategyName]) {
            this.targetStrategy = TargetingStrategies[strategyName];
        }
    }

    update(enemies, dt, allTowers = []) {
        this._fireCooldown = Math.max(0, this._fireCooldown - dt);

        if (this._target && (!this._target.alive || this._distance(this._target) > this.range)) {
            this._target = null;
        }

        if (!this._target) {
            this._target = this._pickTarget(enemies);
        }

        if (this._target && this._fireCooldown <= 0) {
            this._fireCooldown = 1 / this.fireRate;
            return this._createProjectile(this._target);
        }

        return null;
    }

    _pickTarget(enemies) {
        // Gọi hàm chiến thuật thay vì dùng if/else hardcode
        return this.targetStrategy(enemies, this);
    }

    _distance(enemy) {
        return Math.hypot(enemy.x - this.x, enemy.y - this.y);
    }

    _createProjectile(target) {
        return new Projectile(
            this.x, this.y,
            target,
            this.damage,
            350,
            this.projColor,
            this.damageType,
            this.extras
        );
    }

    // ─── HỆ THỐNG ĐỒ HỌA & LƯU TRỮ (Giữ nguyên từ code cũ) ─────────

    render(ctx) {
        const cs  = CONSTANTS.CELL_SIZE;
        const pad = 4;
        const x   = this.gridX * cs + pad;
        const y   = this.gridY * cs + pad;
        const s   = cs - pad * 2;

        if (this.selected) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle   = CONSTANTS.COLOR.RANGE_RING_SELECTED;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,220,100,0.5)';
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }

        ctx.fillStyle   = this.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth   = 1.5;
        this._roundRect(ctx, x, y, s, s, 4);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.arc(this.x - (this.level - 1) * 4 + i * 8, this.y + s / 2 - 6, 3, 0, Math.PI * 2);
            ctx.fillStyle = CONSTANTS.COLOR.UI_GOLD;
            ctx.fill();
        }

        ctx.fillStyle    = 'rgba(255,255,255,0.9)';
        ctx.font         = `bold 14px monospace`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type[0], this.x, this.y - 2);

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

    toJSON() {
        return {
            type:  this.type,
            gridX: this.gridX,
            gridY: this.gridY,
            level: this.level,
        };
    }
}