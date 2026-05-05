package com.towerdefense.dto;

/**
 * Response after deleting/selling a tower.
 * Returns the gold refunded.
 */
public class TowerDeleteResponse {
    private Long towerId;
    private int goldRefunded;
    private String message;

    public TowerDeleteResponse() {}

    public TowerDeleteResponse(Long towerId, int goldRefunded, String message) {
        this.towerId = towerId;
        this.goldRefunded = goldRefunded;
        this.message = message;
    }

    // ─── Getters & Setters ────────────────────────────────

    public Long getTowerId() {
        return towerId;
    }

    public void setTowerId(Long towerId) {
        this.towerId = towerId;
    }

    public int getGoldRefunded() {
        return goldRefunded;
    }

    public void setGoldRefunded(int goldRefunded) {
        this.goldRefunded = goldRefunded;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
