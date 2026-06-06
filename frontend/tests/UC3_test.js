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
    window: {},
};

sandbox.CONSTANTS = {
    CELL_SIZE: 1,
    SPAWN_INTERVAL_MS: 1000,
    ENEMY_COUNT_SCALE: 1,
    ENEMY_HP_SCALE: 1,
    ENEMY_SPEED_SCALE: 1,
    MAX_TOWER_LEVEL: 5,
    UPGRADE_DMG_SCALE: 1.25,
    UPGRADE_RANGE_SCALE: 1.08,
    UPGRADE_RATE_SCALE: 1.12,
    COLOR: {
        ENEMY_GOBLIN: '#88cc44',
        HP_BG: '#222222',
        HP_FULL: '#44cc44',
        HP_MID: '#ffcc33',
        HP_LOW: '#ff4444',
        RANGE_RING_SELECTED: 'rgba(255,220,100,0.20)',
        UI_GOLD: '#f4d67a',
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

const { Projectile } = loadScript('frontend/js/entities/Projectile.js', ['Projectile']);
sandbox.Projectile = Projectile;

const { BaseTower, FrostTower, SplashTower, AuraTower, TowerFactory, TargetingStrategies, TowerState } = loadScript(
    'frontend/js/entities/Tower.js',
    ['BaseTower', 'FrostTower', 'SplashTower', 'AuraTower', 'TowerFactory', 'TargetingStrategies', 'TowerState']
);
sandbox.BaseTower = BaseTower;
sandbox.FrostTower = FrostTower;
sandbox.SplashTower = SplashTower;
sandbox.AuraTower = AuraTower;
sandbox.TowerFactory = TowerFactory;
sandbox.TargetingStrategies = TargetingStrategies;
sandbox.TowerState = TowerState;

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

function createTowerDef(overrides = {}) {
    return {
        type: 'ARCHER',
        name: 'Archer Tower',
        baseCost: 100,
        baseDamage: 20,
        baseRange: 100,
        baseFireRate: 1.0,
        upgradeCost: 50,
        sellRatio: 0.6,
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

// Keep UC3-02 test
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

// Keep UC3-03 test
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

// UC3-04: Tower Auto-Attack & FSM States
function testTowerAutoAttackAndFSM() {
    resetListeners();

    const tower = TowerFactory.create(createTowerDef({ baseRange: 10 }), 0, 0);

    // Initial state: SEARCHING
    assert.strictEqual(tower.state, TowerState.SEARCHING);

    // Update with no enemies: state should transition to IDLE (since pickTarget is null)
    let proj = tower.update([], 1);
    assert.strictEqual(tower.state, TowerState.IDLE);
    assert.strictEqual(proj, null);

    // Update IDLE state with one enemy out of range (range = 10, enemy is at x=20, y=0)
    const enemyOutOfRange = new Enemy(createEnemyDef(), [{ x: 20, y: 0 }], 1);
    proj = tower.update([enemyOutOfRange], 1);
    // First update: IDLE -> SEARCHING (because enemies.length > 0)
    assert.strictEqual(tower.state, TowerState.SEARCHING);
    assert.strictEqual(proj, null);

    proj = tower.update([enemyOutOfRange], 1);
    // Second update: SEARCHING -> IDLE (because no target in range)
    assert.strictEqual(tower.state, TowerState.IDLE);
    assert.strictEqual(proj, null);

    // Update with one enemy in range (at x=5, y=0)
    const enemyInRange = new Enemy(createEnemyDef(), [{ x: 5, y: 0 }], 1);
    proj = tower.update([enemyInRange], 1);
    // First update from IDLE: IDLE -> SEARCHING
    assert.strictEqual(tower.state, TowerState.SEARCHING);
    assert.strictEqual(proj, null);

    proj = tower.update([enemyInRange], 1);
    // Second update: SEARCHING -> ATTACKING
    assert.strictEqual(tower.state, TowerState.ATTACKING);
    assert.strictEqual(proj, null);

    proj = tower.update([enemyInRange], 1);
    // Third update: ATTACKING -> fires -> COOLDOWN
    assert.strictEqual(tower.state, TowerState.COOLDOWN);
    assert.ok(proj instanceof Projectile);
    assert.strictEqual(proj.target, enemyInRange);
    assert.strictEqual(proj.damage, 20);
    assert.strictEqual(tower._fireCooldown, 1.0); // 1 / baseFireRate = 1 / 1.0 = 1.0

    // Update during COOLDOWN: cooldown decreases
    proj = tower.update([enemyInRange], 0.4);
    assert.strictEqual(tower.state, TowerState.COOLDOWN);
    assert.ok(Math.abs(tower._fireCooldown - 0.6) < 0.001);
    assert.strictEqual(proj, null);

    // Update finishing COOLDOWN: state should go back to SEARCHING
    proj = tower.update([enemyInRange], 0.6);
    assert.strictEqual(tower.state, TowerState.SEARCHING);
    assert.strictEqual(proj, null);

    // Next update: SEARCHING -> ATTACKING
    proj = tower.update([enemyInRange], 1);
    assert.strictEqual(tower.state, TowerState.ATTACKING);
    assert.strictEqual(proj, null);

    // Next update: ATTACKING -> fires -> COOLDOWN
    proj = tower.update([enemyInRange], 1);
    assert.strictEqual(tower.state, TowerState.COOLDOWN);
    assert.ok(proj instanceof Projectile);
}

// UC3-05: Targeting Strategies (FIRST, STRONGEST, WEAKEST)
function testTargetingStrategies() {
    const tower = TowerFactory.create(createTowerDef({ baseRange: 100 }), 0, 0);

    // Create 3 enemies
    const enemyA = new Enemy(createEnemyDef({ baseHp: 50 }), [{ x: 10, y: 0 }], 1);
    enemyA.distanceTravelled = 30;

    const enemyB = new Enemy(createEnemyDef({ baseHp: 150 }), [{ x: 20, y: 0 }], 1);
    enemyB.distanceTravelled = 50;

    const enemyC = new Enemy(createEnemyDef({ baseHp: 80 }), [{ x: 30, y: 0 }], 1);
    enemyC.distanceTravelled = 20;

    const enemies = [enemyA, enemyB, enemyC];

    // 1. FIRST strategy (selects enemy with maximum distanceTravelled)
    tower.setStrategy('FIRST');
    let target = tower._pickTarget(enemies);
    assert.strictEqual(target, enemyB);

    // 2. STRONGEST strategy (selects enemy with maximum HP)
    tower.setStrategy('STRONGEST');
    target = tower._pickTarget(enemies);
    assert.strictEqual(target, enemyB);

    // 3. WEAKEST strategy (selects enemy with minimum HP)
    tower.setStrategy('WEAKEST');
    target = tower._pickTarget(enemies);
    assert.strictEqual(target, enemyA);
}

// UC3-06: AuraTower damage buff application
function testAuraTowerBuff() {
    const auraTower = TowerFactory.create(createTowerDef({ type: 'AURA', baseRange: 100 }), 0, 0);
    const archerTower = TowerFactory.create(createTowerDef({ type: 'ARCHER' }), 50, 0); // within range 100
    const mageTower = TowerFactory.create(createTowerDef({ type: 'MAGE' }), 150, 0); // out of range 100

    const allTowers = [auraTower, archerTower, mageTower];

    // Initial state: not buffed
    assert.strictEqual(archerTower.isBuffed, undefined);
    assert.strictEqual(mageTower.isBuffed, undefined);

    // Apply buff
    auraTower.applyBuff(allTowers);

    // Archer should be buffed
    assert.strictEqual(archerTower.isBuffed, true);
    assert.strictEqual(archerTower.buffedDamage, archerTower.damage * 1.2);

    // Mage should be unbuffed
    assert.strictEqual(mageTower.isBuffed, false);

    // Move Archer tower out of range and apply buff again
    archerTower.x = 120;
    auraTower.applyBuff(allTowers);

    // Archer should no longer be buffed
    assert.strictEqual(archerTower.isBuffed, false);
}

// UC3-07: Projectile hit damage calculation (normal vs magic, armor calculation)
function testProjectileDamageCalculation() {
    // Enemy with armor = 0.25 (25% damage reduction)
    const enemy = new Enemy(createEnemyDef({ armor: 0.25 }), [{ x: 10, y: 0 }], 1);

    // 1. Normal damage projectile (affected by armor)
    enemy.hp = 100;
    const normalProj = new Projectile(0, 0, enemy, 40, 350, '#ff0', 'normal');
    normalProj._applyHit();
    // expected damage = Math.round(40 * (1 - 0.25)) = 30
    assert.strictEqual(enemy.hp, 70);

    // 2. Magic damage projectile (ignores armor)
    enemy.hp = 100;
    const magicProj = new Projectile(0, 0, enemy, 40, 350, '#f0f', 'magic');
    magicProj._applyHit();
    // expected damage = 40 (armor ignored)
    assert.strictEqual(enemy.hp, 60);
}

// UC3-08: Projectile freeze slow effect application
function testProjectileSlowEffect() {
    const enemy = new Enemy(createEnemyDef(), [{ x: 10, y: 0 }], 1);
    
    // Check initial slow status
    assert.strictEqual(enemy.slowFactor, 1.0);
    assert.strictEqual(enemy.slowTimer, 0);

    // Create projectile with slow effect (like from FrostTower)
    const extras = { slow: { factor: 0.6, duration: 2.0 } };
    const iceProj = new Projectile(0, 0, enemy, 10, 350, '#0ff', 'magic', extras);
    iceProj._applyHit();

    // Verify slow effect is applied to enemy
    assert.strictEqual(enemy.slowFactor, 0.6);
    assert.strictEqual(enemy.slowTimer, 2.0);
}

function run() {
    const tests = [
        ['UC3-01 Enemy di chuyển và chạm đích', testEnemyMovementAndReach],
        ['UC3-02 Enemy nhận sát thương và chết', testEnemyDamageAndKill],
        ['UC3-03 WaveManager sinh quái và kết thúc wave', testWaveSpawningAndCompletion],
        ['UC3-04 Tháp tự động tấn công & FSM', testTowerAutoAttackAndFSM],
        ['UC3-05 Chiến thuật ngắm bắn (FIRST, STRONGEST, WEAKEST)', testTargetingStrategies],
        ['UC3-06 Tháp Aura gia tăng sức mạnh đồng minh', testAuraTowerBuff],
        ['UC3-07 Sát thương vật lý vs sát thương phép', testProjectileDamageCalculation],
        ['UC3-08 Hiệu ứng làm chậm từ đạn tháp băng', testProjectileSlowEffect],
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