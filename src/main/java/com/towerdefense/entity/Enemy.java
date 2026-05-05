package com.towerdefense.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Catalog entry for enemy types used by the wave system.
 */
@Entity
@Table(name = "enemies")
public class Enemy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** E.g. "GOBLIN", "ORC", "DRAGON". */
    @Column(nullable = false, unique = true, length = 50)
    private String type;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "base_hp", nullable = false)
    private int baseHp;

    @Column(name = "base_speed", nullable = false)
    private double baseSpeed;

    /** Gold awarded to the player on kill. */
    @Column(name = "gold_reward", nullable = false)
    private int goldReward;

    /** Damage dealt to the player when reaching the end. */
    @Column(name = "damage_to_player", nullable = false)
    private int damageToPlayer;

    @Column(name = "armor", nullable = false)
    private double armor;

    @Column(columnDefinition = "TEXT")
    private String description;

    public Enemy() {
    }

    public Enemy(Long id, String type, String name, int baseHp, double baseSpeed, int goldReward,
                 int damageToPlayer, double armor, String description) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.baseHp = baseHp;
        this.baseSpeed = baseSpeed;
        this.goldReward = goldReward;
        this.damageToPlayer = damageToPlayer;
        this.armor = armor;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getBaseHp() { return baseHp; }
    public void setBaseHp(int baseHp) { this.baseHp = baseHp; }
    public double getBaseSpeed() { return baseSpeed; }
    public void setBaseSpeed(double baseSpeed) { this.baseSpeed = baseSpeed; }
    public int getGoldReward() { return goldReward; }
    public void setGoldReward(int goldReward) { this.goldReward = goldReward; }
    public int getDamageToPlayer() { return damageToPlayer; }
    public void setDamageToPlayer(int damageToPlayer) { this.damageToPlayer = damageToPlayer; }
    public double getArmor() { return armor; }
    public void setArmor(double armor) { this.armor = armor; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}