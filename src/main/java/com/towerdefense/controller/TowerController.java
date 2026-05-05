package com.towerdefense.controller;

import com.towerdefense.dto.*;
import com.towerdefense.service.TowerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Tower management endpoints.
 * Handles tower upgrades and deletions.
 */
@RestController
@RequestMapping("/api/tower")
public class TowerController {

    @Autowired
    private TowerService towerService;

    /**
     * POST /api/tower/upgrade
     * Upgrades a placed tower to the next level.
     * 
     * Request body:
     * {
     *   "towerId": 1,
     *   "currentLevel": 2
     * }
     * 
     * Response:
     * {
     *   "towerId": 1,
     *   "newLevel": 3,
     *   "newDamage": 132,
     *   "newRange": 5.5,
     *   "newFireRate": 1.1,
     *   "upgradeCost": 100,
     *   "message": "Tower upgraded to level 3"
     * }
     */
    @PostMapping("/upgrade")
    public ResponseEntity<ApiResponse<TowerUpgradeResponse>> upgradeTower(
            @RequestBody UpgradeTowerRequest request) {
        try {
            TowerUpgradeResponse response = towerService.upgradeTower(request);
            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Upgrade failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/tower/delete
     * Deletes/Sells a placed tower and returns refund.
     * 
     * Request body:
     * {
     *   "towerId": 1,
     *   "level": 2
     * }
     * 
     * Response:
     * {
     *   "towerId": 1,
     *   "goldRefunded": 360,
     *   "message": "Tower sold for 360 gold"
     * }
     */
    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<TowerDeleteResponse>> deleteTower(
            @RequestBody DeleteTowerRequest request) {
        try {
            TowerDeleteResponse response = towerService.deleteTower(request);
            return ResponseEntity.ok(ApiResponse.ok(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage()));
        }
    }
}
