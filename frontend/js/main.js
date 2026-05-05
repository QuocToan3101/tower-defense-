document.addEventListener('DOMContentLoaded', () => {
    const apiClient = new ApiClient('http://localhost:8080');
    const unlockedLevelKey = 'td.unlockedLevel';

    const readUnlockedLevel = () => {
        const parsed = Number(localStorage.getItem(unlockedLevelKey) || '1');
        return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 4) : 1;
    };

    const unlockNextLevel = (completedLevelId) => {
        const nextLevel = Math.min(completedLevelId + 1, 4);
        const current = readUnlockedLevel();
        if (nextLevel > current) {
            localStorage.setItem(unlockedLevelKey, String(nextLevel));
        }
    };

    window.eventBus = (typeof eventBus !== 'undefined') ? eventBus : {
        emit: () => {},
        on: () => {}
    };

    const uiManager = new UIManager();
    const screenManager = new ScreenManager();
    const gameManager = new GameManager(apiClient, uiManager, {
        goToLevelSelect: () => screenManager.show('level'),
        onLevelCompleted: unlockNextLevel,
    });

    const startScreen = new StartScreen(document.getElementById('start-screen'), {
        onStartGame: () => screenManager.show('level'),
    });

    const levelSelectScreen = new LevelSelectScreen(document.getElementById('level-screen'), {
        onBack: () => screenManager.show('start'),
        onSelectLevel: (levelId) => {
            gameManager.setupLevel(levelId);
            gameManager.renderStatic();
            screenManager.show('game');
        },
        getUnlockedLevel: readUnlockedLevel,
    });

    const gameScreen = new GameScreen(document.getElementById('game-container'), {
        onBack: () => screenManager.show('level'),
    });

    screenManager.register('start', startScreen);
    screenManager.register('level', levelSelectScreen);
    screenManager.register('game', gameScreen);

    window.apiClient = apiClient;
    window.uiManager = uiManager;
    window.gameManager = gameManager;
    window.screenManager = screenManager;

    gameManager.bootstrap()
        .then(() => {
            screenManager.show('start');
        })
        .catch((error) => {
            console.error('Failed to initialize game:', error);
            screenManager.show('start');
        });
});
