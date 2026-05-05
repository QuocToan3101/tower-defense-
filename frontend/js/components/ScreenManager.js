/**
 * ScreenManager.js
 * Central state machine for app navigation.
 */
class ScreenManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
    }

    register(name, screen) {
        this.screens.set(name, screen);
    }

    show(name, payload = {}) {
        if (this.currentScreen === name) {
            const screen = this.screens.get(name);
            screen?.show?.(payload);
            return;
        }

        const current = this.screens.get(this.currentScreen);
        current?.hide?.();

        this.currentScreen = name;
        document.body.dataset.screen = name;

        const next = this.screens.get(name);
        next?.show?.(payload);
    }

    getCurrentScreen() {
        return this.currentScreen;
    }
}