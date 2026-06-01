/**
 * TowerTypes.js
 * * [BÁO CÁO COMMIT TUẦN NÀY]
 * Áp dụng tính Kế thừa (Inheritance) và Đa hình (Polymorphism) để loại bỏ 
 * các vòng lặp if/else hardcode. Mỗi loại tháp sẽ tự định nghĩa logic 
 * tạo đạn và hiệu ứng của riêng nó.
 */

// 1. CLASS CHA (Chứa logic dùng chung như Mua bán, Nâng cấp, Vẽ hình)
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
        
        // CÁC THÔNG SỐ NÀY SẼ DO CLASS CON TỰ ĐỊNH NGHĨA
        this.damageType = 'normal'; 
        this.extras     = {};       

        this._fireCooldown = 0;
        this._target       = null;

        this.color      = CONSTANTS.COLOR[`TOWER_${this.type}`] || '#607030';
        this.projColor  = CONSTANTS.COLOR[`PROJ_${this.type}`]  || '#ffff88';
        this.selected   = false;
    }

    static _nextId = 0;

    // ... (Giữ nguyên các hàm get totalInvested, sellValue, canUpgrade, upgrade...)
    // ... (Giữ nguyên hàm update(), _pickTarget(), _distance(), render(), _roundRect()...)

    /**
     * HÀM NÀY SẼ BỊ GHI ĐÈ (OVERRIDE) BỞI CÁC CLASS CON
     * Tính Đa hình được thể hiện ở đây.
     */
    _createProjectile(target) {
        return new Projectile(
            this.x, this.y,
            target,
            this.damage,
            350, // speed
            this.projColor,
            this.damageType,
            this.extras
        );
    }
}

// 2. CÁC CLASS CON (Định nghĩa tính chất riêng biệt)

/** Tháp Băng: Khai báo sẵn hiệu ứng làm chậm */
class FrostTower extends BaseTower {
    constructor(def, gridX, gridY) {
        super(def, gridX, gridY);
        this.damageType = 'magic';
        this.extras = { slow: { factor: 0.6, duration: 2.0 } };
        // Có thể đổi màu tháp hoặc màu đạn riêng tại đây nếu thích
    }

    // FrostTower dùng đạn bình thường nhưng có hiệu ứng slow, 
    // nên không cần ghi đè _createProjectile, nó sẽ tự dùng của BaseTower.
}

/** Tháp Pháo (AoE): Gây sát thương lan */
class SplashTower extends BaseTower {
    constructor(def, gridX, gridY) {
        super(def, gridX, gridY);
        this.damageType = 'fire';
        this.splashRadius = 75; // Bán kính nổ
    }

    // Ghi đè hàm tạo đạn để sinh ra loại đạn nổ (SplashProjectile)
    _createProjectile(target) {
        // Giả sử sau này bạn sẽ viết thêm class SplashProjectile 
        // có khả năng gây sát thương diện rộng khi chạm mục tiêu
        return new SplashProjectile(
            this.x, this.y,
            target,
            this.damage,
            250, // Đạn pháo bay chậm hơn đạn thường
            this.projColor,
            this.damageType,
            this.splashRadius 
        );
    }
}

/** * [QUAN TRỌNG] Pattern Factory:
 * Thay vì gọi `new Tower(...)` ở chỗ đặt tháp, hệ thống sẽ gọi Factory này
 * để nó tự quyết định sinh ra class con nào.
 */
class TowerFactory {
    static create(def, gridX, gridY) {
        switch (def.type) {
            case 'ICE':
                return new FrostTower(def, gridX, gridY);
            case 'FLAME': // Giả sử FLAME là tháp bắn pháo AoE
                return new SplashTower(def, gridX, gridY);
            default:
                return new BaseTower(def, gridX, gridY);
        }
    }
}