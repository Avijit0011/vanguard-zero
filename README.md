# VANGUARD: ZERO — 5v5 Tactical Hero FPS

**VANGUARD: ZERO** is a competitive, round-based, 5v5 tactical hero-based first-person shooter inspired by games like Valorant, Counter-Strike, and Overwatch, featuring **100% original heroes, weapons, maps, lore, abilities, audio synthesis, and UI design**.

![VANGUARD ZERO](https://img.shields.io/badge/VANGUARD-ZERO_5v5_Tactical_FPS-00f0ff?style=for-the-badge)

---

## Key Features

- **10 Original Playable Heroes across 4 Roles**:
  - **Recon**: *Nyx* (Echo Drone, Signal Spike, Neural Sweep), *Cipher* (Thermal Cam, Pulse Dart, Orbital Recon)
  - **Assault**: *Volcan* (Flame Wall, Blaze Dash, Overheat), *Tempest* (Cyclone Trap, Wind Blade, Storm Surge)
  - **Support**: *Lumina* (Radiant Barrier, Healing Pulse, Resurrection), *Aegis* (Force Barrier, Armor Pack, Bastion Dome)
  - **Control**: *Prism* (Flash Prism, Smoke Orb, Prism Lockdown), *Phantom* (Void Anchor, Shadow Veil, Void Realm), *Warden* (Gravity Well, Singularity), *Pulse* (Disruptor Grenade, Blackout Surge)

- **Original Weapon Arsenal & Spray Recoil**:
  - 12 weapons across 7 categories (*Cobalt-9*, *Venom-45*, *Razor SMG*, *Shatter-8*, *Aether V* 152 headshot one-tap, *Phantom-X*, *Apex-9* 150 body damage anti-materiel sniper, *Titan-50* LMG, *Plasma Blade*).

- **Objective & Economy System**:
  - Attackers plant the **Core** device (4s plant, 45s countdown timer, accelerating sound beeps); Defenders defuse (7s defuse with 3.5s half-defuse checkpoint).
  - Round-based buy economy ($800 starting, $3000 win, $1900 loss streak bonus, $200 kill payout).

- **Interactive 3D WebGL Game Engine (`/WebPlayable`)**:
  - Playable directly in the browser! Features Three.js 3D rendering, WebAudio procedural SFX synthesizer, 5v5 AI Bot Matches, Practice Range, Buy Menu (`B`), Scoreboard (`TAB`), Minimap, and Killfeed.

- **Authoritative Backend Stack (`/Backend`)**:
  - Built with Node.js, TypeScript, Express, Socket.io WebSockets, JWT/Guest Auth, ELO matchmaking, MMR rank system (+25/-20 RR), server-side anti-cheat validation, and PostgreSQL schema.

- **Unreal Engine 5 Core Codebase (`/Game`)**:
  - Production UE5 C++ architecture for Game Mode state machine, Character movement & hitboxes, Weapon recoil, Economy, Core device, and Bot AI controllers.

---

## Directory Architecture

```
/Game
  ├── Source/VanguardZero/Public/
  │   ├── Core/           # VanguardGameMode (5v5 Rules, Round States, Economy Payouts)
  │   ├── Characters/     # VanguardCharacterBase & VanguardHeroSystem (GAS, Hitboxes)
  │   ├── Weapons/        # VanguardWeaponBase (Hitscan Raycasting, Recoil Patterns)
  │   ├── Economy/        # VanguardEconomyComponent (Buy Menu & Credit Management)
  │   ├── Objectives/     # VanguardCoreDevice (Plant/Defuse Cycle)
  │   └── AI/             # VanguardBotController (Behavior Trees & Perception)

/Backend
  ├── src/
  │   ├── server.ts       # Express REST & Socket.io WebSockets
  │   ├── auth/           # JWT, Refresh Tokens, Password Hashing, Guest Sessions
  │   ├── matchmaking/    # ELO Proximity Matchmaking Queue
  │   ├── ranking/        # MMR Calculation & 8-Tier Rank Rating System
  │   ├── anticheat/      # Authoritative Movement & Damage Validation
  │   └── db/schema.sql   # PostgreSQL Relational Schemas

/WebPlayable
  ├── index.html          # HTML5 Game HUD, Scoreboard, Buy Menu, Reticle
  ├── styles.css          # Dark Sci-Fi Military Aesthetics
  └── src/
      ├── audio.js        # WebAudio Procedural SFX Synthesizer
      ├── heroes.js       # 10 Original Hero Definitions & Abilities
      ├── weapons.js      # 12 Weapon Stats & Recoil Patterns
      ├── maps.js         # 3D Nexus Prime Map Procedural Generator
      ├── game.js         # 3D WebGL Game Engine Loop & Pointer Lock
      └── ui.js           # Dynamic UI & Event Handlers
```

---

## Quick Start

### 1. Run Interactive Web Browser Game
```bash
cd WebPlayable
npx serve -p 8080 .
# Open http://localhost:8080 in your browser
```

### 2. Run Authoritative Backend Microservice
```bash
cd Backend
npm install
npm run build
npm start
# Server running on http://localhost:4000
```

---

## License
MIT License. © 2026 VANGUARD: ZERO. All Rights Reserved.
