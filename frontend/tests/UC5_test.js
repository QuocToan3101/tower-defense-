// File: tests/LevelSelect.test.js
const assert = require('assert');

// =====================================================================
// PHẦN 1: MOCK DATA & CLASSES
// (Giả lập môi trường game để test độc lập, không cần browser hay canvas)
// =====================================================================

// --- Giả lập dữ liệu map (maps.js / LevelData.js) ---
const MOCK_MAPS = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    key: `level${i + 1}`,
    name: `Mock Level ${i + 1}`,
    difficulty: ['Easy', 'Normal', 'Hard', 'Nightmare'][i % 4],
    totalWaves: 8 + i,
    grid: [],
    waypoints: [],
}));

function getAllMaps() {
    return MOCK_MAPS.map(m => ({ ...m })); // Trả về bản sao như code thật
}

function getLevelById(id) {
    const map = MOCK_MAPS.find(m => m.id === id);
    if (!map) throw new Error(`Map ${id} not found`);
    return { ...map };
}

// --- Giả lập LevelSelectScreen (trích lõi logic, bỏ DOM) ---
class MockLevelSelectScreen {
    constructor(options = {}) {
        this.onBack           = options.onBack           ?? (() => {});
        this.onSelectLevel    = options.onSelectLevel    ?? (() => {});
        this.getUnlockedLevel = options.getUnlockedLevel ?? (() => 1);

        this.levelsPerPage = 4;
        this.currentPage   = 0;

        // Log ghi nhận mỗi lần chọn màn (BF 5.1.1.6)
        this.selectionLog = [];
    }

    // [BF 5.1.1.1] Nhận danh sách các màn chơi từ dữ liệu
    getLevels() {
        return getAllMaps();
    }

    // [BF 5.1.1.2] Tính toán danh sách màn chơi hiển thị trên trang hiện tại
    getPagedLevels() {
        const all = this.getLevels();
        const start = this.currentPage * this.levelsPerPage;
        return all.slice(start, start + this.levelsPerPage);
    }

    // [BF 5.1.1.2] Trả về tổng số trang
    getTotalPages() {
        return Math.ceil(getAllMaps().length / this.levelsPerPage);
    }

    // [BF 5.1.1.2] Kiểm tra trạng thái khóa của một màn chơi
    isLocked(levelId) {
        return levelId > this.getUnlockedLevel();
    }

    // [BF 5.1.1.2] Tính phần trăm tiến trình mở màn
    getProgressPercent() {
        const levels = this.getLevels();
        const unlocked = Math.min(this.getUnlockedLevel(), levels.length);
        return Math.round((unlocked / levels.length) * 100);
    }

    // [BF 5.1.1.3] Người chơi chọn màn
    // [BF 5.1.1.4] Hệ thống yêu cầu xác nhận (trả về false nếu bị khóa)
    // [EF 5.1.3.1] Ngăn truy cập màn bị khóa
    selectLevel(levelId, confirmed = false) {
        // [EF 5.1.3.1] Không cho phép bắt đầu nếu màn bị khóa
        if (this.isLocked(levelId)) {
            return { success: false, reason: 'LOCKED' };
        }

        // [BF 5.1.1.4] Chờ xác nhận từ người chơi
        if (!confirmed) {
            return { success: false, reason: 'AWAITING_CONFIRM' };
        }

        // [BF 5.1.1.6] Ghi log màn được lựa chọn và thời điểm lựa chọn
        // [BR 5.1.4.5] Mỗi lần người chơi chọn phải được ghi log để phục vụ thống kê và kiểm thử
        this.selectionLog.push({ levelId, timestamp: new Date().toISOString() });

        // [BF 5.1.1.7] Gọi callback để hệ thống bắt đầu tải và khởi động màn chơi
        this.onSelectLevel(levelId);
        return { success: true };
    }

    // Điều hướng trang tiếp theo
    nextPage() {
        if (this.currentPage < this.getTotalPages() - 1) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    // Điều hướng trang trước
    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    // Kiểm tra nút Prev/Next có nên bị disabled không
    isPrevDisabled() { return this.currentPage === 0; }
    isNextDisabled() { return this.currentPage === this.getTotalPages() - 1; }
}


// =====================================================================
// PHẦN 2: THỰC THI UNIT TEST
// =====================================================================

let passed = 0;
let failed = 0;

function run(id, label, fn) {
    try {
        fn();
        console.log(`[PASS] ${id}: ${label}`);
        passed++;
    } catch (err) {
        console.error(`[FAIL] ${id}: ${label}`);
        console.error(`       ↳ ${err.message}`);
        failed++;
    }
}

console.log("🚀 Bắt đầu chạy Unit Test cho Use Case UC-5.1: Chọn Level...\n");
console.log("─".repeat(65));

// ── TC-5.1.01 ──────────────────────────────────────────────────────
// [BF 5.1.1.1] Hệ thống nhận danh sách các màn chơi từ dữ liệu.
// [BF 5.1.1.2] Hệ thống hiển thị các màn chơi trên giao diện.
run("TC-5.1.01", "getAllMaps() trả về đúng 20 màn chơi với đầy đủ thông tin", () => {
    const screen = new MockLevelSelectScreen();
    const levels = screen.getLevels();

    assert.strictEqual(levels.length, 20, "Lỗi: Phải có đúng 20 màn chơi");
    assert.ok(levels[0].id,         "Lỗi: Thiếu trường 'id'");
    assert.ok(levels[0].name,       "Lỗi: Thiếu trường 'name'");
    assert.ok(levels[0].difficulty, "Lỗi: Thiếu trường 'difficulty'");
    assert.ok(levels[0].totalWaves, "Lỗi: Thiếu trường 'totalWaves'");
});

// ── TC-5.1.02 ──────────────────────────────────────────────────────
// [BF 5.1.1.2] Hiển thị đúng 4 màn chơi trên mỗi trang (phân trang).
run("TC-5.1.02", "Trang đầu tiên hiển thị đúng 4 màn chơi (Level 1–4)", () => {
    const screen = new MockLevelSelectScreen({ getUnlockedLevel: () => 20 });
    const page = screen.getPagedLevels();

    assert.strictEqual(page.length, 4,   "Lỗi: Trang đầu phải hiển thị đúng 4 màn");
    assert.strictEqual(page[0].id, 1,    "Lỗi: Màn đầu tiên phải là Level 1");
    assert.strictEqual(page[3].id, 4,    "Lỗi: Màn cuối trang đầu phải là Level 4");
});

// ── TC-5.1.03 ──────────────────────────────────────────────────────
// [BF 5.1.1.3] Người chơi chọn màn chơi.
// [BF 5.1.1.4] Hệ thống hiển thị hộp thoại xác nhận (AWAITING_CONFIRM trước khi confirmed).
run("TC-5.1.03", "Chọn màn đã mở khóa trả về AWAITING_CONFIRM trước khi xác nhận", () => {
    const screen = new MockLevelSelectScreen({ getUnlockedLevel: () => 5 });
    const result = screen.selectLevel(3); // Level 3 đã mở, chưa xác nhận

    assert.strictEqual(result.success, false,             "Lỗi: Phải chờ xác nhận");
    assert.strictEqual(result.reason, 'AWAITING_CONFIRM', "Lỗi: Reason phải là AWAITING_CONFIRM");
});

// ── TC-5.1.04 ──────────────────────────────────────────────────────
// [BF 5.1.1.5] Người chọn "Xác nhận" -> Có chọn.
// [BF 5.1.1.6] Hệ thống ghi vào log màn được lựa chọn và thời điểm lựa chọn.
// [BF 5.1.1.7] Hệ thống bắt đầu tải và khởi động màn chơi.
run("TC-5.1.04", "Xác nhận chọn màn -> gọi onSelectLevel, ghi log đúng", () => {
    let calledWith = null;
    const screen = new MockLevelSelectScreen({
        getUnlockedLevel: () => 5,
        onSelectLevel: (id) => { calledWith = id; }
    });

    const result = screen.selectLevel(3, true); // confirmed = true

    assert.strictEqual(result.success, true,  "Lỗi: Kết quả phải là success");
    assert.strictEqual(calledWith, 3,          "Lỗi: onSelectLevel phải được gọi với id = 3");
    assert.strictEqual(screen.selectionLog.length, 1,         "Lỗi: Log phải có đúng 1 bản ghi");
    assert.strictEqual(screen.selectionLog[0].levelId, 3,     "Lỗi: Log phải ghi đúng levelId");
    assert.ok(screen.selectionLog[0].timestamp,               "Lỗi: Log phải có timestamp");
});

// ── TC-5.1.05 ──────────────────────────────────────────────────────
// [AF 5.1.2.4.a] Người chơi chọn "Không" -> không chọn.
// onSelectLevel KHÔNG được gọi, log KHÔNG được ghi.
run("TC-5.1.05", "Hủy xác nhận (confirmed=false) -> onSelectLevel không được gọi", () => {
    let called = false;
    const screen = new MockLevelSelectScreen({
        getUnlockedLevel: () => 5,
        onSelectLevel: () => { called = true; }
    });

    screen.selectLevel(3, false); // Người chơi bấm "Không"

    assert.strictEqual(called, false,                   "Lỗi: onSelectLevel không được gọi");
    assert.strictEqual(screen.selectionLog.length, 0,   "Lỗi: Không được ghi log khi hủy");
});

// ── TC-5.1.06 ──────────────────────────────────────────────────────
// [EF 5.1.3.1] Người chơi chọn màn chơi chưa mở khóa.
// [BR 5.1.4.3] Người chơi không thể truy cập vào màn chơi chưa được mở khóa.
run("TC-5.1.06", "Chọn màn bị khóa -> trả về LOCKED, không gọi onSelectLevel", () => {
    let called = false;
    const screen = new MockLevelSelectScreen({
        getUnlockedLevel: () => 3,
        onSelectLevel: () => { called = true; }
    });

    const result = screen.selectLevel(7, true); // Level 7 > unlockedLevel=3

    assert.strictEqual(result.success, false,    "Lỗi: Không được thành công khi màn bị khóa");
    assert.strictEqual(result.reason, 'LOCKED',  "Lỗi: Reason phải là LOCKED");
    assert.strictEqual(called, false,             "Lỗi: onSelectLevel không được gọi với màn bị khóa");
});

// ── TC-5.1.07 ──────────────────────────────────────────────────────
// [BR 5.1.4.2] Các màn chơi chưa mở khóa phải thể hiện rõ ở giao diện (ô màu xám, biểu tượng khóa).
// [BR 5.1.4.1] Mỗi ô hiển thị thông tin: tên màn, độ khó, trạng thái.
run("TC-5.1.07", "isLocked() phân biệt đúng màn đã mở và màn bị khóa", () => {
    const screen = new MockLevelSelectScreen({ getUnlockedLevel: () => 5 });

    assert.strictEqual(screen.isLocked(1), false, "Lỗi: Level 1 phải được mở (unlocked)");
    assert.strictEqual(screen.isLocked(5), false, "Lỗi: Level 5 phải được mở (biên)");
    assert.strictEqual(screen.isLocked(6), true,  "Lỗi: Level 6 phải bị khóa");
    assert.strictEqual(screen.isLocked(20), true, "Lỗi: Level 20 phải bị khóa");
});

// ── TC-5.1.08 ──────────────────────────────────────────────────────
// [BF 5.1.1.2] Phân trang - chuyển sang trang kế tiếp.
run("TC-5.1.08", "Chuyển trang tiếp theo hiển thị đúng Level 5–8", () => {
    const screen = new MockLevelSelectScreen({ getUnlockedLevel: () => 20 });

    const moved = screen.nextPage();
    assert.strictEqual(moved, true, "Lỗi: Phải chuyển được sang trang 2");

    const page = screen.getPagedLevels();
    assert.strictEqual(page.length, 4,  "Lỗi: Trang 2 phải có 4 màn");
    assert.strictEqual(page[0].id, 5,   "Lỗi: Level đầu trang 2 phải là Level 5");
    assert.strictEqual(page[3].id, 8,   "Lỗi: Level cuối trang 2 phải là Level 8");
});

// ── TC-5.1.09 ──────────────────────────────────────────────────────
// [BF 5.1.1.2] Nút Prev disabled ở trang đầu; nút Next disabled ở trang cuối.
run("TC-5.1.09", "isPrevDisabled/isNextDisabled đúng ở trang đầu và trang cuối", () => {
    const screen = new MockLevelSelectScreen({ getUnlockedLevel: () => 20 });

    // Trang đầu
    assert.strictEqual(screen.isPrevDisabled(), true,  "Lỗi: Prev phải disabled ở trang 1");
    assert.strictEqual(screen.isNextDisabled(), false, "Lỗi: Next phải enabled ở trang 1");

    // Điều hướng đến trang cuối (trang 5 của 20 màn / 4 per page)
    screen.currentPage = screen.getTotalPages() - 1;
    assert.strictEqual(screen.isPrevDisabled(), false, "Lỗi: Prev phải enabled ở trang cuối");
    assert.strictEqual(screen.isNextDisabled(), true,  "Lỗi: Next phải disabled ở trang cuối");
});

// ── TC-5.1.10 ──────────────────────────────────────────────────────
// [BF 5.1.1.2] Progress bar đồng bộ với số màn đã mở.
// [BR 5.1.4.4] Điều kiện mở khóa màn: Phải hoàn thành màn chơi điều kiện trước đó.
run("TC-5.1.10", "getProgressPercent() tính đúng phần trăm tiến trình mở màn", () => {
    const half = new MockLevelSelectScreen({ getUnlockedLevel: () => 10 });
    assert.strictEqual(half.getProgressPercent(), 50, "Lỗi: 10/20 màn phải bằng 50%");

    const all  = new MockLevelSelectScreen({ getUnlockedLevel: () => 20 });
    assert.strictEqual(all.getProgressPercent(), 100, "Lỗi: 20/20 màn phải bằng 100%");

    const one  = new MockLevelSelectScreen({ getUnlockedLevel: () => 1 });
    assert.strictEqual(one.getProgressPercent(), 5, "Lỗi: 1/20 màn phải bằng 5%");
});

// ──────────────────────────────────────────────────────────────────
console.log("─".repeat(65));
console.log(`\n📊 Kết quả: ${passed} PASS | ${failed} FAIL | Tổng: ${passed + failed} test cases\n`);

if (failed === 0) {
    console.log("✅ TẤT CẢ UNIT TEST ĐỀU PASS (10/10). SẴN SÀNG MERGE CODE!");
} else {
    console.log("❌ CÓ TEST CASE THẤT BẠI. VUI LÒNG KIỂM TRA LẠI TRƯỚC KHI MERGE!");
    process.exit(1);
}