/**
 * StartScreen.js
 * Landing screen shown when the app loads.
 */
class StartScreen {
    constructor(root, options = {}) {
        this.root = root;
        this.onStartGame = options.onStartGame ?? (() => {});

        this.startButton = this.root.querySelector('[data-action="start-game"]');
        this.startButton?.addEventListener('click', () => this.onStartGame());
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