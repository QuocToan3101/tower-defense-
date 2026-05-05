package com.towerdefense.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Catalog entry describing a tower type's base stats.
 * Actual in-game placements are stored as JSON in GameSave.
 */
@Entity
@Table(name = "towers")
public class Tower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** E.g. "ARCHER", "CANNON", "MAGE". */
    @Column(nullable = false, unique = true, length = 50)
    private String type;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private int baseCost;

    @Column(nullable = false)
    private int baseDamage;

    @Column(name = "base_range", nullable = false)
    private double baseRange;

    /** Attacks per second at level 1. */
    @Column(name = "base_fire_rate", nullable = false)
    private double baseFireRate;

    /** Gold cost to upgrade each level. */
    @Column(name = "upgrade_cost", nullable = false)
    private int upgradeCost;

    /** Percentage of base cost returned on sell. */
    @Column(name = "sell_ratio", nullable = false)
    private double sellRatio;

    @Column(columnDefinition = "TEXT")
    private String description;

    public Tower() {
    }

    public Tower(Long id, String type, String name, int baseCost, int baseDamage, double baseRange,
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