/**
 * LevelData.js
 * Compatibility layer for the new maps data.
 */

function getLevelById(id) {
    return getMapByLevel(id);
}

function getAllLevels() {
    return getAllMaps();
}
