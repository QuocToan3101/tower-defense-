export class ProjectilePool {
    constructor(initialSize = 100) {
        this.pool = [];
        // Khởi tạo sẵn một lượng đạn "chết" (active = false)
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createEmptyProjectile());
        }
    }

    createEmptyProjectile() {
        // Tạo một object giả lập cấu trúc đạn nhưng chưa có thông số thực
        return {
            active: false,
            init: function(x, y, target, damage, speed, color, type, extras) {
                this.x = x; this.y = y;
                this.target = target; this.damage = damage;
                this.speed = speed; this.color = color;
                this.type = type; this.extras = extras;
                this.active = true;
            }
            // ... (Các hàm update di chuyển, vẽ render của Projectile cũ nhét vào đây) ...
        };
    }

    // Hàm gọi khi Tháp bắn
    acquire(x, y, target, damage, speed, color, type, extras) {
        // Tìm 1 viên đạn đang rảnh rỗi trong kho
        let p = this.pool.find(proj => !proj.active);
        
        // Nếu hết đạn rảnh, tự động nới rộng kho
        if (!p) {
            p = this.createEmptyProjectile();
            this.pool.push(p);
        }
        
        // Đánh thức viên đạn và gán thông số
        p.init(x, y, target, damage, speed, color, type, extras);
        return p;
    }

    // Hàm gọi khi đạn trúng quái hoặc bay ra khỏi bản đồ
    release(projectile) {
        projectile.active = false;
        projectile.target = null; // Cắt tham chiếu để dọn rác (Garbage Collector)
    }
}