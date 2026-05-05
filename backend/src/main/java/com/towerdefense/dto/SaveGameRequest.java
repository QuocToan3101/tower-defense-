package com.towerdefense.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

// ─── Save Game Request ──────────────────────────────────────

public class SaveGameRequest {

    @NotBlank(message = "Save name is required")
    private String saveName;

    @Min(value = 0, message = "HP cannot be negative")
    private int playerHp;

    @Min(value = 0, message = "Gold cannot be negative")
    private int gold;

    @Min(value = 1, message = "Wave must be at least 1")
    private int currentWave;

    @Min(value = 1, message = "Level ID must be at least 1")
    private int levelId;

    /** JSON string representing tower placements from the frontend. */
    private String towersJson;

    public SaveGameRequest() {
    }

    public SaveGameRequest(String saveName, int playerHp, int gold, int currentWave, int levelId, String towersJson) {
        this.saveName = saveName;
        this.playerHp = playerHp;
        this.gold = gold;
        this.currentWave = currentWave;
        this.levelId = levelId;
        this.towersJson = towersJson;
    }

    public String getSaveName() {
        return saveName;
    }

    public void setSaveName(String saveName) {
        this.saveName = saveName;
    }

    public int getPlayerHp() {
        return playerHp;
    }

    public void setPlayerHp(int playerHp) {
        this.playerHp = playerHp;
    }

    public int getGold() {
        return gold;
    }

    public void setGold(int gold) {
        this.gold = gold;
    }

    public int getCurrentWave() {
        return currentWave;
    }

    public void setCurrentWave(int currentWave) {
        this.currentWave = currentWave;
    }

    public int getLevelId() {
        return levelId;
    }

    public void setLevelId(int levelId) {
        this.levelId = levelId;
    }

    public String getTowersJson() {
        return towersJson;
    }

    public void setTowersJson(String towersJson) {
        this.towersJson = towersJson;
    }
}
