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
});

function getMapByLevel(levelId) {
    const map = MAPS[`level${levelId}`];
    if (!map) throw new Error(`Map ${levelId} not found`);
    return cloneMap(map);
}

function getAllMaps() {
    return Object.values(MAPS).map(cloneMap);
}