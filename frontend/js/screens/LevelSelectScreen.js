/**
 * LevelSelectScreen.js
 * Renders level cards with pagination (4 per page) and handles level selection.
 */
class LevelSelectScreen {
    constructor(root, options = {}) {
        this.root = root || document.getElementById('level-screen');
        if (!this.root) {
            throw new Error('LevelSelectScreen root element not found');
        }
        this.onBack = options.onBack ?? (() => {});
        this.onSelectLevel = options.onSelectLevel ?? (() => {});
        this.getUnlockedLevel = options.getUnlockedLevel ?? (() => 1);

        this.levelGrid = this.root.querySelector('[data-level-grid]') || this.root.querySelector('.level-grid') || this.root.querySelector('#level-grid');
        this.levelStatus = this.root.querySelector('[data-level-status]') || this.root.querySelector('.screen-status');
        this.backButton = this.root.querySelector('[data-action="back-start"]');
        
        // Pagination elements
        this.prevButton = this.root.querySelector('[data-action="prev-page"]');
        this.nextButton = this.root.querySelector('[data-action="next-page"]');
        this.pagerInfo = this.root.querySelector('[data-pager]');

        this.levelsPerPage = 4;
        this.currentPage = 0;

        this.backButton?.addEventListener('click', () => this.onBack());
        
        this.prevButton?.addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.render();
            }
        });
        
        this.nextButton?.addEventListener('click', () => {
            const levels = getAllMaps();
            const maxPage = Math.ceil(levels.length / this.levelsPerPage) - 1;
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.render();
            }
        });
        
        this.levelGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-level-id]');
            if (!button || button.dataset.locked === 'true') return;
            this.onSelectLevel(Number(button.dataset.levelId));
        });
    }

    render() {
        const levels = getAllMaps();
        const unlockedLevel = this.getUnlockedLevel();
        const totalPages = Math.ceil(levels.length / this.levelsPerPage);

        if (this.levelStatus) {
            this.levelStatus.textContent = `Unlocked: ${Math.min(unlockedLevel, levels.length)} / ${levels.length}`;
        }

        // Update pagination buttons
        if (this.prevButton) {
            this.prevButton.disabled = this.currentPage === 0;
        }
        if (this.nextButton) {
            this.nextButton.disabled = this.currentPage === totalPages - 1;
        }
        if (this.pagerInfo) {
            this.pagerInfo.textContent = `Page ${this.currentPage + 1} / ${totalPages}`;
        }

        if (!this.levelGrid) return;

        // Get levels for current page
        const startIdx = this.currentPage * this.levelsPerPage;
        const endIdx = startIdx + this.levelsPerPage;
        const pageLevels = levels.slice(startIdx, endIdx);

        this.levelGrid.innerHTML = pageLevels.map((level) => {
            const locked = level.id > unlockedLevel;
            return `
                <button class="level-card ${locked ? 'is-locked' : ''}" data-level-id="${level.id}" data-locked="${locked}">
                    <span class="level-card__tag">Level ${level.id}</span>
                    <strong class="level-card__title">${level.name}</strong>
                    <span class="level-card__meta">${level.difficulty}</span>
                    <span class="level-card__meta">${level.totalWaves} waves</span>
                    <span class="level-card__state">${locked ? 'Locked' : 'Tap to play'}</span>
                </button>
            `;
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
}