// 12 Original Weapon Definitions for VANGUARD: ZERO
const WEAPONS_DATA = [
    // PISTOLS / SIDEARMS
    {
        id: 'cobalt-9',
        name: 'COBALT-9',
        category: 'Pistol',
        cost: 0, // Free default pistol
        damage: 26,
        headshotMult: 3.0, // 78 HS
        fireRate: 400,
        magazine: 12,
        reserve: 36,
        reloadTime: 1.4,
        recoilPitch: [0, 0.4, 0.9, 1.3],
        recoilYaw: [0, 0.05, -0.1, 0.1],
        spread: 0.2,
        moveSpreadPenalty: 2.0,
        desc: 'Reliable 9mm sidearm with low recoil and clean sight picture.'
    },
    {
        id: 'venom-45',
        name: 'VENOM-45',
        category: 'Pistol',
        cost: 500,
        damage: 55,
        headshotMult: 2.9, // 159 HS (One-tap headshot close range!)
        fireRate: 180,
        magazine: 6,
        reserve: 24,
        reloadTime: 1.8,
        recoilPitch: [0, 2.2, 4.5, 6.0],
        recoilYaw: [0, 0.3, -0.5, 0.7],
        spread: 0.35,
        moveSpreadPenalty: 3.5,
        desc: 'Heavy caliber revolver capable of eliminating unarmored headshots in a single strike.'
    },
    {
        id: 'pulse-9',
        name: 'PULSE-9',
        category: 'Pistol',
        cost: 400,
        damage: 22,
        headshotMult: 3.0, // 66 HS
        fireRate: 750, // 3-round burst
        magazine: 18,
        reserve: 54,
        reloadTime: 1.6,
        recoilPitch: [0, 0.5, 1.2, 2.0],
        recoilYaw: [0, 0.1, 0.2, -0.2],
        spread: 0.25,
        moveSpreadPenalty: 2.5,
        desc: '3-round burst tactical sidearm for close-quarters eco rounds.'
    },

    // SMGs
    {
        id: 'razor-smg',
        name: 'RAZOR SMG',
        category: 'SMG',
        cost: 1100,
        damage: 24,
        headshotMult: 2.5, // 60 HS
        fireRate: 900,
        magazine: 30,
        reserve: 90,
        reloadTime: 1.9,
        recoilPitch: [0, 0.6, 1.2, 2.0, 2.8, 3.5],
        recoilYaw: [0, 0.1, -0.2, 0.3, -0.3, 0.4],
        spread: 0.4,
        moveSpreadPenalty: 1.5, // High run-and-gun accuracy
        desc: 'High fire rate submachine gun with controllable recoil while moving.'
    },

    // SHOTGUNS
    {
        id: 'shatter-8',
        name: 'SHATTER-8',
        category: 'Shotgun',
        cost: 1300,
        damage: 14, // 15 pellets = 210 total damage max!
        headshotMult: 1.5,
        fireRate: 90,
        magazine: 6,
        reserve: 24,
        reloadTime: 2.8,
        recoilPitch: [0, 5.0, 8.0],
        recoilYaw: [0, 0.8, -0.8],
        spread: 2.5,
        moveSpreadPenalty: 1.0,
        desc: 'Pump-action heavy shotgun dominating close range choke points.'
    },

    // RIFLES
    {
        id: 'aether-v',
        name: 'AETHER V',
        category: 'Rifle',
        cost: 2900,
        damage: 38,
        headshotMult: 4.0, // 152 HS (ONE TAP HEADSHOT KILL!)
        fireRate: 625,
        magazine: 25,
        reserve: 75,
        reloadTime: 2.2,
        recoilPitch: [0, 0.8, 1.8, 3.0, 4.2, 5.0, 5.2, 5.3],
        recoilYaw: [0, 0.0, 0.1, -0.2, -0.5, -0.8, 0.6, 0.9],
        spread: 0.15,
        moveSpreadPenalty: 4.5, // Strict standing precision required
        desc: 'Premier competitive assault rifle featuring precision first-bullet accuracy and lethal one-tap headshots.'
    },
    {
        id: 'phantom-x',
        name: 'PHANTOM-X',
        category: 'Rifle',
        cost: 2900,
        damage: 36,
        headshotMult: 3.8, // 136 HS close / 124 far
        fireRate: 675,
        magazine: 30,
        reserve: 90,
        reloadTime: 2.05,
        recoilPitch: [0, 0.6, 1.4, 2.2, 3.2, 4.0, 4.2],
        recoilYaw: [0, 0.0, -0.1, 0.2, 0.4, -0.4, 0.5],
        spread: 0.1,
        moveSpreadPenalty: 4.0,
        desc: 'Silenced tactical rifle with high magazine capacity and smooth spray control.'
    },
    {
        id: 'titan-br',
        name: 'TITAN BR',
        category: 'Rifle',
        cost: 2200,
        damage: 31,
        headshotMult: 3.5, // 108 HS
        fireRate: 500, // 3-round burst
        magazine: 24,
        reserve: 72,
        reloadTime: 2.1,
        recoilPitch: [0, 0.7, 1.5, 2.5],
        recoilYaw: [0, 0.0, 0.15, -0.15],
        spread: 0.12,
        moveSpreadPenalty: 3.8,
        desc: 'Burst-fire tactical rifle offering extreme long-range burst precision.'
    },

    // SNIPERS
    {
        id: 'apex-9',
        name: 'APEX-9',
        category: 'Sniper',
        cost: 4700,
        damage: 150, // 150 body damage (One-shot body kill on light armor / 300 headshot kill)
        headshotMult: 2.0,
        fireRate: 40,
        magazine: 5,
        reserve: 15,
        reloadTime: 3.6,
        recoilPitch: [0, 8.0],
        recoilYaw: [0, 1.0],
        spread: 0.02,
        moveSpreadPenalty: 8.0, // High movement inaccuracy penalty
        desc: 'Heavy bolt-action anti-materiel sniper rifle delivering instant 1-shot eliminations.'
    },
    {
        id: 'ghost-sr',
        name: 'GHOST-SR',
        category: 'Sniper',
        cost: 1800,
        damage: 85, // 170 HS
        headshotMult: 2.0,
        fireRate: 110,
        magazine: 6,
        reserve: 24,
        reloadTime: 2.4,
        recoilPitch: [0, 3.5, 6.0],
        recoilYaw: [0, 0.4, -0.4],
        spread: 0.08,
        moveSpreadPenalty: 5.0,
        desc: 'Semi-automatic marksman rifle capable of rapid long-range double taps.'
    },

    // HEAVY
    {
        id: 'titan-50',
        name: 'TITAN-50 LMG',
        category: 'Heavy',
        cost: 3200,
        damage: 40,
        headshotMult: 3.5, // 140 HS
        fireRate: 800,
        magazine: 100,
        reserve: 200,
        reloadTime: 4.8,
        recoilPitch: [0, 0.8, 1.8, 3.0, 4.5, 6.0, 7.0, 7.5],
        recoilYaw: [0, 0.2, -0.4, 0.6, -0.8, 0.9, -0.9, 1.0],
        spread: 0.4,
        moveSpreadPenalty: 6.0,
        desc: 'High-capacity light machine gun designed for relentless suppression fire.'
    },

    // MELEE
    {
        id: 'plasma-blade',
        name: 'PLASMA BLADE',
        category: 'Melee',
        cost: 0,
        damage: 50, // 100 backstab
        headshotMult: 1.0,
        fireRate: 120,
        magazine: 1,
        reserve: 0,
        reloadTime: 0,
        recoilPitch: [0],
        recoilYaw: [0],
        spread: 0.0,
        moveSpreadPenalty: 0.0,
        desc: 'Energy blade dealing 50 front damage and 100 backstab damage.'
    }
];

window.WEAPONS_DATA = WEAPONS_DATA;
