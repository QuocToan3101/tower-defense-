package com.towerdefense.service;

import com.towerdefense.dto.EnemyResponse;
import com.towerdefense.dto.TowerResponse;
import com.towerdefense.entity.Enemy;
import com.towerdefense.entity.Tower;
import com.towerdefense.repository.EnemyRepository;
import com.towerdefense.repository.TowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Provides read-only access to the tower and enemy catalogs.
 * These are seeded once via SQL and consumed by the frontend
 * to drive game mechanics.
 */
@Service
public class CatalogService {

    @Autowired private TowerRepository towerRepository;
    @Autowired private EnemyRepository enemyRepository;

    @Transactional(readOnly = true)
    public List<TowerResponse> getAllTowers() {
        return towerRepository.findAll()
                .stream()
                .map(this::toTowerResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnemyResponse> getAllEnemies() {
        return enemyRepository.findAll()
                .stream()
                .map(this::toEnemyResponse)
                .collect(Collectors.toList());
    }

    // ─── Mappers ──────────────────────────────────────────

    private TowerResponse toTowerResponse(Tower t) {
        TowerResponse response = new TowerResponse();
        response.setId(t.getId());
        response.setType(t.getType());
        response.setName(t.getName());
        response.setBaseCost(t.getBaseCost());
        response.setBaseDamage(t.getBaseDamage());
        response.setBaseRange(t.getBaseRange());
        response.setBaseFireRate(t.getBaseFireRate());
        response.setUpgradeCost(t.getUpgradeCost());
        response.setSellRatio(t.getSellRatio());
        response.setDescription(t.getDescription());
        return response;
    }

    private EnemyResponse toEnemyResponse(Enemy e) {
        EnemyResponse response = new EnemyResponse();
        response.setId(e.getId());
        response.setType(e.getType());
        response.setName(e.getName());
        response.setBaseHp(e.getBaseHp());
        response.setBaseSpeed(e.getBaseSpeed());
        response.setGoldReward(e.getGoldReward());
        response.setDamageToPlayer(e.getDamageToPlayer());
        response.setArmor(e.getArmor());
        response.setDescription(e.getDescription());
        return response;
    }
}
