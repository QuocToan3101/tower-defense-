export class ProjectilePool {
    constructor(initialSize = 100) {
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createEmptyProjectile());
        }
    }

    createEmptyProjectile() {
        return {
            active: false,
            
            // Khởi tạo thông số đạn
            init: function(x, y, target, damage, speed, color, type, extras) {
                this.x = x; 
                this.y = y;
                this.target = target; 
                this.damage = damage;
                this.speed = speed; 
                this.color = color;
                this.type = type; 
                this.extras = extras || {};
                this.active = true;
                this.hit = false; // Cờ đánh dấu đã trúng mục tiêu chưa
            },
            
            // ─── 1. VẬT LÝ: TÊN LỬA TẦM NHIỆT (HOMING) ─────────────
            update: function(dt, allEnemies) {
                if (!this.active || this.hit) return;

                // Liên tục đọc tọa độ mới của quái vật (Bẻ lái đón đầu)
                if (this.target && this.target.alive) {
                    this.targetX = this.target.x;
                    this.targetY = this.target.y;
                } else if (!this.targetX) {
                    // Nếu mục tiêu chết trước khi đạn tới, tự hủy đạn
                    this.active = false; 
                    return;
                }

                // Tính toán Vector di chuyển
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.hypot(dx, dy);
                const moveDist = this.speed * dt;

                // Kiểm tra va chạm
                if (distance <= moveDist) {
                    this.x = this.targetX;
                    this.y = this.targetY;
                    this.processHit(allEnemies); // Xử lý sát thương
                    this.hit = true; 
                    this.active = false; // Đánh dấu chết để GameManager thu hồi vào kho
                } else {
                    // Cập nhật tọa độ theo Vector
                    this.x += (dx / distance) * moveDist;
                    this.y += (dy / distance) * moveDist;
                }
            },

            // ─── 2. ĐA HÌNH: XỬ LÝ SÁT THƯƠNG LAN & LÀM CHẬM ────────
            processHit: function(allEnemies) {
                // A. Kịch bản Tháp Pháo (Có bán kính nổ)
                if (this.extras.splashRadius) {
                    for (const enemy of allEnemies) {
                        if (!enemy.alive) continue;
                        // Quét các quái nằm trong vòng nổ
                        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                        if (dist <= this.extras.splashRadius) {
                            enemy.hp -= this.damage;
                        }
                    }
                } 
                // B. Kịch bản Tháp thường / Tháp Băng (Đơn mục tiêu)
                else if (this.target && this.target.alive) {
                    this.target.hp -= this.damage;
                    
                    // Kích hoạt hiệu ứng làm chậm của Tháp Băng
                    if (this.extras.slow) {
                        // Giả định class Enemy của bạn có 2 biến này để quản lý tốc độ
                        this.target.speedMultiplier = this.extras.slow.factor;
                        this.target.slowTimer = this.extras.slow.duration; 
                    }
                }
            },

            // ─── 3. ĐỒ HỌA: VẼ ĐẠN ─────────────────────────────────
            render: function(ctx) {
                if (!this.active) return;
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                
                // Thêm quầng sáng phát quang (Glow effect) cho đạn phép/lửa
                if (this.type === 'fire' || this.type === 'magic') {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                    ctx.fill();
                    ctx.shadowBlur = 0; // Trả lại bình thường cho các hình vẽ sau
                } else {
                    ctx.fill();
                }
            }
        };
    }

    acquire(x, y, target, damage, speed, color, type, extras) {
        let p = this.pool.find(proj => !proj.active);
        if (!p) {
            p = this.createEmptyProjectile();
            this.pool.push(p);
        }
        p.init(x, y, target, damage, speed, color, type, extras);
        return p;
    }

    release(projectile) {
        projectile.active = false;
        projectile.target = null;
    }
}