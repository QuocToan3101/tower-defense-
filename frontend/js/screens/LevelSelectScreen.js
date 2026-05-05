/**
 * LevelSelectScreen.js
 * Renders level cards and handles level selection.
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

        this.levelGrid = this.root.querySelector('[data-level-grid]') || this.root.querySelector('.level-grid');
        this.levelStatus = this.root.querySelector('[data-level-status]') || this.root.querySelector('.screen-status');
        this.backButton = this.root.querySelector('[data-action="back-start"]');

        this.backButton?.addEventListener('click', () => this.onBack());
        this.levelGrid?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-level-id]');
            if (!button || button.dataset.locked === 'true') return;
            this.onSelectLevel(Number(button.dataset.levelId));
        });
    }

    render() {
        const levels = getAllMaps();
        const unlockedLevel = this.getUnlockedLevel();

        if (this.levelStatus) {
            this.levelStatus.textContent = `Unlocked: ${Math.min(unlockedLevel, levels.length)} / ${levels.length}`;
        }

        if (!this.levelGrid) return;

        this.levelGrid.innerHTML = levels.map((level) => {
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
        this.render();
        this.root.classList.add('is-active');
        this.root.setAttribute('aria-hidden', 'false');
    }

    hide() {
        this.root.classList.remove('is-active');
        this.root.setAttribute('aria-hidden', 'true');
    }
}