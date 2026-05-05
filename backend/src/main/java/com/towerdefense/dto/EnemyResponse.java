package com.towerdefense.dto;

public class EnemyResponse {
    private Long id;
    private String type;
    private String name;
    private int baseHp;
    private double baseSpeed;
    private int goldReward;
    private int damageToPlayer;
    private double armor;
    private String description;

    public EnemyResponse() {
    }

    public EnemyResponse(Long id, String type, String name, int baseHp, double baseSpeed, int goldReward,
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