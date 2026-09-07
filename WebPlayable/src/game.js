// VANGUARD: ZERO 3D Game Engine Loop
class VanguardGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });

        this.isPointerLocked = false;
        this.mouseSensitivity = 0.002;

        // Player State
        this.playerPos = new THREE.Vector3(0, 1.6, 50);
        this.playerVelocity = new THREE.Vector3();
        this.cameraPitch = 0;
        this.cameraYaw = 0;

        this.health = 100;
        this.armor = 50;
        this.playerCredits = 800;
        this.equippedHero = null;
        this.equippedWeapon = window.WEAPONS_DATA[5]; // Aether V
        this.currentAmmo = 25;
        this.reserveAmmo = 75;

        // Input state
        this.keys = {};

        // Objective State
        this.coreState = 'IDLE'; // 'CARRIED', 'PLANTED', 'DEFUSED', 'DETONATED'
        this.coreTimer = 45.0;
        this.corePlantProgress = 0;
        this.coreDefuseProgress = 0;
        this.bIsPlanting = false;
        this.bIsDefusing = false;

        // Round State
        this.currentRound = 1;
        this.atkScore = 0;
        this.defScore = 0;
        this.matchPhase = 'BUY_PHASE'; // 'BUY_PHASE', 'ACTION_PHASE', 'POST_ROUND'
        this.phaseTimer = 30.0;

        // Bots
        this.bots = [];

        this.initEngine();
    }

    initEngine() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.scene.background = new THREE.Color(0x0a0e17);

        // Ambient & Directional Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(50, 80, 50);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Build 3D Map
        this.mapSpawns = window.MapBuilder.buildNexusPrime(this.scene);

        // Setup Pointer Lock
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

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
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
        // Clear previous bots
        this.bots.forEach(b => this.scene.remove(b.mesh));
        this.bots = [];

        // Spawn 5 Defender Bots & 4 Attacker Bots
        const botGeo = new THREE.CapsuleGeometry(0.5, 1.2, 8, 16);
        const redMat = new THREE.MeshStandardMaterial({ color: 0xff2a5f });
        const cyanMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff });

        for (let i = 0; i < 5; i++) {
            const mesh = new THREE.Mesh(botGeo, redMat);
            mesh.position.set(30 + (i * 3), 1.2, -45);
            this.scene.add(mesh);
            this.bots.push({ id: `def_bot_${i}`, team: 'Defenders', mesh, health: 100, pos: mesh.position });
        }
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
        // Ability Triggers
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
        if (e.button === 0) { // Left Click Shoot
            this.shootWeapon();
        }
    }

    triggerAbility(slotIndex) {
        if (!this.equippedHero) return;
        const ability = this.equippedHero.abilities[slotIndex];
        if (ability && window.soundEngine) {
            window.soundEngine.playAbilityActivate();
            window.uiManager.addKillfeedEntry(this.equippedHero.name, ability.name, 'SITE ZONE', false);
        }
    }

    shootWeapon() {
        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;

        if (window.soundEngine) {
            window.soundEngine.playGunshot(this.equippedWeapon.category.toLowerCase());
        }

        // Raycast Hitscan
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        const botMeshes = this.bots.map(b => b.mesh);
        const hits = raycaster.intersectObjects(botMeshes);

        if (hits.length > 0) {
            const hitMesh = hits[0].object;
            const targetBot = this.bots.find(b => b.mesh === hitMesh);

            if (targetBot && targetBot.health > 0) {
                const isHeadshot = hits[0].point.y > 1.6;
                const damage = isHeadshot ? Math.round(this.equippedWeapon.damage * this.equippedWeapon.headshotMult) : this.equippedWeapon.damage;

                targetBot.health -= damage;
                if (isHeadshot && window.soundEngine) {
                    window.soundEngine.playHeadshotPing();
                }

                if (targetBot.health <= 0) {
                    this.scene.remove(targetBot.mesh);
                    window.uiManager.addKillfeedEntry('YOU', this.equippedWeapon.name, targetBot.id, isHeadshot);
                    this.playerCredits += 200;
                }
            }
        }

        this.updateHUD();
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
        this.updateTimers(delta);
        this.renderMinimap();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((t) => this.gameLoop(t));
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

        // Render Hero Abilities on HUD
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

        // Draw Map Border & Sites
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

        // Player Dot (Green)
        const px = 80 + (this.playerPos.x * 0.8);
        const pz = 80 + (this.playerPos.z * 0.8);

        ctx.fillStyle = '#00ff87';
        ctx.beginPath();
        ctx.arc(px, pz, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

window.VanguardGame = VanguardGame;
