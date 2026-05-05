package com.towerdefense.dto;

/**
 * Request to delete/sell a placed tower.
 */
public class DeleteTowerRequest {
    private Long towerId;       // Tower catalog ID (type reference)
    private int level;          // Tower level (for calculating sell value)

    public DeleteTowerRequest() {}

    public DeleteTowerRequest(Long towerId, int level) {
        this.towerId = towerId;
        this.level = level;
    }

    // ─── Getters & Setters ────────────────────────────────

    public Long getTowerId() {
        return towerId;
    }

    public void setTowerId(Long towerId) {
        this.towerId = towerId;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }
}
