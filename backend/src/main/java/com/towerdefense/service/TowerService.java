package com.towerdefense.service;

import com.towerdefense.dto.DeleteTowerRequest;
import com.towerdefense.dto.TowerDeleteResponse;
import com.towerdefense.dto.TowerUpgradeResponse;
import com.towerdefense.dto.UpgradeTowerRequest;
import com.towerdefense.entity.Tower;
import com.towerdefense.repository.TowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for tower management operations:
 * - Upgrade tower (increase level and improve stats)
 * - Delete/Sell tower (get refund based on sell ratio)
 */
@Service
public class TowerService {

    @Autowired
    private TowerRepository towerRepository;

    private static final int MAX_TOWER_LEVEL = 10;

    /**
     * Upgrade a placed tower to the next level.
     * Frontend tracks tower placements; this validates and returns upgrade info.
     */
    @Transactional(readOnly = true)
    public TowerUpgradeResponse upgradeTower(UpgradeTowerRequest request) {
        Tower tower = towerRepository.findById(request.getTowerId())
                .orElseThrow(() -> new IllegalArgumentException("Tower not found with ID: " + request.getTowerId()));

        int currentLevel = request.getCurrentLevel();

        // Validate current level
        if (currentLevel < 1 || currentLevel >= MAX_TOWER_LEVEL) {
            throw new IllegalArgumentException("Cannot upgrade tower at level " + currentLevel);
        }

        int newLevel = currentLevel + 1;

        // Calculate new stats (simplified formula: +10% per level)
        int newDamage = (int) (tower.getBaseDamage() * Math.pow(1.1, newLevel - 1));
        double newRange = tower.getBaseRange() * (1 + (newLevel - 1) * 0.05);
        double newFireRate = tower.getBaseFireRate() * (1 + (newLevel - 1) * 0.05);

        // Upgrade cost = base upgrade cost * level
        int upgradeCost = tower.getUpgradeCost() * currentLevel;

        return new TowerUpgradeResponse(
            tower.getId(),
            newLevel,
            newDamage,
            newRange,
            newFireRate,
            upgradeCost,
            "Tower upgraded to level " + newLevel
        );
    }

    /**
     * Delete/Sell a tower and return refund.
     * Refund = totalInvested * sellRatio
     */
    @Transactional(readOnly = true)
    public TowerDeleteResponse deleteTower(DeleteTowerRequest request) {
        Tower tower = towerRepository.findById(request.getTowerId())
                .orElseThrow(() -> new IllegalArgumentException("Tower not found with ID: " + request.getTowerId()));

        int level = request.getLevel();

        // Calculate total invested cost
        int totalInvested = tower.getBaseCost();
        for (int l = 1; l < level; l++) {
            totalInvested += tower.getUpgradeCost() * l;
        }

        // Calculate refund
        int goldRefunded = (int) (totalInvested * tower.getSellRatio());

        return new TowerDeleteResponse(
            tower.getId(),
            goldRefunded,
            "Tower sold for " + goldRefunded + " gold"
        );
    }
}
