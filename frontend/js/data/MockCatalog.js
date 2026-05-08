/**
 * MockCatalog.js
 * Offline tower and enemy data for standalone gameplay
 */

class MockCatalog {
    static getTowers() {
        return [
            {
                id: 1,
                type: 'ARCHER',
                name: 'Archer Tower',
                baseCost: 100,
                baseDamage: 15,
                baseRange: 120,
                baseFireRate: 1.0,
                upgradeCost: 50,
                sellRatio: 0.75,
                description: 'Quick and deadly. Fires arrows at enemies.'
            },
            {
                id: 2,
                type: 'MAGE',
                name: 'Mage Tower',
                baseCost: 150,
                baseDamage: 25,
                baseRange: 100,
                baseFireRate: 0.8,
                upgradeCost: 75,
                sellRatio: 0.75,
                description: 'Casts spells that deal area damage.'
            },
            {
                id: 3,
                type: 'CANNON',
                name: 'Cannon Tower',
                baseCost: 200,
                baseDamage: 40,
                baseRange: 150,
                baseFireRate: 0.5,
                upgradeCost: 100,
                sellRatio: 0.75,
                description: 'Powerful shots with area effect.'
            },
            {
                id: 4,
                type: 'TESLA',
                name: 'Tesla Tower',
                baseCost: 250,
                baseDamage: 20,
                baseRange: 100,
                baseFireRate: 1.5,
                upgradeCost: 125,
                sellRatio: 0.75,
                description: 'Electric bolts jump between enemies.'
            }
        ];
    }

    static getEnemies() {
        return [
            {
                id: 1,
                type: 'GOBLIN',
                name: 'Goblin',
                baseHp: 20,
                baseSpeed: 1.2,
                goldReward: 10,
                damageToPlayer: 1,
                armor: 0,
                description: 'Fast but weak. Easy prey.'
            },
            {
                id: 2,
                type: 'ORC',
                name: 'Orc',
                baseHp: 50,
                baseSpeed: 0.8,
                goldReward: 25,
                damageToPlayer: 2,
                armor: 2,
                description: 'Stronger and slower. Good loot.'
            },
            {
                id: 3,
                type: 'DRAGON',
                name: 'Dragon',
                baseHp: 150,
                baseSpeed: 0.5,
                goldReward: 100,
                damageToPlayer: 5,
                armor: 5,
                description: 'The ultimate threat. Heavily armored.'
            },
            {
                id: 4,
                type: 'SKELETON',
                name: 'Skeleton',
                baseHp: 30,
                baseSpeed: 1.0,
                goldReward: 15,
                damageToPlayer: 1,
                armor: 1,
                description: 'Undead minion. Medium threat.'
            }
        ];
    }
}
