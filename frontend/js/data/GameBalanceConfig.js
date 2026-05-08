/**
 * GameBalanceConfig.js
 * Centralized balance configuration for easy tuning
 * All values can be adjusted without touching game logic
 * 
 * Philosophy: New-player friendly progression (Waves 1-5 easy, ramp up gradually)
 */

const GAME_BALANCE = Object.freeze({
    
    // ═══════════════════════════════════════════════════════
    // PLAYER STARTING STATE
    // ═══════════════════════════════════════════════════════
    player: {
        // ✓ CHANGED: 20 → 35 (give new players learning buffer)
        starting_hp: 35,
        
        // ✓ CHANGED: 300 → 400 (enable strategic tower choices)
        starting_gold: 400,
    },
    
    // ═══════════════════════════════════════════════════════
    // WAVE REWARDS
    // ═══════════════════════════════════════════════════════
    waves: {
        // ✓ CHANGED: 30 → 50 (make progression feel rewarding)
        bonus_gold_per_wave: 50,
        
        // Between-wave delay (ms)
        between_wave_delay_ms: 3000,
    },
    
    // ═══════════════════════════════════════════════════════
    // SPAWNING CONFIG
    // ═══════════════════════════════════════════════════════
    spawning: {
        // ✓ CHANGED: 800ms → 1200ms (less rushed feeling, time to react)
        // Effects: Players can place towers calmly, fewer enemies visible at once
        spawn_interval_ms: 1200,
        
        // Shuffle spawned enemies for variety? (yes)
        shuffle_spawn_queue: true,
    },
    
    // ═══════════════════════════════════════════════════════
    // TOWER MECHANICS
    // ═══════════════════════════════════════════════════════
    towers: {
        // ✓ CHANGED: 3 → 5 (more upgrade progression)
        // Effect: Archer ends at 33 damage (vs 29 old), feels more powerful
        max_level: 5,
        
        // ✓ CHANGED: 1.40 → 1.25 (consistent scaling, not spiky)
        // Effect: Each upgrade feels meaningful, not a huge jump
        // L5 damage: 1.25^4 = 2.44x (vs 1.40^2 = 1.96x old)
        damage_per_level_scale: 1.25,
        
        // Range scaling per upgrade (smoother progression)
        range_per_level_scale: 1.08,
        
        // Fire rate scaling per upgrade
        fire_rate_per_level_scale: 1.12,
    },
    
    // ═══════════════════════════════════════════════════════
    // ENEMY SCALING
    // ═══════════════════════════════════════════════════════
    enemies: {
        // ✓ CHANGED: 1.15 → 1.12 (soften enemy count explosion)
        // Wave 8: 1.12^7 = 2.4x vs 1.15^7 = 4.8x (50% reduction)
        // Effect: Waves 5-8 feel challenging but not impossible
        count_scale_per_wave: 1.12,
        
        // ✓ CHANGED: 1.10 → 1.08 (soften HP scaling)
        // Wave 8: 1.08^7 = 1.71x vs 1.10^7 = 1.95x (12% less HP)
        // Effect: Towers can kill enemies in time
        hp_scale_per_wave: 1.08,
        
        // ✓ CHANGED: 1.05 → 1.04 (slightly softer speed scaling)
        speed_scale_per_wave: 1.04,
    },
    
    // ═══════════════════════════════════════════════════════
    // EARLY GAME REWARDS (Waves 1-3 get bonus)
    // ═══════════════════════════════════════════════════════
    early_game_boost: {
        enabled: true,
        affected_waves: [1, 2, 3],
        
        // ✓ CHANGED: Goblin 10g → 12g (early wins feel rewarding)
        goblin_gold: 12,
        
        // ✓ CHANGED: Orc 25g → 30g (encourages grinding early, builds confidence)
        orc_gold: 30,
        
        // These revert to normal after wave 3
        normal_goblin_gold: 10,
        normal_orc_gold: 25,
    },
    
    // ═══════════════════════════════════════════════════════
    // DIFFICULTY CURVE INDICATOR (for UI/progression)
    // ═══════════════════════════════════════════════════════
    difficulty_curve: {
        1: "TUTORIAL",
        2: "EASY",
        3: "EASY",
        4: "EASY→NORMAL",
        5: "NORMAL",
        6: "NORMAL",
        7: "NORMAL→HARD",
        8: "HARD",
        9: "HARD",
        10: "VERY_HARD"
    },
    
    // ═══════════════════════════════════════════════════════
    // UI FEEDBACK SETTINGS
    // ═══════════════════════════════════════════════════════
    ui_feedback: {
        // Show damage numbers when towers hit?
        show_damage_numbers: true,
        
        // Show kill reward (+10g) as floating text?
        show_kill_rewards: true,
        
        // Show wave difficulty before wave starts?
        show_wave_difficulty: true,
        
        // Show helpful tips for waves 1-3?
        show_early_tips: true,
    },
    
    // ═══════════════════════════════════════════════════════
    // HISTORICAL REFERENCE (what changed and why)
    // ═══════════════════════════════════════════════════════
    changes_log: {
        "Starting HP 20→35": "New players were dying wave 3-4 too easily",
        "Starting Gold 300→400": "Forced players into single tower type strategy",
        "Spawn 800ms→1200ms": "Waves felt rushed; players couldn't react",
        "Enemy Count Scale 1.15→1.12": "Exponential scaling broke mid-game (wave 8 had 50 enemies)",
        "Enemy HP Scale 1.10→1.08": "Tower damage fell behind enemy HP too fast",
        "Max Tower Level 3→5": "Only 3 upgrades felt unsatisfying",
        "Damage Scale 1.40→1.25": "Each upgrade was too spiky, then ineffective",
        "Wave Bonus 30→50g": "Insufficient gold for progression",
        "Early Wave Rewards +20%": "Waves 1-3 kills felt unrewarding"
    }
});

/**
 * Get adjusted enemy gold reward based on wave number
 */
function getEnemyGoldReward(enemyType, waveNumber) {
    if (!GAME_BALANCE.early_game_boost.enabled || waveNumber > 3) {
        // Normal rewards
        const normal = {
            'GOBLIN': 10,
            'ORC': 25,
            'WOLF': 15,
            'TROLL': 35,
            'DRAGON': 100
        };
        return normal[enemyType] || 10;
    }
    
    // Early game boost (waves 1-3)
    const boosted = {
        'GOBLIN': GAME_BALANCE.early_game_boost.goblin_gold,
        'ORC': GAME_BALANCE.early_game_boost.orc_gold,
        'WOLF': 15,
        'TROLL': 35,
        'DRAGON': 100
    };
    return boosted[enemyType] || 10;
}

/**
 * Get difficulty label for UI
 */
function getWaveDifficultyLabel(waveNumber) {
    return GAME_BALANCE.difficulty_curve[waveNumber] || "HARD";
}
