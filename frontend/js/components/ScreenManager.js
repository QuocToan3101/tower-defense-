/**
 * ScreenManager.js
 * Điều phối chuyển màn hình (Router): start → level → game
 * Quản lý trạng thái hiển thị của các View trong kiến trúc MVC.
 */
class ScreenManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
    }

    /**
     * Đăng ký một màn hình mới vào hệ thống quản lý
     */
    register(name, screen) {
        this.screens.set(name, screen);
    }

    /**
     * Chuyển đổi hiển thị giữa các màn hình
     * @param {string} name - Tên màn hình cần hiển thị ('start', 'level', 'game')
     * @param {object} payload - Dữ liệu truyền sang màn hình mới
     */
    show(name, payload = {}) {
        // Guard clause: Nếu đang ở màn hình hiện tại thì chỉ truyền thêm payload (nếu có)
        if (this.currentScreen === name) {
            const screen = this.screens.get(name);
            screen?.show?.(payload);
            return;
        }

        // Ẩn màn hình cũ (Nếu có)
        const current = this.screens.get(this.currentScreen);
        current?.hide?.();

        // Cập nhật trạng thái
        this.currentScreen = name;
        document.body.dataset.screen = name;

        // [UC-01 Bắt đầu trò chơi] Map các bước luồng sự kiện vào hành động show()
        if (name === 'start') {
            // Bước 1.1.2: Hiển thị Main Menu
            console.log("Navigating to: Main Menu");
        } else if (name === 'level') {
            // Bước 1.1.4: Hiển thị danh sách Level - chuyển sang LevelSelectScreen
            console.log("Navigating to: Level Select");
        } else if (name === 'game') {
            // Bước 1.1.5 -> 1.1.6: Người chơi chọn Level - chuyển sang GameScreen sau setupLevel()
            console.log("Navigating to: Gameplay Screen");
        }

        // Kích hoạt màn hình mới
        const next = this.screens.get(name);
        next?.show?.(payload);
    }

    /**
     * Lấy tên màn hình đang hiển thị
     */
    getCurrentScreen() {
        return this.currentScreen;
    }
}