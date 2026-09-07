// VANGUARD: ZERO 3D Game Engine Loop with 3D Gun Viewmodel, Bullet Tracers, and Bot AI
class VanguardGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });

        this.isPointerLocked = false;
        this.mouseSensitivity = 0.0025;

        // Player State
        this.playerPos = new THREE.Vector3(0, 1.6, 50);
        this.playerVelocity = new THREE.Vector3();
        this.cameraPitch = 0;
        this.cameraYaw = 0;

        this.health = 100;
        this.armor = 50;
        this.playerCredits = 800;
        this.equippedHero = null;
        this.equippedWeapon = window.WEAPONS_DATA[5]; // Aether V Rifle
        this.currentAmmo = 25;
        this.reserveAmmo = 75;
        this.isADS = false;

        // Input state
        this.keys = {};

        // Objective State
        this.coreState = 'IDLE'; // 'CARRIED', 'PLANTED', 'DEFUSED', 'DETONATED'
        this.coreTimer = 45.0;
        this.corePlantProgress = 0;
        this.coreDefuseProgress = 0;

        // Round State
        this.currentRound = 1;
        this.atkScore = 0;
        this.defScore = 0;
        this.matchPhase = 'BUY_PHASE';
        this.phaseTimer = 30.0;

        // Game Entities
        this.bots = [];
        this.tracers = [];
        this.particles = [];

        // Gun Recoil Animation State
        this.gunRecoilOffset = new THREE.Vector3();
        this.gunRecoilRot = new THREE.Vector3();

        this.initEngine();
    }

    initEngine() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.scene.background = new THREE.Color(0x0a0e17);

        // Ambient & Sun Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
        sunLight.position.set(50, 80, 50);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Build 3D Map
        this.mapSpawns = window.MapBuilder.buildNexusPrime(this.scene);

        // Create 3D Gun Viewmodel attached to Camera
        this.createGunViewModel();

        // Setup Pointer Lock & Controls
        this.canvas.addEventListener('click', () => {
            if (this.matchPhase !== 'MENU') {
                this.canvas.requestPointerLock();
                if (window.soundEngine) window.soundEngine.init();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = (document.pointerLockElement === this.canvas);
        });

        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    createGunViewModel() {
        // Gun Viewmodel Container attached directly to Camera
        this.gunContainer = new THREE.Group();

        // Gun Body / Receiver
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.16, 0.55);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.85, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, gunMat);

        // Gun Barrel
        const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.4);
        body.add(barrel);

        // Glowing Energy Optics / Sight Scope
        const sightGeo = new THREE.BoxGeometry(0.06, 0.06, 0.15);
        const sightMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.11, -0.05);
        body.add(sight);

        // Muzzle Flash Light
        this.muzzleLight = new THREE.PointLight(0xffb703, 0, 8);
        this.muzzleLight.position.set(0, 0.03, -0.65);
        body.add(this.muzzleLight);

        this.gunMesh = body;
        this.gunContainer.add(this.gunMesh);

        // Position Gun in lower right FPS hipfire stance
        this.gunDefaultPos = new THREE.Vector3(0.24, -0.22, -0.45);
        this.gunADSPos = new THREE.Vector3(0, -0.11, -0.32);
        this.gunContainer.position.copy(this.gunDefaultPos);

        this.camera.add(this.gunContainer);
        this.scene.add(this.camera);
    }

    startMatch(mode, hero) {
        this.mode = mode;
        this.equippedHero = hero || window.HEROES_DATA[0];
        this.playerPos.copy(this.mapSpawns.atkSpawn);
        this.matchPhase = 'BUY_PHASE';
        this.phaseTimer = 30.0;
        this.health = 100;
        this.armor = 50;

        this.spawnBots();
        this.updateHUD();
        this.renderMinimap();
    }

    spawnBots() {
        // Clear old bots
        this.bots.forEach(b => this.scene.remove(b.group));
        this.bots = [];

        // Create 5 Red Enemy Bots & 4 Allied Cyan Bots
        const enemySpawnPositions = [
            new THREE.Vector3(-35, 1.2, -30), // Site A
            new THREE.Vector3(35, 1.2, -30),  // Site B
            new THREE.Vector3(0, 1.2, -10),   // Mid Choke
            new THREE.Vector3(-15, 1.2, -20), // A Short
            new THREE.Vector3(20, 1.2, -25)   // B Short
        ];

        enemySpawnPositions.forEach((pos, idx) => {
            const botGroup = new THREE.Group();

            // Tactical Bot Body
            const bodyGeo = new THREE.CapsuleGeometry(0.45, 1.1, 8, 16);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff2a5f, roughness: 0.4 });
            const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            botGroup.add(bodyMesh);

            // Tactical Helmet / Visor
            const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
            const visorMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xffb703, emissiveIntensity: 0.5 });
            const headMesh = new THREE.Mesh(headGeo, visorMat);
            headMesh.position.set(0, 0.75, 0.1);
            botGroup.add(headMesh);

            // Enemy Weapon Model in hands
            const weaponGeo = new THREE.BoxGeometry(0.1, 0.1, 0.6);
            const weaponMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
            const weaponMesh = new THREE.Mesh(weaponGeo, weaponMat);
            weaponMesh.position.set(0.3, 0.2, -0.3);
            botGroup.add(weaponMesh);

            botGroup.position.copy(pos);
            this.scene.add(botGroup);

            this.bots.push({
                id: `ENEMY_BOT_${idx + 1}`,
                team: 'Red',
                group: botGroup,
                hitMesh: bodyMesh,
                health: 100,
                armor: 50,
                pos: botGroup.position,
                lastShotTime: 0,
                moveTarget: pos.clone()
            });
        });
    }

    handleMouseMove(e) {
        if (!this.isPointerLocked) return;

        this.cameraYaw -= e.movementX * this.mouseSensitivity;
        this.cameraPitch -= e.movementY * this.mouseSensitivity;
        this.cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.cameraPitch));

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.cameraYaw;
        this.camera.rotation.x = this.cameraPitch;
    }

    handleKeyDown(e) {
        this.keys[e.code] = true;

        if (e.code === 'KeyB') {
            window.uiManager.toggleBuyMenu(document.getElementById('buy-menu').classList.contains('hidden'));
        }
        if (e.code === 'Tab') {
            e.preventDefault();
            window.uiManager.toggleScoreboard(true);
        }
        if (e.code === 'KeyR') {
            this.reload();
        }

        // Ability Keys
        if (e.code === 'KeyC') this.triggerAbility(0);
        if (e.code === 'KeyQ') this.triggerAbility(1);
        if (e.code === 'KeyE') this.triggerAbility(2);
        if (e.code === 'KeyX') this.triggerAbility(3);
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
        if (e.code === 'Tab') {
            window.uiManager.toggleScoreboard(false);
        }
    }

    handleMouseDown(e) {
        if (!this.isPointerLocked) return;
        if (e.button === 0) { // Primary Attack
            this.shootWeapon();
        } else if (e.button === 2) { // Secondary Attack (ADS Zoom)
            this.isADS = true;
            document.getElementById('ads-overlay').classList.remove('hidden');
            this.camera.fov = 45;
            this.camera.updateProjectionMatrix();
        }
    }

    handleMouseUp(e) {
        if (e.button === 2) {
            this.isADS = false;
            document.getElementById('ads-overlay').classList.add('hidden');
            this.camera.fov = 75;
            this.camera.updateProjectionMatrix();
        }
    }

    triggerAbility(slotIndex) {
        if (!this.equippedHero) return;
        const ability = this.equippedHero.abilities[slotIndex];
        if (ability && window.soundEngine) {
            window.soundEngine.playAbilityActivate();
            window.uiManager.addKillfeedEntry(this.equippedHero.name, ability.name, 'TACTICAL ZONE', false);
        }
    }

    shootWeapon() {
        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;

        if (window.soundEngine) {
            window.soundEngine.playGunshot(this.equippedWeapon.category.toLowerCase());
        }

        // Recoil Kickback Animation on 3D Gun Viewmodel
        this.gunRecoilOffset.z = 0.08;
        this.gunRecoilRot.x = 0.12;

        // Flash Muzzle Light
        this.muzzleLight.intensity = 3.0;
        setTimeout(() => this.muzzleLight.intensity = 0, 40);

        // Calculate Bullet Fire Direction
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const botMeshes = this.bots.map(b => b.hitMesh);
        const hits = raycaster.intersectObjects(this.scene.children, true);

        // Muzzle World Position
        const muzzlePos = new THREE.Vector3();
        this.muzzleLight.getWorldPosition(muzzlePos);

        let targetPos = muzzlePos.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));
        let hitTarget = null;
        let isHeadshot = false;

        for (let i = 0; i < hits.length; i++) {
            if (hits[i].object !== this.gunMesh && !hits[i].object.ancestorsOf(this.gunContainer)) {
                targetPos = hits[i].point;

                // Check if hit enemy bot
                const hitBot = this.bots.find(b => b.hitMesh === hits[i].object || b.group.children.includes(hits[i].object));
                if (hitBot) {
                    hitTarget = hitBot;
                    isHeadshot = targetPos.y > (hitBot.pos.y + 0.5);
                }
                break;
            }
        }

        // Create Glowing Bullet Tracer
        this.createBulletTracer(muzzlePos, targetPos, 0x00f0ff);

        // Process Damage if Enemy Hit
        if (hitTarget && hitTarget.health > 0) {
            const damage = isHeadshot ? Math.round(this.equippedWeapon.damage * this.equippedWeapon.headshotMult) : this.equippedWeapon.damage;
            hitTarget.health -= damage;

            if (isHeadshot && window.soundEngine) {
                window.soundEngine.playHeadshotPing();
            }

            // Create Impact Particle Effect
            this.createImpactSparks(targetPos, 0xff2a5f);

            if (hitTarget.health <= 0) {
                this.scene.remove(hitTarget.group);
                window.uiManager.addKillfeedEntry('YOU', this.equippedWeapon.name, hitTarget.id, isHeadshot);
                this.playerCredits += 200;
            }
        } else {
            this.createImpactSparks(targetPos, 0xffb703);
        }

        this.updateHUD();
    }

    createBulletTracer(from, to, colorHex) {
        const distance = from.distanceTo(to);
        const tracerGeo = new THREE.CylinderGeometry(0.015, 0.015, distance, 8);
        const tracerMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);

        // Position & Orient Tracer Cylinder
        const midPoint = from.clone().add(to).multiplyScalar(0.5);
        tracer.position.copy(midPoint);
        tracer.lookAt(to);
        tracer.rotation.x += Math.PI / 2;

        this.scene.add(tracer);
        this.tracers.push({ mesh: tracer, opacity: 0.95, createdAt: performance.now() });
    }

    createImpactSparks(pos, colorHex) {
        for (let i = 0; i < 6; i++) {
            const pGeo = new THREE.BufferGeometry();
            const pMat = new THREE.PointsMaterial({ color: colorHex, size: 0.08, transparent: true, opacity: 1 });
            const pMesh = new THREE.Points(pGeo, pMat);
            pMesh.position.copy(pos);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                Math.random() * 4,
                (Math.random() - 0.5) * 4
            );

            this.scene.add(pMesh);
            this.particles.push({ mesh: pMesh, velocity: vel, life: 0.3 });
        }
    }

    reload() {
        this.currentAmmo = this.equippedWeapon.magazine;
        this.updateHUD();
    }

    buyWeapon(weapon) {
        if (this.playerCredits >= weapon.cost) {
            this.playerCredits -= weapon.cost;
            this.equippedWeapon = weapon;
            this.currentAmmo = weapon.magazine;
            this.reserveAmmo = weapon.reserve;
            this.updateHUD();
            return true;
        }
        return false;
    }

    gameLoop(timestamp) {
        const delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.updatePlayerMovement(delta);
        this.updateGunViewmodel(delta);
        this.updateBotAI(delta, timestamp);
        this.updateTracersAndParticles(delta);
        this.updateTimers(delta);
        this.renderMinimap();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    updateGunViewmodel(delta) {
        // Smoothly interpolate gun viewmodel stance (ADS vs Hipfire)
        const targetPos = this.isADS ? this.gunADSPos : this.gunDefaultPos;
        this.gunContainer.position.lerp(targetPos.clone().add(this.gunRecoilOffset), delta * 15);

        // Smoothly recover gun recoil offset & rotation
        this.gunRecoilOffset.lerp(new THREE.Vector3(), delta * 12);
        this.gunRecoilRot.lerp(new THREE.Vector3(), delta * 12);

        this.gunMesh.rotation.x = this.gunRecoilRot.x;
    }

    updateBotAI(delta, timestamp) {
        // Update Bot AI (Navigation, Shooting Back, Line of Sight)
        this.bots.forEach(bot => {
            if (bot.health <= 0) return;

            // Check distance to player
            const distToPlayer = bot.pos.distanceTo(this.playerPos);

            // Orient bot toward player if within vision radius (35m)
            if (distToPlayer < 35) {
                bot.group.lookAt(this.playerPos.x, bot.pos.y, this.playerPos.z);

                // Bot Shoot Back Logic (Fires every 1.2 seconds)
                if (timestamp - bot.lastShotTime > 1200) {
                    bot.lastShotTime = timestamp;

                    // Bot Tracer
                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, this.playerPos.clone().add(new THREE.Vector3(0, -0.3, 0)), 0xff2a5f);

                    if (window.soundEngine) {
                        window.soundEngine.playGunshot('rifle');
                    }

                    // Damage Player if close
                    if (distToPlayer < 25 && Math.random() < 0.45) {
                        this.health = Math.max(0, this.health - 18);
                        this.updateHUD();
                        if (this.health <= 0) {
                            window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', 'YOU', false);
                        }
                    }
                }
            }
        });
    }

    updateTracersAndParticles(delta) {
        // Update Bullet Tracers Fade Out
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            t.opacity -= delta * 4;
            if (t.opacity <= 0) {
                this.scene.remove(t.mesh);
                this.tracers.splice(i, 1);
            } else {
                t.mesh.material.opacity = t.opacity;
            }
        }

        // Update Particle Sparks Physics
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.mesh.position.addScaledVector(p.velocity, delta);
            p.life -= delta;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    updatePlayerMovement(delta) {
        if (!this.isPointerLocked) return;

        const moveSpeed = this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD'] ? 8.0 : 0;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();

        const moveDir = new THREE.Vector3();
        if (this.keys['KeyW']) moveDir.add(forward);
        if (this.keys['KeyS']) moveDir.sub(forward);
        if (this.keys['KeyD']) moveDir.add(right);
        if (this.keys['KeyA']) moveDir.sub(right);
        moveDir.normalize();

        this.playerPos.addScaledVector(moveDir, moveSpeed * delta);
        this.camera.position.copy(this.playerPos);

        // Core Plant / Defuse Hold Key ('KeyE')
        const distSiteA = this.playerPos.distanceTo(this.mapSpawns.siteA);
        const distSiteB = this.playerPos.distanceTo(this.mapSpawns.siteB);

        const promptBar = document.getElementById('interaction-bar-container');
        const fillBar = document.getElementById('interaction-progress-fill');
        const labelText = document.getElementById('interaction-label');

        if (this.keys['KeyE'] && (distSiteA < 12 || distSiteB < 12)) {
            promptBar.classList.remove('hidden');

            if (this.coreState === 'IDLE') {
                this.corePlantProgress += delta;
                labelText.innerText = 'PLANTING CORE...';
                fillBar.style.width = `${(this.corePlantProgress / 4.0) * 100}%`;

                if (this.corePlantProgress >= 4.0) {
                    this.coreState = 'PLANTED';
                    this.coreTimer = 45.0;
                    document.getElementById('core-status-banner').classList.remove('hidden');
                    window.uiManager.addKillfeedEntry('ATTACKERS', 'CORE DEVICE', 'SITE A', false);
                }
            } else if (this.coreState === 'PLANTED') {
                this.coreDefuseProgress += delta;
                labelText.innerText = 'DEFUSING CORE...';
                fillBar.style.width = `${(this.coreDefuseProgress / 7.0) * 100}%`;

                if (this.coreDefuseProgress >= 7.0) {
                    this.coreState = 'DEFUSED';
                    document.getElementById('core-status-banner').classList.add('hidden');
                    window.uiManager.addKillfeedEntry('DEFENDERS', 'DEFUSE DEVICE', 'CORE', false);
                }
            }
        } else {
            promptBar.classList.add('hidden');
            this.corePlantProgress = 0;
            if (this.coreState !== 'PLANTED') this.coreDefuseProgress = 0;
        }
    }

    updateTimers(delta) {
        if (this.phaseTimer > 0) {
            this.phaseTimer -= delta;
            const mins = Math.floor(this.phaseTimer / 60);
            const secs = Math.floor(this.phaseTimer % 60).toString().padStart(2, '0');
            document.getElementById('hud-timer').innerText = `${mins}:${secs}`;
            document.getElementById('hud-round-phase').innerText = this.matchPhase.replace('_', ' ');

            if (this.phaseTimer <= 0 && this.matchPhase === 'BUY_PHASE') {
                this.matchPhase = 'ACTION_PHASE';
                this.phaseTimer = 100.0;
            }
        }

        if (this.coreState === 'PLANTED') {
            this.coreTimer -= delta;
            if (Math.floor(this.coreTimer * 2) % 2 === 0 && window.soundEngine) {
                window.soundEngine.playCoreBeep();
            }
        }
    }

    updateHUD() {
        document.getElementById('hud-health-val').innerText = Math.max(0, this.health);
        document.getElementById('hud-health-fill').style.width = `${this.health}%`;
        document.getElementById('hud-weapon-name').innerText = this.equippedWeapon.name.toUpperCase();
        document.getElementById('hud-ammo-current').innerText = this.currentAmmo;
        document.getElementById('hud-ammo-reserve').innerText = this.reserveAmmo;

        const abilContainer = document.getElementById('hud-abilities-container');
        if (abilContainer && this.equippedHero) {
            abilContainer.innerHTML = this.equippedHero.abilities.map(a => `
                <div class="ability-btn-hud">
                    <span class="ability-key">${a.key}</span>
                    <span class="ability-name">${a.name}</span>
                </div>
            `).join('');
        }
    }

    renderMinimap() {
        const miniCanvas = document.getElementById('minimap-canvas');
        if (!miniCanvas) return;
        const ctx = miniCanvas.getContext('2d');

        ctx.clearRect(0, 0, 160, 160);

        ctx.fillStyle = '#101726';
        ctx.fillRect(0, 0, 160, 160);

        // Site A
        ctx.fillStyle = 'rgba(255, 183, 3, 0.4)';
        ctx.beginPath();
        ctx.arc(30, 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb703';
        ctx.fillText('A', 26, 44);

        // Site B
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(130, 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('B', 126, 44);

        // Enemy Bot Markers (Red)
        this.bots.forEach(bot => {
            if (bot.health > 0) {
                const bx = 80 + (bot.pos.x * 0.8);
                const bz = 80 + (bot.pos.z * 0.8);
                ctx.fillStyle = '#ff2a5f';
                ctx.beginPath();
                ctx.arc(bx, bz, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Player Dot (Green)
        const px = 80 + (this.playerPos.x * 0.8);
        const pz = 80 + (this.playerPos.z * 0.8);

        ctx.fillStyle = '#00ff87';
        ctx.beginPath();
        ctx.arc(px, pz, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add helper method to THREE Object3D prototype for traversal checks
THREE.Object3D.prototype.ancestorsOf = function(object) {
    let curr = object;
    while (curr) {
        if (curr === this) return true;
        curr = curr.parent;
    }
    return false;
};

window.VanguardGame = VanguardGame;
