package com.towerdefense.dto;

public class TowerResponse {
    private Long id;
    private String type;
    private String name;
    private int baseCost;
    private int baseDamage;
    private double baseRange;
    private double baseFireRate;
    private int upgradeCost;
    private double sellRatio;
    private String description;

    public TowerResponse() {
    }

    public TowerResponse(Long id, String type, String name, int baseCost, int baseDamage, double baseRange,
                         double baseFireRate, int upgradeCost, double sellRatio, String description) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.baseCost = baseCost;
        this.baseDamage = baseDamage;
        this.baseRange = baseRange;
        this.baseFireRate = baseFireRate;
        this.upgradeCost = upgradeCost;
        this.sellRatio = sellRatio;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getBaseCost() { return baseCost; }
    public void setBaseCost(int baseCost) { this.baseCost = baseCost; }
    public int getBaseDamage() { return baseDamage; }
    public void setBaseDamage(int baseDamage) { this.baseDamage = baseDamage; }
    public double getBaseRange() { return baseRange; }
    public void setBaseRange(double baseRange) { this.baseRange = baseRange; }
    public double getBaseFireRate() { return baseFireRate; }
    public void setBaseFireRate(double baseFireRate) { this.baseFireRate = baseFireRate; }
    public int getUpgradeCost() { return upgradeCost; }
    public void setUpgradeCost(int upgradeCost) { this.upgradeCost = upgradeCost; }
    public double getSellRatio() { return sellRatio; }
    public void setSellRatio(double sellRatio) { this.sellRatio = sellRatio; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
