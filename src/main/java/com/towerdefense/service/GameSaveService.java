package com.towerdefense.service;

import com.towerdefense.dto.GameSaveResponse;
import com.towerdefense.dto.SaveGameRequest;
import com.towerdefense.entity.GameSave;
import com.towerdefense.entity.User;
import com.towerdefense.repository.GameSaveRepository;
import com.towerdefense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for saving and loading game state.
 */
@Service
public class GameSaveService {

    private static final int MAX_SAVE_SLOTS = 5;

    @Autowired private GameSaveRepository gameSaveRepository;
    @Autowired private UserRepository userRepository;

    /**
     * Saves (or overwrites) a game state for the authenticated user.
     * If a save with the same name already exists it is updated (upsert).
     */
    @Transactional
    public GameSaveResponse save(String username, SaveGameRequest request) {
        User user = findUser(username);

        // Upsert: overwrite existing slot with same name, or create new one
        GameSave gameSave = gameSaveRepository
                .findByUserIdAndSaveName(user.getId(), request.getSaveName())
                .orElse(new GameSave());

        // Enforce save-slot cap only when creating a new record
        if (gameSave.getId() == null && gameSaveRepository.countByUserId(user.getId()) >= MAX_SAVE_SLOTS) {
            throw new IllegalStateException("Maximum save slots (" + MAX_SAVE_SLOTS + ") reached.");
        }

        gameSave.setUser(user);
        gameSave.setSaveName(request.getSaveName());
        gameSave.setPlayerHp(request.getPlayerHp());
        gameSave.setGold(request.getGold());
        gameSave.setCurrentWave(request.getCurrentWave());
        gameSave.setLevelId(request.getLevelId());
        gameSave.setTowersJson(request.getTowersJson());

        gameSave = gameSaveRepository.save(gameSave);
        return toResponse(gameSave);
    }

    /** Returns all save slots for the authenticated user. */
    @Transactional(readOnly = true)
    public List<GameSaveResponse> listSaves(String username) {
        User user = findUser(username);
        return gameSaveRepository.findByUserIdOrderBySavedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** Returns a single save by its ID, verifying ownership. */
    @Transactional(readOnly = true)
    public GameSaveResponse loadById(String username, Long saveId) {
        User user = findUser(username);
        GameSave save = gameSaveRepository.findById(saveId)
                .orElseThrow(() -> new IllegalArgumentException("Save not found: " + saveId));

        if (!save.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to save #" + saveId);
        }

        return toResponse(save);
    }

    /** Deletes a save slot, verifying ownership. */
    @Transactional
    public void delete(String username, Long saveId) {
        User user = findUser(username);
        GameSave save = gameSaveRepository.findById(saveId)
                .orElseThrow(() -> new IllegalArgumentException("Save not found: " + saveId));

        if (!save.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied to save #" + saveId);
        }

        gameSaveRepository.delete(save);
    }

    // ─── Helpers ──────────────────────────────────────────

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    private GameSaveResponse toResponse(GameSave gs) {
        GameSaveResponse response = new GameSaveResponse();
        response.setId(gs.getId());
        response.setSaveName(gs.getSaveName());
        response.setPlayerHp(gs.getPlayerHp());
        response.setGold(gs.getGold());
        response.setCurrentWave(gs.getCurrentWave());
        response.setLevelId(gs.getLevelId());
        response.setTowersJson(gs.getTowersJson());
        response.setSavedAt(gs.getSavedAt());
        return response;
    }
}
