/**
 * maps.js
 * Level definitions for the campaign flow.
 * Each map provides a grid and waypoints for the battle engine.
 */

function createGrid(rows = CONSTANTS.GRID_ROWS, cols = CONSTANTS.GRID_COLS) {
    return Array.from({ length: rows }, () => Array(cols).fill(CONSTANTS.TILE.GRASS));
}

function cellCenter(col, row) {
    return {
        x: col * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE / 2,
        y: row * CONSTANTS.CELL_SIZE + CONSTANTS.CELL_SIZE / 2,
    };
}

function lineHorizontal(row, startCol, endCol) {
    const step = startCol <= endCol ? 1 : -1;
    const cells = [];

    for (let col = startCol; col !== endCol + step; col += step) {
        cells.push([col, row]);
    }

    return cells;
}

function lineVertical(col, startRow, endRow) {
    const step = startRow <= endRow ? 1 : -1;
    const cells = [];

    for (let row = startRow; row !== endRow + step; row += step) {
        cells.push([col, row]);
    }

    return cells;
}

function uniqueCells(cells) {
    const seen = new Set();
    const unique = [];

    for (const [col, row] of cells) {
        const key = `${col},${row}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push([col, row]);
    }

    return unique;
}

function buildMap(definition) {
    const grid = createGrid();
    const pathCells = uniqueCells(definition.pathCells);

    for (const [col, row] of pathCells) {
        grid[row][col] = CONSTANTS.TILE.PATH;
    }

    const waypoints = [definition.spawn];

    for (const [col, row] of pathCells) {
        waypoints.push(cellCenter(col, row));
    }

    waypoints.push(definition.exit);

    return Object.freeze({
        id: definition.id,
        key: definition.key,
        name: definition.name,
        difficulty: definition.difficulty,
        totalWaves: definition.totalWaves,
        grid,
        waypoints,
    });
}

function cloneMap(map) {
    if (typeof structuredClone === 'function') {
        return structuredClone(map);
    }

    return JSON.parse(JSON.stringify(map));
}

const MAPS = Object.freeze({
    level1: buildMap({
        id: 1,
        key: 'level1',
        name: 'Greenwood Pass',
        difficulty: 'Easy',
        totalWaves: 8,
        spawn: { x: -20, y: 140 },
        exit: { x: 820, y: 300 },
        pathCells: [
            ...lineHorizontal(3, 0, 6),
            ...lineVertical(6, 3, 5),
            ...lineHorizontal(5, 6, 11),
            ...lineVertical(11, 5, 7),
            ...lineHorizontal(7, 11, 19),
        ],
    }),
    level2: buildMap({
        id: 2,
        key: 'level2',
        name: 'Ashen Crossroads',
        difficulty: 'Normal',
        totalWaves: 10,
        spawn: { x: 100, y: -20 },
        exit: { x: 820, y: 100 },
        pathCells: [
            ...lineVertical(2, 0, 4),
            ...lineHorizontal(4, 2, 10),
            ...lineVertical(10, 4, 9),
            ...lineHorizontal(9, 10, 17),
            ...lineVertical(17, 9, 2),
            ...lineHorizontal(2, 17, 19),
        ],
    }),
    level3: buildMap({
        id: 3,
        key: 'level3',
        name: 'Frostbend Valley',
        difficulty: 'Hard',
        totalWaves: 12,
        spawn: { x: -20, y: 60 },
        exit: { x: 820, y: 140 },
        pathCells: [
            ...lineHorizontal(1, 0, 5),
            ...lineVertical(5, 1, 6),
            ...lineHorizontal(6, 5, 14),
            ...lineVertical(14, 6, 11),
            ...lineHorizontal(11, 14, 8),
            ...lineVertical(8, 11, 3),
            ...lineHorizontal(3, 8, 19),
        ],
    }),
    level4: buildMap({
        id: 4,
        key: 'level4',
        name: 'Obsidian Keep',
        difficulty: 'Nightmare',
        totalWaves: 14,
        spawn: { x: -20, y: 500 },
        exit: { x: 820, y: 100 },
        pathCells: [
            ...lineHorizontal(12, 0, 4),
            ...lineVertical(4, 12, 8),
            ...lineHorizontal(8, 4, 15),
            ...lineVertical(15, 8, 4),
            ...lineHorizontal(4, 15, 18),
            ...lineVertical(18, 4, 10),
            ...lineHorizontal(10, 18, 12),
            ...lineVertical(12, 10, 2),
            ...lineHorizontal(2, 12, 19),
        ],
    }),
    level5: buildMap({
        id: 5,
        key: 'level5',
        name: 'Serpent\'s Coil',
        difficulty: 'Normal',
        totalWaves: 9,
        spawn: { x: -20, y: 280 },
        exit: { x: 820, y: 280 },
        pathCells: [
            ...lineHorizontal(7, 0, 5),
            ...lineVertical(5, 7, 3),
            ...lineHorizontal(3, 5, 15),
            ...lineVertical(15, 3, 10),
            ...lineHorizontal(10, 15, 19),
        ],
    }),
    level6: buildMap({
        id: 6,
        key: 'level6',
        name: 'Mirror Maze',
        difficulty: 'Normal',
        totalWaves: 10,
        spawn: { x: 200, y: -20 },
        exit: { x: 200, y: 580 },
        pathCells: [
            ...lineVertical(5, 0, 3),
            ...lineHorizontal(3, 5, 12),
            ...lineVertical(12, 3, 8),
            ...lineHorizontal(8, 12, 2),
            ...lineVertical(2, 8, 13),
        ],
    }),
    level7: buildMap({
        id: 7,
        key: 'level7',
        name: 'Dragon\'s Lair',
        difficulty: 'Normal',
        totalWaves: 10,
        spawn: { x: -20, y: 400 },
        exit: { x: 820, y: 200 },
        pathCells: [
            ...lineHorizontal(10, 0, 7),
            ...lineVertical(7, 10, 5),
            ...lineHorizontal(5, 7, 18),
            ...lineVertical(18, 5, 8),
            ...lineHorizontal(8, 18, 3),
        ],
    }),
    level8: buildMap({
        id: 8,
        key: 'level8',
        name: 'Cursed Hollow',
        difficulty: 'Normal',
        totalWaves: 11,
        spawn: { x: 400, y: -20 },
        exit: { x: 400, y: 580 },
        pathCells: [
            ...lineVertical(10, 0, 2),
            ...lineHorizontal(2, 10, 4),
            ...lineVertical(4, 2, 7),
            ...lineHorizontal(7, 4, 16),
            ...lineVertical(16, 7, 11),
            ...lineHorizontal(11, 16, 9),
        ],
    }),
    level9: buildMap({
        id: 9,
        key: 'level9',
        name: 'Shattered Bridge',
        difficulty: 'Hard',
        totalWaves: 11,
        spawn: { x: -20, y: 240 },
        exit: { x: 820, y: 350 },
        pathCells: [
            ...lineHorizontal(6, 0, 3),
            ...lineVertical(3, 6, 9),
            ...lineHorizontal(9, 3, 10),
            ...lineVertical(10, 9, 3),
            ...lineHorizontal(3, 10, 18),
            ...lineVertical(18, 3, 8),
        ],
    }),
    level10: buildMap({
        id: 10,
        key: 'level10',
        name: 'Iron Fortress',
        difficulty: 'Hard',
        totalWaves: 12,
        spawn: { x: 300, y: -20 },
        exit: { x: 300, y: 580 },
        pathCells: [
            ...lineVertical(7, 0, 1),
            ...lineHorizontal(1, 7, 14),
            ...lineVertical(14, 1, 6),
            ...lineHorizontal(6, 14, 3),
            ...lineVertical(3, 6, 11),
            ...lineHorizontal(11, 3, 17),
        ],
    }),
    level11: buildMap({
        id: 11,
        key: 'level11',
        name: 'Twin Spirals',
        difficulty: 'Hard',
        totalWaves: 12,
        spawn: { x: -20, y: 140 },
        exit: { x: 820, y: 420 },
        pathCells: [
            ...lineHorizontal(2, 0, 4),
            ...lineVertical(4, 2, 6),
            ...lineHorizontal(6, 4, 12),
            ...lineVertical(12, 6, 10),
            ...lineHorizontal(10, 12, 18),
            ...lineVertical(18, 10, 3),
        ],
    }),
    level12: buildMap({
        id: 12,
        key: 'level12',
        name: 'Void Fragment',
        difficulty: 'Hard',
        totalWaves: 13,
        spawn: { x: 500, y: -20 },
        exit: { x: 500, y: 580 },
        pathCells: [
            ...lineVertical(9, 0, 2),
            ...lineHorizontal(2, 9, 5),
            ...lineVertical(5, 2, 8),
            ...lineHorizontal(8, 5, 15),
            ...lineVertical(15, 8, 3),
            ...lineHorizontal(3, 15, 2),
            ...lineVertical(2, 3, 12),
        ],
    }),
    level13: buildMap({
        id: 13,
        key: 'level13',
        name: 'Phantom\'s Gate',
        difficulty: 'Hard',
        totalWaves: 13,
        spawn: { x: -20, y: 280 },
        exit: { x: 820, y: 100 },
        pathCells: [
            ...lineHorizontal(4, 0, 6),
            ...lineVertical(6, 4, 9),
            ...lineHorizontal(9, 6, 2),
            ...lineVertical(2, 9, 3),
            ...lineHorizontal(3, 2, 16),
            ...lineVertical(16, 3, 10),
            ...lineHorizontal(10, 16, 18),
        ],
    }),
    level14: buildMap({
        id: 14,
        key: 'level14',
        name: 'Sorrow\'s Path',
        difficulty: 'Hard',
        totalWaves: 13,
        spawn: { x: 200, y: -20 },
        exit: { x: 600, y: 580 },
        pathCells: [
            ...lineVertical(4, 0, 3),
            ...lineHorizontal(3, 4, 11),
            ...lineVertical(11, 3, 10),
            ...lineHorizontal(10, 11, 6),
            ...lineVertical(6, 10, 2),
            ...lineHorizontal(2, 6, 15),
            ...lineVertical(15, 2, 8),
        ],
    }),
    level15: buildMap({
        id: 15,
        key: 'level15',
        name: 'Storm\'s Eye',
        difficulty: 'Nightmare',
        totalWaves: 14,
        spawn: { x: -20, y: 180 },
        exit: { x: 820, y: 450 },
        pathCells: [
            ...lineHorizontal(3, 0, 5),
            ...lineVertical(5, 3, 7),
            ...lineHorizontal(7, 5, 15),
            ...lineVertical(15, 7, 10),
            ...lineHorizontal(10, 15, 8),
            ...lineVertical(8, 10, 2),
            ...lineHorizontal(2, 8, 18),
        ],
    }),
    level16: buildMap({
        id: 16,
        key: 'level16',
        name: 'Reaper\'s Domain',
        difficulty: 'Nightmare',
        totalWaves: 14,
        spawn: { x: 100, y: -20 },
        exit: { x: 700, y: 580 },
        pathCells: [
            ...lineVertical(3, 0, 1),
            ...lineHorizontal(1, 3, 12),
            ...lineVertical(12, 1, 9),
            ...lineHorizontal(9, 12, 4),
            ...lineVertical(4, 9, 3),
            ...lineHorizontal(3, 4, 18),
            ...lineVertical(18, 3, 11),
        ],
    }),
    level17: buildMap({
        id: 17,
        key: 'level17',
        name: 'Abyss Door',
        difficulty: 'Nightmare',
        totalWaves: 15,
        spawn: { x: -20, y: 200 },
        exit: { x: 820, y: 350 },
        pathCells: [
            ...lineHorizontal(5, 0, 7),
            ...lineVertical(7, 5, 2),
            ...lineHorizontal(2, 7, 16),
            ...lineVertical(16, 2, 11),
            ...lineHorizontal(11, 16, 3),
            ...lineVertical(3, 11, 1),
            ...lineHorizontal(1, 3, 19),
        ],
    }),
    level18: buildMap({
        id: 18,
        key: 'level18',
        name: 'Infernal Pits',
        difficulty: 'Nightmare',
        totalWaves: 15,
        spawn: { x: 600, y: -20 },
        exit: { x: 200, y: 580 },
        pathCells: [
            ...lineVertical(11, 0, 3),
            ...lineHorizontal(3, 11, 5),
            ...lineVertical(5, 3, 10),
            ...lineHorizontal(10, 5, 17),
            ...lineVertical(17, 10, 2),
            ...lineHorizontal(2, 17, 4),
            ...lineVertical(4, 2, 11),
        ],
    }),
    level19: buildMap({
        id: 19,
        key: 'level19',
        name: 'Demon\'s Throne',
        difficulty: 'Nightmare',
        totalWaves: 15,
        spawn: { x: -20, y: 100 },
        exit: { x: 820, y: 500 },
        pathCells: [
            ...lineHorizontal(2, 0, 4),
            ...lineVertical(4, 2, 6),
            ...lineHorizontal(6, 4, 14),
            ...lineVertical(14, 6, 11),
            ...lineHorizontal(11, 14, 8),
            ...lineVertical(8, 11, 4),
            ...lineHorizontal(4, 8, 18),
            ...lineVertical(18, 4, 9),
        ],
    }),
    level20: buildMap({
        id: 20,
        key: 'level20',
        name: 'The Final Stand',
        difficulty: 'Nightmare',
        totalWaves: 16,
        spawn: { x: 400, y: -20 },
        exit: { x: 400, y: 580 },
        pathCells: [
            ...lineVertical(8, 0, 2),
            ...lineHorizontal(2, 8, 3),
            ...lineVertical(3, 2, 8),
            ...lineHorizontal(8, 3, 16),
            ...lineVertical(16, 8, 3),
            ...lineHorizontal(3, 16, 4),
            ...lineVertical(4, 3, 10),
            ...lineHorizontal(10, 4, 17),
        ],
    }),
});

function getMapByLevel(levelId) {
    const map = MAPS[`level${levelId}`];
    if (!map) throw new Error(`Map ${levelId} not found`);
    return cloneMap(map);
}

function getAllMaps() {
    return Object.values(MAPS).map(cloneMap);
}