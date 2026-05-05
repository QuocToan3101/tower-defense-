package com.towerdefense.repository;

import com.towerdefense.entity.GameSave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSaveRepository extends JpaRepository<GameSave, Long> {

    /** All saves belonging to a user, newest first. */
    List<GameSave> findByUserIdOrderBySavedAtDesc(Long userId);

    /** Find a specific save by user and save name (upsert support). */
    Optional<GameSave> findByUserIdAndSaveName(Long userId, String saveName);

    /** Count saves a user has (optional: cap slot count). */
    long countByUserId(Long userId);
}
