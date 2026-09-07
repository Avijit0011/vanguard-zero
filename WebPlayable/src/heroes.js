// 10 Original Playable Heroes Definitions for VANGUARD: ZERO
const HEROES_DATA = [
    {
        id: 'nyx',
        name: 'NYX',
        role: 'Recon',
        country: 'Greece',
        bio: 'Tactical intelligence specialist using autonomous signal spikes and aerial echo drones to reveal enemy positions.',
        passive: 'Tracker Steps (Enemies leave faint glowing footprints visible to Nyx for 3s).',
        abilities: [
            { key: 'C', name: 'Signal Spike', type: 'Basic', cost: 150, cooldown: 18, desc: 'Throws a sensor spike detecting enemies through walls in a 12m radius.' },
            { key: 'Q', name: 'Echo Drone', type: 'Basic', cost: 250, cooldown: 25, desc: 'Deploys a controllable recon drone that fires sonar darts.' },
            { key: 'E', name: 'Phase Mark', type: 'Signature', cost: 0, cooldown: 35, desc: 'Instantly pings the exact location of the last enemy who damaged you.' },
            { key: 'X', name: 'Neural Sweep', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Emits a map-wide pulse revealing all enemy positions & movement trails for 5s.' }
        ]
    },
    {
        id: 'volcan',
        name: 'VOLCAN',
        role: 'Assault',
        country: 'Mexico',
        bio: 'Aggressive pyrotechnic entry fragger equipped with incendiary barriers and rapid tactical dashes.',
        passive: 'Thermal Shield (Immune to self & friendly fire damage).',
        abilities: [
            { key: 'C', name: 'Ignis Strike', type: 'Basic', cost: 200, cooldown: 15, desc: 'Hurls an explosive plasma grenade dealing 75 area fire damage.' },
            { key: 'Q', name: 'Flame Wall', type: 'Basic', cost: 250, cooldown: 20, desc: 'Erects a 15m line of burning fire that blocks sightlines and burns callers.' },
            { key: 'E', name: 'Blaze Dash', type: 'Signature', cost: 0, cooldown: 30, desc: 'Burst forward 8 meters instantly, re-chambering equipped weapon.' },
            { key: 'X', name: 'Overheat', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Enters Overheat state: +50% fire rate, fast reload, and automatic revive on lethal blow.' }
        ]
    },
    {
        id: 'tempest',
        name: 'TEMPEST',
        role: 'Assault',
        country: 'Japan',
        bio: 'High-mobility wind blade warrior capable of vertical maneuvers and disorienting whirlwind traps.',
        passive: 'Glide (Hold Jump in air to float gracefully down).',
        abilities: [
            { key: 'C', name: 'Cyclone Trap', type: 'Basic', cost: 200, cooldown: 18, desc: 'Throws a wind mine that lifts tripped enemies into the air for 2s.' },
            { key: 'Q', name: 'Wind Blade', type: 'Basic', cost: 150, cooldown: 12, desc: 'Fires a horizontal arc projectile dealing 60 damage.' },
            { key: 'E', name: 'Air Dash', type: 'Signature', cost: 0, cooldown: 25, desc: 'Launches high into the air or forward in facing direction.' },
            { key: 'X', name: 'Storm Surge', type: 'Ultimate', cost: 8, cooldown: 0, desc: 'Summons 5 throwable wind daggers dealing 150 damage on headshot.' }
        ]
    },
    {
        id: 'cipher',
        name: 'CIPHER',
        role: 'Recon',
        country: 'Germany',
        bio: 'Master intel hacker using thermal optics, holographic decoys, and long-range orbital sweeps.',
        passive: 'Network Scan (Assists reveal target on team HUD for +2s).',
        abilities: [
            { key: 'C', name: 'Holo Decoy', type: 'Basic', cost: 100, cooldown: 15, desc: 'Sends out a walking holographic decoy that mimics gunshots when hit.' },
            { key: 'Q', name: 'Pulse Dart', type: 'Basic', cost: 200, cooldown: 20, desc: 'Fires a dart that pings nearby enemies twice upon impact.' },
            { key: 'E', name: 'Thermal Cam', type: 'Signature', cost: 0, cooldown: 30, desc: 'Places a sticky thermal camera to spy around corners.' },
            { key: 'X', name: 'Orbital Recon', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Launches an orbital laser sweep that damages and outlines all enemies inside target site.' }
        ]
    },
    {
        id: 'lumina',
        name: 'LUMINA',
        role: 'Support',
        country: 'Brazil',
        bio: 'Radiant combat medic who projects defensive light barriers and restores team vitality.',
        passive: 'Radiant Grace (Regenerates 5 HP/sec when out of combat for 6s).',
        abilities: [
            { key: 'C', name: 'Cleanse Flash', type: 'Basic', cost: 200, cooldown: 15, desc: 'Throws a light orb that detonates, blinding looking players for 1.8s.' },
            { key: 'Q', name: 'Radiant Barrier', type: 'Basic', cost: 250, cooldown: 25, desc: 'Deploys a 3m glowing light wall blocking 400 incoming bullet damage.' },
            { key: 'E', name: 'Healing Pulse', type: 'Signature', cost: 0, cooldown: 35, desc: 'Target an ally or self to heal 100 HP over 4 seconds.' },
            { key: 'X', name: 'Resurrection', type: 'Ultimate', cost: 8, cooldown: 0, desc: 'Revives a fallen teammate at full health after a 2-second channel.' }
        ]
    },
    {
        id: 'aegis',
        name: 'AEGIS',
        role: 'Support',
        country: 'United Kingdom',
        bio: 'Heavy tactical warden deploying deployable physical kinetic shields and team armor packs.',
        passive: 'Fortified (Takes 15% reduced damage from explosive utility).',
        abilities: [
            { key: 'C', name: 'Armor Pack', type: 'Basic', cost: 150, cooldown: 10, desc: 'Drops +50 heavy armor shield for self or teammate.' },
            { key: 'Q', name: 'Stun Mine', type: 'Basic', cost: 200, cooldown: 20, desc: 'Concealed landmine that concusses and slows enemies in range.' },
            { key: 'E', name: 'Force Barrier', type: 'Signature', cost: 0, cooldown: 30, desc: 'Deploys a solid waist-high cover barrier.' },
            { key: 'X', name: 'Bastion Dome', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Projects a giant invulnerable bullet-proof energy dome over target area for 10s.' }
        ]
    },
    {
        id: 'prism',
        name: 'PRISM',
        role: 'Control',
        country: 'South Korea',
        bio: 'Optical controller manipulating light refraction to create dense smoke spheres and blinding prisms.',
        passive: 'Refine (Smoke utilities last +3 seconds longer).',
        abilities: [
            { key: 'C', name: 'Flash Prism', type: 'Basic', cost: 250, cooldown: 16, desc: 'Sends out a guiding flash prism that detonates on command.' },
            { key: 'Q', name: 'Mirage Wall', type: 'Basic', cost: 200, cooldown: 22, desc: 'Creates a line of refractive light that obscures line of sight.' },
            { key: 'E', name: 'Smoke Orb', type: 'Signature', cost: 0, cooldown: 30, desc: 'Deploys 2 large hollow dark smoke spheres anywhere on map.' },
            { key: 'X', name: 'Prism Lockdown', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Pulses an entire site with refractive beams, blinding and suppressing enemy abilities.' }
        ]
    },
    {
        id: 'phantom',
        name: 'PHANTOM',
        role: 'Control',
        country: 'Egypt',
        bio: 'Void-walking infiltrator capable of short-distance shadow teleports and dark tethering.',
        passive: 'Shadow Step (Footsteps are 50% quieter).',
        abilities: [
            { key: 'C', name: 'Dark Tether', type: 'Basic', cost: 200, cooldown: 18, desc: 'Fires a shadow orb that tethers and deafens affected enemies.' },
            { key: 'Q', name: 'Shadow Veil', type: 'Basic', cost: 150, cooldown: 20, desc: 'Throws a dark shadow smoke sphere.' },
            { key: 'E', name: 'Void Anchor', type: 'Signature', cost: 0, cooldown: 35, desc: 'Places a teleport marker and teleports back to it within 15s.' },
            { key: 'X', name: 'Void Realm', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Pull target enemy into a 1v1 void shadow dimension for 8 seconds.' }
        ]
    },
    {
        id: 'warden',
        name: 'WARDEN',
        role: 'Control',
        country: 'Canada',
        bio: 'Gravity anomaly engineer controlling battlefield choke points with slowing wells and kinetic pulses.',
        passive: 'Heavy Footing (Immune to slow effects).',
        abilities: [
            { key: 'C', name: 'Kinetic Snare', type: 'Basic', cost: 200, cooldown: 15, desc: 'Throws a field slowing enemy movement speed by 60%.' },
            { key: 'Q', name: 'Gravity Well', type: 'Basic', cost: 250, cooldown: 25, desc: 'Pulls nearby enemies toward center point and applies Vulnerable.' },
            { key: 'E', name: 'Grav Wall', type: 'Signature', cost: 0, cooldown: 30, desc: 'Creates a grav-barrier that deflects incoming projectiles.' },
            { key: 'X', name: 'Singularity', type: 'Ultimate', cost: 8, cooldown: 0, desc: 'Crushes target site zone with a gravity collapse dealing 120 damage and pulling all targets.' }
        ]
    },
    {
        id: 'pulse',
        name: 'PULSE',
        role: 'Control',
        country: 'India',
        bio: 'Cyber-tech saboteur capable of disabling enemy crosshairs, minimaps, and electronic weapons.',
        passive: 'System Diagnostics (Detects enemy trap utility through surfaces within 10m).',
        abilities: [
            { key: 'C', name: 'Disruptor Grenade', type: 'Basic', cost: 200, cooldown: 18, desc: 'EMP grenade that disables enemy HUDs and crosshairs for 4s.' },
            { key: 'Q', name: 'EM Pulse', type: 'Basic', cost: 250, cooldown: 22, desc: 'Pulses in a cone suppressing enemy abilities for 8s.' },
            { key: 'E', name: 'System Freeze', type: 'Signature', cost: 0, cooldown: 30, desc: 'Locks down enemy weapons from reloading for 3s.' },
            { key: 'X', name: 'Blackout Surge', type: 'Ultimate', cost: 7, cooldown: 0, desc: 'Wipes enemy minimaps, destroys all deployed utility, and silences all enemy abilities.' }
        ]
    }
];

window.HEROES_DATA = HEROES_DATA;
