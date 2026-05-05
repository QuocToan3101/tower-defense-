package com.towerdefense.dto;

import java.time.LocalDateTime;

public class GameSaveResponse {
    private Long id;
    private String saveName;
    private int playerHp;
    private int gold;
    private int currentWave;
    private int levelId;
    private String towersJson;
    private LocalDateTime savedAt;

    public GameSaveResponse() {
    }

    public GameSaveResponse(Long id, String saveName, int playerHp, int gold, int currentWave, int levelId,
                            String towersJson, LocalDateTime savedAt) {
        this.id = id;
        this.saveName = saveName;
        this.playerHp = playerHp;
        this.gold = gold;
        this.currentWave = currentWave;
        this.levelId = levelId;
        this.towersJson = towersJson;
        this.savedAt = savedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSaveName() { return saveName; }
    public void setSaveName(String saveName) { this.saveName = saveName; }
    public int getPlayerHp() { return playerHp; }
    public void setPlayerHp(int playerHp) { this.playerHp = playerHp; }
    public int getGold() { return gold; }
    public void setGold(int gold) { this.gold = gold; }
    public int getCurrentWave() { return currentWave; }
    public void setCurrentWave(int currentWave) { this.currentWave = currentWave; }
    public int getLevelId() { return levelId; }
    public void setLevelId(int levelId) { this.levelId = levelId; }
    public String getTowersJson() { return towersJson; }
    public void setTowersJson(String towersJson) { this.towersJson = towersJson; }
    public LocalDateTime getSavedAt() { return savedAt; }
    public void setSavedAt(LocalDateTime savedAt) { this.savedAt = savedAt; }
}
