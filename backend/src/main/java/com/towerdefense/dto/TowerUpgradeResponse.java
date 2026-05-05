package com.towerdefense.dto;

/**
 * Response after upgrading a tower.
 * Returns updated stats and new level.
 */
public class TowerUpgradeResponse {
    private Long towerId;
    private int newLevel;
    private int newDamage;
    private double newRange;
    private double newFireRate;
    private int upgradeCost;
    private String message;

    public TowerUpgradeResponse() {}

    public TowerUpgradeResponse(Long towerId, int newLevel, int newDamage, 
                                double newRange, double newFireRate, 
                                int upgradeCost, String message) {
        this.towerId = towerId;
        this.newLevel = newLevel;
        this.newDamage = newDamage;
        this.newRange = newRange;
        this.newFireRate = newFireRate;
        this.upgradeCost = upgradeCost;
        this.message = message;
    }

    // ─── Getters & Setters ────────────────────────────────

    public Long getTowerId() {
        return towerId;
    }

    public void setTowerId(Long towerId) {
        this.towerId = towerId;
    }

    public int getNewLevel() {
        return newLevel;
    }

    public void setNewLevel(int newLevel) {
        this.newLevel = newLevel;
    }

    public int getNewDamage() {
        return newDamage;
    }

    public void setNewDamage(int newDamage) {
        this.newDamage = newDamage;
    }

    public double getNewRange() {
        return newRange;
    }

    public void setNewRange(double newRange) {
        this.newRange = newRange;
    }

    public double getNewFireRate() {
        return newFireRate;
    }

    public void setNewFireRate(double newFireRate) {
        this.newFireRate = newFireRate;
    }

    public int getUpgradeCost() {
        return upgradeCost;
    }

    public void setUpgradeCost(int upgradeCost) {
        this.upgradeCost = upgradeCost;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
