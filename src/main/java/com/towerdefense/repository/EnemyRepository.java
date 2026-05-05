package com.towerdefense.repository;

import com.towerdefense.entity.Enemy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnemyRepository extends JpaRepository<Enemy, Long> {
    Optional<Enemy> findByType(String type);
}
