package com.towerdefense.controller;

import com.towerdefense.dto.*;
import com.towerdefense.service.GameSaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for game save/load operations.
 * All endpoints require a valid Bearer JWT.
 */
@RestController
@RequestMapping("/api/saves")
public class GameSaveController {

    @Autowired
    private GameSaveService gameSaveService;

    /**
     * POST /api/saves
     * Creates or overwrites a save slot for the authenticated user.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<GameSaveResponse>> save(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SaveGameRequest request) {
        try {
            GameSaveResponse saved = gameSaveService.save(userDetails.getUsername(), request);
            return ResponseEntity.ok(ApiResponse.ok("Game saved successfully", saved));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/saves
     * Lists all save slots for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<GameSaveResponse>>> listSaves(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<GameSaveResponse> saves = gameSaveService.listSaves(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(saves));
    }

    /**
     * GET /api/saves/{id}
     * Loads a specific save slot by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GameSaveResponse>> load(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            GameSaveResponse save = gameSaveService.loadById(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.ok(save));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/saves/{id}
     * Deletes a save slot.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        try {
            gameSaveService.delete(userDetails.getUsername(), id);
            return ResponseEntity.ok(ApiResponse.ok("Save deleted", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }
}
