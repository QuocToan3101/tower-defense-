const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

const sandbox = {
    console,
    Math,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
};

sandbox.CONSTANTS = {
    CELL_SIZE: 1,
    SPAWN_INTERVAL_MS: 1000,
    ENEMY_COUNT_SCALE: 1,
    ENEMY_HP_SCALE: 1,
    ENEMY_SPEED_SCALE: 1,
    COLOR: {
        ENEMY_GOBLIN: '#88cc44',
        HP_BG: '#222222',
        HP_FULL: '#44cc44',
        HP_MID: '#ffcc33',
        HP_LOW: '#ff4444',
    },
};

const context = vm.createContext(sandbox);

function loadScript(relativeFilePath, exportNames) {
    const source = fs.readFileSync(path.join(ROOT, relativeFilePath), 'utf8');
    const exportBlock = `\nthis.__exports = { ${exportNames.join(', ')} };`;
    vm.runInContext(source + exportBlock, context, { filename: relativeFilePath });
    const exported = context.__exports;
    delete context.__exports;
    return exported;
}

const { eventBus } = loadScript('frontend/js/engine/EventBus.js', ['eventBus']);
sandbox.eventBus = eventBus;

const { Enemy } = loadScript('frontend/js/entities/Enemy.js', ['Enemy']);
sandbox.Enemy = Enemy;

const { WaveManager } = loadScript('frontend/js/engine/WaveManager.js', ['WaveManager']);

function resetListeners() {
    eventBus.clear();
}

function createEnemyDef(overrides = {}) {
    return {
        type: 'GOBLIN',
        name: 'Goblin',
        baseHp: 100,
        baseSpeed: 5,
        goldReward: 10,
        damageToPlayer: 1,
        armor: 0.25,
        ...overrides,
    };
}

function testEnemyMovementAndReach() {
    resetListeners();

    const reached = [];
    eventBus.on('enemy:reached', (enemy) => reached.push(enemy));

    const enemy = new Enemy(
        createEnemyDef({ baseSpeed: 5, armor: 0 }),
        [{ x: 0, y: 0 }, { x: 10, y: 0 }],
        1
    );

    enemy.update(1);
    assert.strictEqual(enemy.x, 5);
    assert.strictEqual(enemy.y, 0);
    assert.strictEqual(enemy.reached, false);

    enemy.update(1);
    assert.strictEqual(enemy.x, 10);
    assert.strictEqual(enemy.y, 0);
    assert.strictEqual(enemy.reached, true);
    assert.strictEqual(reached.length, 1);
    assert.strictEqual(reached[0], enemy);
}

function testEnemyDamageAndKill() {
    resetListeners();

    const killed = [];
    eventBus.on('enemy:killed', (enemy) => killed.push(enemy));

    const enemy = new Enemy(
        createEnemyDef({ armor: 0.25 }),
        [{ x: 0, y: 0 }, { x: 10, y: 0 }],
        1
    );

    enemy.takeDamage(40);
    assert.strictEqual(enemy.hp, 70);
    assert.strictEqual(enemy.alive, true);
    assert.strictEqual(killed.length, 0);

    enemy.takeDamage(120);
    assert.strictEqual(enemy.hp, 0);
    assert.strictEqual(enemy.alive, false);
    assert.strictEqual(killed.length, 1);
    assert.strictEqual(killed[0], enemy);
}

function testWaveSpawningAndCompletion() {
    resetListeners();

    const started = [];
    const completed = [];
    eventBus.on('wave:started', (wave) => started.push(wave));
    eventBus.on('wave:complete', (wave) => completed.push(wave));

    const levelData = {
        waypoints: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
        totalWaves: 1,
    };

    const waveManager = new WaveManager(levelData, [createEnemyDef()]);

    waveManager.startNextWave();
    assert.strictEqual(waveManager.currentWave, 1);
    assert.strictEqual(waveManager.waveActive, true);
    assert.deepStrictEqual(started, [1]);

    waveManager.update(1);

    assert.strictEqual(waveManager.enemies.length, 1);
    assert.strictEqual(waveManager.aliveEnemies.length, 1);
    assert.strictEqual(waveManager.waveComplete, false);

    waveManager._allSpawned = true;
    for (const enemy of waveManager.enemies) {
        enemy.alive = false;
    }

    waveManager.update(1);

    assert.strictEqual(waveManager.waveComplete, true);
    assert.strictEqual(waveManager.waveActive, false);
    assert.deepStrictEqual(completed, [1]);
}

function run() {
    const tests = [
        ['UC3-01 Enemy di chuyển và chạm đích', testEnemyMovementAndReach],
        ['UC3-02 Enemy nhận sát thương và chết', testEnemyDamageAndKill],
        ['UC3-03 WaveManager sinh quái và kết thúc wave', testWaveSpawningAndCompletion],
    ];

    console.log('Chay unit test UC3...');

    let passed = 0;
    for (const [name, testFn] of tests) {
        try {
            testFn();
            passed += 1;
            console.log(`[PASS] ${name}`);
        } catch (error) {
            console.error(`[FAIL] ${name}`);
            console.error(error);
            process.exitCode = 1;
            break;
        }
    }

    if (passed === tests.length) {
        console.log(`Tat ca unit test UC3 deu pass (${passed}/${tests.length}).`);
    }
}

run();