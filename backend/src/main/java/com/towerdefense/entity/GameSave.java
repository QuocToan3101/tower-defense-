package com.towerdefense.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "game_saves")
public class GameSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "save_name", nullable = false, length = 100)
    private String saveName;

    @Column(name = "player_hp", nullable = false)
    private int playerHp;

    @Column(name = "gold", nullable = false)
    private int gold;

    @Column(name = "current_wave", nullable = false)
    private int currentWave;

    @Column(name = "level_id", nullable = false)
    private int levelId;

    @Column(name = "towers_json", columnDefinition = "TEXT")
    private String towersJson;

    @Column(name = "saved_at", nullable = false)
    private LocalDateTime savedAt;

    public GameSave() {
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.savedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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