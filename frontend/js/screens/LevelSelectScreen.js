/**
 * LevelSelectScreen.js — Dark Fantasy AAA Redesign
 *
 * Drop-in replacement for the original LevelSelectScreen.js.
 * Fully compatible with the existing API:
 *   getAllMaps(), options.onBack, options.onSelectLevel, options.getUnlockedLevel
 *
 * What changed:
 *   - Procedural SVG artwork in each card (per-level color palette + glyph)
 *   - Difficulty color classes (Easy/Normal/Hard/Nightmare)
 *   - ⚔ PLAY button on unlocked cards
 *   - 🔒 overlay on locked cards with "Sealed" label
 *   - Crystal SVG pagination buttons (still use data-action="prev-page" / "next-page")
 *   - Progress bar synced to data-level-status
 *   - Card entrance animation and flash-on-select effect
 *   - Particle and star generation (needs #stars and #particles divs in HTML)
 *
 * Required HTML additions (add to your #level-screen section):
 *   <div id="stars" class="stars"></div>
 *   <div id="particles" class="particles"></div>
 *   <div class="progress-bar-wrap"><div class="progress-bar" id="progress-bar"></div></div>
 *
 * Required CSS: include LevelSelectScreen_redesign.css (extracted from the HTML file)
 */

class LevelSelectScreen {
    constructor(root, options = {}) {
        this.root = root || document.getElementById('level-screen');
        if (!this.root) throw new Error('LevelSelectScreen root element not found');

        this.onBack           = options.onBack           ?? (() => {});
        this.onSelectLevel    = options.onSelectLevel    ?? (() => {});
        this.getUnlockedLevel = options.getUnlockedLevel ?? (() => 1);

        // Data-attribute selectors match original HTML
        this.levelGrid   = this.root.querySelector('[data-level-grid]') ||
            this.root.querySelector('.level-grid') ||
            this.root.querySelector('#level-grid');
        this.levelStatus = this.root.querySelector('[data-level-status]') ||
            this.root.querySelector('.screen-status');
        this.backButton  = this.root.querySelector('[data-action="back-start"]');
        this.prevButton  = this.root.querySelector('[data-action="prev-page"]');
        this.nextButton  = this.root.querySelector('[data-action="next-page"]');
        this.pagerInfo   = this.root.querySelector('[data-pager]');
        this.progressBar = this.root.querySelector('#progress-bar');

        this.levelsPerPage = 4;
        this.currentPage   = 0;

        // Per-level SVG art color palettes [dark1, dark2, dark3, accent]
        this.ART_PALETTES = [
            ['#0a2010','#1a4020','#0d3018','#3ecf6e'],  // 1 Easy
            ['#080e28','#0e1840','#0a1535','#5aabff'],  // 2 Normal
            ['#200e00','#402010','#301500','#ff8c3a'],  // 3 Hard
            ['#060e20','#0c1838','#081428','#5aabff'],  // 4 Normal
            ['#180c00','#301800','#201000','#ff8c3a'],  // 5 Hard
            ['#0a1020','#0e1a38','#0c1530','#3ecf6e'],  // 6 Easy
            ['#120008','#280010','#1e0008','#ff3a3a'],  // 7 Nightmare
            ['#06100e','#0c2018','#091814','#5aabff'],  // 8 Normal
            ['#1a1200','#2e2200','#221800','#ff8c3a'],  // 9 Hard
            ['#0c0010','#1a0020','#140018','#ff3a3a'],  // 10 Nightmare
            ['#060e0c','#0e1e18','#081814','#5aabff'],  // 11 Normal
            ['#1e0a00','#380e00','#2c0c00','#ff8c3a'],  // 12 Hard
            ['#080c20','#101828','#0c1420','#3ecf6e'],  // 13 Easy
            ['#060e18','#0c1a2c','#081420','#5aabff'],  // 14 Normal
            ['#0e0012','#200020','#180018','#ff3a3a'],  // 15 Nightmare
            ['#180e00','#2c1c00','#221400','#ff8c3a'],  // 16 Hard
            ['#060e18','#0e1c30','#0a1424','#5aabff'],  // 17 Normal
            ['#100014','#200028','#18001e','#ff3a3a'],  // 18 Nightmare
            ['#0e1000','#1e2200','#161a00','#ff8c3a'],  // 19 Hard
            ['#1a0000','#300000','#240000','#ff3a3a'],  // 20 Nightmare (final)
        ];

        this.ART_GLYPHS = [
            '🌲','🏰','⛰️','🌊','🌑','💎','🚪','🛡️','🗻','🌪️',
            '🌿','🔥','👁️','⚔️','🌀','💀','❄️','✨','⛈️','🏚️'
        ];

        this.DIFF_ICONS = {
            Easy: '🌿', Normal: '⚔️', Hard: '🔥', Nightmare: '💀'
        };

        this._bindEvents();
    }

    // ─────────────────────────────────────────
    //  Private helpers
    // ─────────────────────────────────────────

    _bindEvents() {
        this.backButton?.addEventListener('click', () => this.onBack());

        this.prevButton?.addEventListener('click', () => {
            if (this.currentPage > 0) { this.currentPage--; this.render(); }
        });

        this.nextButton?.addEventListener('click', () => {
            const maxPage = Math.ceil(getAllMaps().length / this.levelsPerPage) - 1;
            if (this.currentPage < maxPage) { this.currentPage++; this.render(); }
        });

        this.levelGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-level-id]');

            // [UC-5.1 AF 5.1.2.1] Người chơi chọn màn chơi chưa mở khóa:
            // Con trỏ chuột trở thành biểu tượng không thể chọn (đã xử lý qua CSS cursor: not-allowed)
            // và hệ thống không cho phép bắt đầu màn chơi này.
            if (!button || button.dataset.locked === 'true') return;

            // [UC-5.1 BF 5.1.1.3] Người chơi chọn màn chơi (level) trong danh sách.
            // Hiển thị hiệu ứng flash phản hồi thị giác để xác nhận lựa chọn của người chơi.
            this._flashCard(button);

            // [UC-5.1 BR 5.1.4.5] Mỗi lần người chơi chọn màn phải được ghi log
            // để phục vụ thống kê và kiểm thử, bao gồm ID màn và thời điểm chọn.
            // [UC-5.1 NFR 5.1.5.3] Log phải được ghi đầy đủ và không bị mất khi xảy ra lỗi.
            console.log(`[LOG] Level selected: ${button.dataset.levelId} at ${new Date().toISOString()}`);

            // [UC-5.1 BF 5.1.1.4] Hệ thống bắt đầu tải và khởi động màn chơi được chọn.
            setTimeout(() => this.onSelectLevel(Number(button.dataset.levelId)), 220);
        });
    }

    _flashCard(card) {
        card.style.transition = 'none';
        card.style.boxShadow  = '0 0 40px rgba(240,192,64,0.7), 0 0 80px rgba(80,140,255,0.4)';
        card.style.transform  = 'scale(1.04) translateY(-6px)';
        setTimeout(() => {
            card.style.transition = '';
            card.style.boxShadow  = '';
            card.style.transform  = '';
        }, 280);
    }

    _makeArtSVG(level) {
        const idx = (level.id - 1) % this.ART_PALETTES.length;
        const [c0, c1, c2, acc] = this.ART_PALETTES[idx];
        const glyph = this.ART_GLYPHS[(level.id - 1) % this.ART_GLYPHS.length];
        const gid = `ag_lvl_${level.id}`;
        const rid = `ar_lvl_${level.id}`;

        return `<svg width="100%" height="100%" viewBox="0 0 400 160" 
                    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="${gid}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="${c0}"/>
                    <stop offset="100%" stop-color="${c2}"/>
                </linearGradient>
                <radialGradient id="${rid}" cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="${acc}" stop-opacity="0.55"/>
                    <stop offset="100%" stop-color="${acc}" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <rect width="400" height="160" fill="url(#${gid})"/>
            <rect width="400" height="160" fill="url(#${rid})"/>
            <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
                  font-size="68" opacity="0.75" fill="#fff">${glyph}</text>
        </svg>`;
    }

    _diffClass(d) {
        const map = { easy: 'diff-easy', normal: 'diff-normal', hard: 'diff-hard', nightmare: 'diff-nightmare' };
        return map[(d || '').toLowerCase()] || 'diff-normal';
    }

    render() {
        // [UC-5.1 BF 5.1.1.1] Hệ thống lấy danh sách các màn chơi (levels) từ dữ liệu.
        const levels = getAllMaps();

        // [UC-5.1 BF 5.1.1.2] Hệ thống hiển thị các màn chơi (level) trên giao diện.
        // unlockedLevel xác định màn nào được mở (unlocked) hay bị khóa (locked).
        // [UC-5.1 BR 5.1.4.4] Điều kiện mở khóa: phải hoàn thành màn chơi trước đó.
        const unlockedLevel = this.getUnlockedLevel();
        const totalPages = Math.ceil(levels.length / this.levelsPerPage);

        // [UC-5.1 BR 5.1.4.1] Mỗi ô hiển thị thông tin: tên màn, độ khó tổng quát
        // và trạng thái màn (Đã mở / Đang khóa).
        // Cập nhật nhãn trạng thái và thanh tiến trình theo số màn đã mở.
        if (this.levelStatus) {
            this.levelStatus.textContent = `Unlocked ${Math.min(unlockedLevel, levels.length)} / ${levels.length}`;
        }
        if (this.progressBar) {
            const pct = Math.round((Math.min(unlockedLevel, levels.length) / levels.length) * 100);
            this.progressBar.style.width = pct + '%';
        }

        if (this.prevButton) this.prevButton.disabled = this.currentPage === 0;
        if (this.nextButton) this.nextButton.disabled = this.currentPage === totalPages - 1;
        if (this.pagerInfo) this.pagerInfo.textContent = `${this.currentPage + 1} / ${totalPages}`;

        if (!this.levelGrid) return;

        const startIdx = this.currentPage * this.levelsPerPage;
        const pageLevels = levels.slice(startIdx, startIdx + this.levelsPerPage);

        // [UC-5.1 NFR 5.1.5.1] Danh sách màn chơi phải được hiển thị trong vòng 1 giây
        // sau khi người dùng kích hoạt use case.
        // [UC-5.1 NFR 5.1.5.2] Giao diện trực quan, thân thiện, hỗ trợ cả màn hình cảm ứng
        // lẫn tương tác nhấp chuột.
        this.levelGrid.innerHTML = pageLevels.map((level) => {
            // [UC-5.1 BR 5.1.4.2] Các màn chơi chưa mở khóa phải được thể hiện rõ ràng
            // trên giao diện (overlay khóa + nhãn "Sealed").
            // [UC-5.1 BR 5.1.4.3] Người chơi không thể truy cập vào những màn chưa được mở khóa:
            // data-locked="true" được dùng để chặn sự kiện click tại _bindEvents.
            const locked = level.id > unlockedLevel;
            const dc = this._diffClass(level.difficulty);
            const di = this.DIFF_ICONS[level.difficulty] || '';

            return `
                <div class="level-card${locked ? ' is-locked' : ''}" 
                     data-level-id="${level.id}" 
                     data-locked="${locked}">
                    
                    <!-- FULL-WIDTH ICON BANNER -->
                    <div class="card-icon">
                        ${this._makeArtSVG(level)}
                    </div>

                    <div class="card-body">
                        <div class="card-top">
                            <span class="card-level-tag">LEVEL ${level.id}</span>
                            <span class="card-diff ${dc}">${di} ${level.difficulty}</span>
                        </div>
                        <div class="card-title">${level.name}</div>
                        <div class="card-meta-row">
                            <span class="card-meta">🌊 ${level.totalWaves} Waves</span>
                        </div>
                        ${!locked ? '<button class="play-btn">✕ PLAY</button>' : ''}
                    </div>

                    ${locked ? `
                    <div class="card-overlay">
                        <div class="lock-icon">🔒</div>
                        <div class="lock-chains">— Sealed —</div>
                    </div>` : ''}
                </div>`;
        }).join('');
    }

    show() {
        this.currentPage = 0;
        this.render();
        this.root.classList.add('is-active');
        this.root.setAttribute('aria-hidden', 'false');
    }

    hide() {
        this.root.classList.remove('is-active');
        this.root.setAttribute('aria-hidden', 'true');
    }

    /**
     * Call once after DOM is ready to spawn atmospheric particles + stars.
     * Optional — purely cosmetic.
     */
    spawnAtmosphere() {
        const starsEl = document.getElementById('stars');
        if (starsEl && starsEl.childElementCount === 0) {
            for (let i = 0; i < 120; i++) {
                const s = document.createElement('div');
                s.className = 'star';
                const sz = Math.random() * 2.5 + 0.5;
                s.style.cssText =
                    `width:${sz}px;height:${sz}px;` +
                    `left:${Math.random()*100}%;top:${Math.random()*65}%;` +
                    `--dur:${2+Math.random()*5}s;--delay:${-Math.random()*6}s`;
                starsEl.appendChild(s);
            }
        }
        const particlesEl = document.getElementById('particles');
        if (particlesEl && particlesEl.childElementCount === 0) {
            for (let i = 0; i < 32; i++) {
                const p = document.createElement('div');
                p.className = 'spark';
                const sz    = Math.random() * 3 + 1;
                const color = Math.random() > 0.5
                    ? 'rgba(100,180,255,0.8)' : 'rgba(200,160,60,0.8)';
                p.style.cssText =
                    `width:${sz}px;height:${sz}px;` +
                    `left:${10+Math.random()*80}%;top:${40+Math.random()*55}%;` +
                    `background:${color};` +
                    `--s-dur:${5+Math.random()*8}s;` +
                    `--s-delay:${-Math.random()*10}s;` +
                    `--s-dx:${(Math.random()-0.5)*60}px`;
                particlesEl.appendChild(p);
            }
        }
    }
}