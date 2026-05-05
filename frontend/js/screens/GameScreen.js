/**
 * GameScreen.js
 * Wraps the active gameplay view.
 */
class GameScreen {
    constructor(root, options = {}) {
        this.root = root || document.getElementById('game-container');
        if (!this.root) {
            throw new Error('GameScreen root element not found');
        }
        this.onBack = options.onBack ?? (() => {});

        this.backButton = this.root.querySelector('[data-action="back-levels"]');
        this.backButton?.addEventListener('click', () => this.onBack());
    }

    show() {
        this.root.classList.add('is-active');
        this.root.setAttribute('aria-hidden', 'false');
    }

    hide() {
        this.root.classList.remove('is-active');
        this.root.setAttribute('aria-hidden', 'true');
    }
}