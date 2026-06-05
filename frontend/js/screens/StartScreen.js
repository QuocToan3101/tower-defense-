/**
 * StartScreen.js
 * Màn hình chính – quản lý hiển thị giao diện Main Menu (New Game, Continue)
 * và xử lý sự kiện tương tác cơ bản ở đầu game.
 */
class StartScreen {
    constructor(rootElement, config = {}) {
        this.root = rootElement;
        this.onStartGame = config.onStartGame || null;
        this.bindEvents();
    }

    bindEvents() {
        const startBtns = this.root.querySelectorAll('.btn[data-action="start-game"]');

        startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // [UC-01 Bắt đầu trò chơi] Bước 1.1.3: Người chơi chọn New Game
                // Gọi callback để chuyển sang màn hình chọn Level (LevelSelectScreen)
                this.onStartGame?.();
            });
        });
    }

    show() {
        // [UC-01 Bắt đầu trò chơi] Bước 1.1.2: Hiển thị Main Menu
        // Xóa class 'hidden' và thêm 'is-active' để kích hoạt animation CSS (nếu có)
        this.root.classList.remove('hidden');
        this.root.classList.add('is-active');
    }

    hide() {
        this.root.classList.add('hidden');
        this.root.classList.remove('is-active');
    }
}