// ════════════════════════════════════════════════════════════════════
//  Global Error Handler (catches uncaught JS errors)
// ════════════════════════════════════════════════════════════════════
window.addEventListener('error', (event) => {
    const msg = `🔥 Uncaught JavaScript error: ${event.message}`;
    console.error(msg, event.error);
    if (window.electronLog?.error) {
        window.electronLog.error('UNCAUGHT_ERROR', { message: event.message, stack: event.error?.stack });
    }
    if (window.logError) window.logError('UNCAUGHT_ERROR', event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    const msg = `🔥 Unhandled promise rejection: ${event.reason}`;
    console.error(msg);
    if (window.electronLog?.error) {
        window.electronLog.error('UNHANDLED_REJECTION', { reason: event.reason });
    }
    if (window.logError) window.logError('UNHANDLED_REJECTION', String(event.reason), event);
});

// ════════════════════════════════════════════════════════════════════
//  Initialization
// ════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing game...');
    if (window.logWarning) window.logWarning('DOM content loaded, starting initialization');

    try {
        // ─ Check required global bindings exposed by classic scripts
        const requiredBindings = {
            ApiClient: typeof ApiClient !== 'undefined' ? ApiClient : undefined,
            UIManager: typeof UIManager !== 'undefined' ? UIManager : undefined,
            ScreenManager: typeof ScreenManager !== 'undefined' ? ScreenManager : undefined,
            GameManager: typeof GameManager !== 'undefined' ? GameManager : undefined,
            StartScreen: typeof StartScreen !== 'undefined' ? StartScreen : undefined,
            LevelSelectScreen: typeof LevelSelectScreen !== 'undefined' ? LevelSelectScreen : undefined,
            GameScreen: typeof GameScreen !== 'undefined' ? GameScreen : undefined,
        };

        const missing = Object.entries(requiredBindings)
            .filter(([, binding]) => typeof binding === 'undefined')
            .map(([name]) => name);

        if (missing.length > 0) {
            const errorMsg = `Missing required classes: ${missing.join(', ')}`;
            throw new Error(errorMsg);
        }
        console.log('✅ All required classes loaded');

        // ─ Initialize managers
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

        console.log('🎮 Creating managers...');
        const uiManager = new UIManager();
        const screenManager = new ScreenManager();
        const gameManager = new GameManager(apiClient, uiManager, {
            goToLevelSelect: () => screenManager.show('level'),
            onLevelCompleted: unlockNextLevel,
        });

        console.log('🖥️ Creating screens...');
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

        console.log('📋 Registering screens...');
        screenManager.register('start', startScreen);
        screenManager.register('level', levelSelectScreen);
        screenManager.register('game', gameScreen);

        // ─ Expose to global scope for debugging
        window.apiClient = apiClient;
        window.uiManager = uiManager;
        window.gameManager = gameManager;
        window.screenManager = screenManager;

        console.log('⚙️ Bootstrapping game manager...');
        gameManager.bootstrap()
            .then(() => {
                console.log('✨ Game bootstrap complete, showing start screen');
                screenManager.show('start');
                // Hide error display on success
                const errorDisplay = document.getElementById('error-display');
                if (errorDisplay) errorDisplay.classList.add('hidden');
            })
            .catch((error) => {
                console.error('❌ Failed to bootstrap game:', error);
                if (window.logError) window.logError('BOOTSTRAP_ERROR', error.message, error);
                // Show start screen even if bootstrap fails
                screenManager.show('start');
            });

    } catch (error) {
        const errorMsg = `🔥 Fatal initialization error: ${error.message}`;
        console.error(errorMsg);
        console.error('Stack:', error.stack);
        
        if (window.logError) {
            window.logError('FATAL_INIT_ERROR', error.message, { stack: error.stack });
        }

        // Show error message to user with better formatting
        setTimeout(() => {
            const errorDisplay = document.getElementById('error-display');
            const errorMessage = document.getElementById('error-message');
            const errorDetails = document.getElementById('error-details');
            
            if (errorDisplay && errorMessage) {
                errorMessage.textContent = `Fatal Error: ${error.message}`;
                if (errorDetails) {
                    errorDetails.innerHTML = `<pre style="text-align:left; overflow-x: auto;">${error.stack}</pre>`;
                }
                errorDisplay.classList.remove('hidden');
            } else {
                // Fallback if error display not available
                document.body.innerHTML = `
                    <div style="color: #e05050; padding: 20px; font-family: monospace; background: #0a0c12;">
                        <h2>Game Failed to Load</h2>
                        <p>Error: ${error.message}</p>
                        <pre>${error.stack}</pre>
                        <p style="margin-top: 20px; color: #a09880;">
                            Check browser console (F12) for more details.
                            Log file: %USERPROFILE%\\.towerdefense\\logs
                        </p>
                    </div>
                `;
            }
        }, 0);
    }
});
