package com.towerdefense.repository;

import com.towerdefense.entity.Tower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TowerRepository extends JpaRepository<Tower, Long> {
    Optional<Tower> findByType(String type);
}
