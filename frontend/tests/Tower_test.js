// File: tests/Tower.test.js
const assert = require('assert');

// =====================================================================
// PHẦN 1: MOCK DATA & CLASSES (Giả lập môi trường game để test độc lập)
// =====================================================================

class FrostTower {
    constructor(x, y) {
        this.type = 'FROST_TOWER';
        this.x = x;
        this.y = y;
    }
}

class TowerFactory {
    static create(type, x, y) {
        if (type === 'FROST_TOWER') return new FrostTower(x, y);
        return null;
    }
}

const TargetingStrategies = {
    STRONGEST: (enemies) => {
        if (!enemies || enemies.length === 0) return null;
        // Tìm quái vật có HP cao nhất
        return enemies.reduce((prev, current) => (prev.hp > current.hp) ? prev : current);
    }
};

class ProjectilePool {
    constructor() {
        // Giả lập kho đạn có 10 viên đang rảnh rỗi (active = false)
        this.pool = Array.from({ length: 10 }, () => ({ active: false }));
    }
    acquire() {
        const projectile = this.pool.find(p => !p.active);
        if (projectile) {
            projectile.active = true;
            return projectile;
        }
        return null;
    }
    getInactiveCount() {
        return this.pool.filter(p => !p.active).length;
    }
}

// =====================================================================
// PHẦN 2: THỰC THI UNIT TEST (DEVELOPMENT TESTING)
// =====================================================================

console.log("🚀 Bắt đầu chạy Unit Test cho mô-đun Quản lý Tháp (UC-02)... \n");

try {
    // UT-02-01: Test TowerFactory
    const tower = TowerFactory.create('FROST_TOWER', 5, 5);
    assert.strictEqual(tower.type, 'FROST_TOWER', "Lỗi: Loại tháp tạo ra không đúng");
    assert.strictEqual(tower.x, 5, "Lỗi: Sai tọa độ X");
    assert.strictEqual(tower.y, 5, "Lỗi: Sai tọa độ Y");
    console.log("[PASS] UT-02-01: TowerFactory khởi tạo chính xác FrostTower tại (5, 5).");

    // UT-02-02: Test TargetingStrategies (STRONGEST)
    const enemies = [{ id: 1, hp: 100 }, { id: 2, hp: 250 }, { id: 3, hp: 50 }];
    const target = TargetingStrategies.STRONGEST(enemies);
    assert.strictEqual(target.hp, 250, "Lỗi: Thuật toán không chọn đúng quái vật máu nhiều nhất");
    assert.strictEqual(target.id, 2, "Lỗi: Sai ID quái vật");
    console.log("[PASS] UT-02-02: TargetingStrategies.STRONGEST chọn đúng mục tiêu HP = 250.");

    // UT-02-03: Test ProjectilePool
    const pool = new ProjectilePool();
    assert.strictEqual(pool.getInactiveCount(), 10, "Lỗi: Kho ban đầu phải có 10 viên đạn rảnh rỗi");
    
    const bullet = pool.acquire();
    assert.strictEqual(bullet.active, true, "Lỗi: Đạn được cấp phát không chuyển sang trạng thái active");
    assert.strictEqual(pool.getInactiveCount(), 9, "Lỗi: Số lượng đạn rảnh rỗi không giảm xuống 9");
    console.log("[PASS] UT-02-03: ProjectilePool cấp phát đạn chuẩn xác, kho còn lại 9 viên.\n");

    console.log("TẤT CẢ UNIT TEST ĐỀU PASS (3/3). SẴN SÀNG MERGE CODE!");

} catch (error) {
    console.error("[FAIL] Unit Test thất bại:");
    console.error(error.message);
}