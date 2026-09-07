-- VANGUARD: ZERO PostgreSQL Production Database Schema
-- Copyright (c) 2026 VANGUARD: ZERO. All Rights Reserved.

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    level INT DEFAULT 1,
    current_mmr INT DEFAULT 1000,
    rank_tier VARCHAR(32) DEFAULT 'Bronze',
    sub_division INT DEFAULT 1,
    rank_rating INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    assists INT DEFAULT 0,
    headshots INT DEFAULT 0,
    favorite_character VARCHAR(32) DEFAULT 'Nyx',
    favorite_weapon VARCHAR(32) DEFAULT 'Aether V'
);

CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    map_name VARCHAR(64) NOT NULL,
    game_mode VARCHAR(32) NOT NULL,
    winner_team VARCHAR(16) NOT NULL,
    attacker_score INT NOT NULL,
    defender_score INT NOT NULL,
    duration_seconds INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_players (
    match_id VARCHAR(64) REFERENCES matches(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    character_name VARCHAR(32) NOT NULL,
    team_role VARCHAR(16) NOT NULL,
    kills INT DEFAULT 0,
    deaths INT DEFAULT 0,
    assists INT DEFAULT 0,
    headshots INT DEFAULT 0,
    damage_dealt INT DEFAULT 0,
    score INT DEFAULT 0,
    mmr_change INT DEFAULT 0,
    PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS round_results (
    match_id VARCHAR(64) REFERENCES matches(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    winning_team VARCHAR(16) NOT NULL,
    win_reason VARCHAR(64) NOT NULL,
    core_planted BOOLEAN DEFAULT FALSE,
    core_defused BOOLEAN DEFAULT FALSE,
    planter_user_id VARCHAR(64),
    defuser_user_id VARCHAR(64),
    PRIMARY KEY (match_id, round_number)
);

CREATE TABLE IF NOT EXISTS friends (
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    friend_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(16) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(64) PRIMARY KEY,
    reporter_id VARCHAR(64) REFERENCES users(id),
    target_id VARCHAR(64) REFERENCES users(id),
    match_id VARCHAR(64) REFERENCES matches(id),
    category VARCHAR(32) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
