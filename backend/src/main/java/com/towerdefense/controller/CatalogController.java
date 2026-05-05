package com.towerdefense.controller;

import com.towerdefense.dto.*;
import com.towerdefense.service.CatalogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public catalog endpoints — no authentication required.
 * Provides the frontend with tower and enemy definitions.
 */
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    @Autowired
    private CatalogService catalogService;

    /** GET /api/catalog/towers — returns all tower type definitions. */
    @GetMapping("/towers")
    public ResponseEntity<ApiResponse<List<TowerResponse>>> getTowers() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllTowers()));
    }

    /** GET /api/catalog/enemies — returns all enemy type definitions. */
    @GetMapping("/enemies")
    public ResponseEntity<ApiResponse<List<EnemyResponse>>> getEnemies() {
        return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllEnemies()));
    }
}
