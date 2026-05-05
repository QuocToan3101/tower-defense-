package com.towerdefense.dto;

/**
 * Request to upgrade a placed tower.
 */
public class UpgradeTowerRequest {
    private Long towerId;       // Tower catalog ID (type reference)
    private int currentLevel;   // Current level (for validation)

    public UpgradeTowerRequest() {}

    public UpgradeTowerRequest(Long towerId, int currentLevel) {
        this.towerId = towerId;
        this.currentLevel = currentLevel;
    }

    // ─── Getters & Setters ────────────────────────────────

    public Long getTowerId() {
        return towerId;
    }

    public void setTowerId(Long towerId) {
        this.towerId = towerId;
    }

    public int getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(int currentLevel) {
        this.currentLevel = currentLevel;
    }
}
