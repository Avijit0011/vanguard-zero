// VANGUARD: ZERO 3D Game Engine Loop with Gun/Knife Switching, 5v5 Bot Match Mode, and Precision Bullet Tracers
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

        // Weapon Inventory Slots (1: Primary, 2: Secondary, 3: Melee Knife)
        this.inventory = {
            1: window.WEAPONS_DATA[5], // Aether V Assault Rifle
            2: window.WEAPONS_DATA[1], // Venom-45 Heavy Pistol
            3: window.WEAPONS_DATA[11] // Plasma Blade Knife
        };
        this.activeSlot = 1;
        this.equippedWeapon = this.inventory[1];

        this.currentAmmo = this.equippedWeapon.magazine;
        this.reserveAmmo = this.equippedWeapon.reserve;
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

        // Gun Recoil & Knife Slash Animation State
        this.viewmodelOffset = new THREE.Vector3();
        this.viewmodelRot = new THREE.Vector3();

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

        // Create 3D Viewmodels (Gun & Knife)
        this.createViewmodels();

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
        document.addEventListener('wheel', (e) => this.handleMouseWheel(e));

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    createViewmodels() {
        this.viewmodelContainer = new THREE.Group();

        // 1. GUN MESH (Rifle / Pistol)
        this.gunGroup = new THREE.Group();

        const bodyGeo = new THREE.BoxGeometry(0.12, 0.16, 0.55);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.85, roughness: 0.2 });
        const body = new THREE.Mesh(bodyGeo, gunMat);

        const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.4);
        body.add(barrel);

        const sightGeo = new THREE.BoxGeometry(0.06, 0.06, 0.15);
        const sightMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.11, -0.05);
        body.add(sight);

        this.muzzleLight = new THREE.PointLight(0xffb703, 0, 8);
        this.muzzleLight.position.set(0, 0.03, -0.65);
        body.add(this.muzzleLight);

        this.gunGroup.add(body);
        this.viewmodelContainer.add(this.gunGroup);

        // 2. KNIFE MESH (Plasma Energy Blade)
        this.knifeGroup = new THREE.Group();

        const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
        const handle = new THREE.Mesh(handleGeo, handleMat);

        const bladeGeo = new THREE.BoxGeometry(0.015, 0.35, 0.06);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8, metalness: 0.9 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0, 0.25, 0);
        handle.add(blade);

        handle.rotation.x = Math.PI / 3;
        handle.position.set(0, 0, 0);
        this.knifeGroup.add(handle);
        this.knifeGroup.visible = false;
        this.viewmodelContainer.add(this.knifeGroup);

        // Positions
        this.viewmodelDefaultPos = new THREE.Vector3(0.24, -0.22, -0.45);
        this.viewmodelADSPos = new THREE.Vector3(0, -0.11, -0.32);
        this.viewmodelContainer.position.copy(this.viewmodelDefaultPos);

        this.camera.add(this.viewmodelContainer);
        this.scene.add(this.camera);
    }

    switchSlot(slot) {
        if (!this.inventory[slot]) return;
        this.activeSlot = slot;
        this.equippedWeapon = this.inventory[slot];
        this.currentAmmo = this.equippedWeapon.magazine;
        this.reserveAmmo = this.equippedWeapon.reserve;

        // Toggle 3D Viewmodel Mesh
        if (slot === 3) { // Knife
            this.gunGroup.visible = false;
            this.knifeGroup.visible = true;
        } else {
            this.gunGroup.visible = true;
            this.knifeGroup.visible = false;
        }

        if (this.isADS) {
            this.isADS = false;
            document.getElementById('ads-overlay').classList.add('hidden');
            this.camera.fov = 75;
            this.camera.updateProjectionMatrix();
        }

        this.updateHUD();
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
        this.bots.forEach(b => this.scene.remove(b.group));
        this.bots = [];

        // 5 Red Enemy Bots (Defenders) & 4 Cyan Allied Bots (Attackers)
        const redSpawns = [
            new THREE.Vector3(-35, 1.2, -30), // Site A
            new THREE.Vector3(35, 1.2, -30),  // Site B
            new THREE.Vector3(0, 1.2, -10),   // Mid
            new THREE.Vector3(-18, 1.2, -15), // A Short
            new THREE.Vector3(18, 1.2, -15)   // B Short
        ];

        const cyanSpawns = [
            new THREE.Vector3(-8, 1.2, 45),
            new THREE.Vector3(8, 1.2, 45),
            new THREE.Vector3(-20, 1.2, 35),
            new THREE.Vector3(20, 1.2, 35)
        ];

        // Red Enemies
        redSpawns.forEach((pos, idx) => {
            this.createBotEntity(`ENEMY_BOT_${idx + 1}`, 'Red', 0xff2a5f, pos);
        });

        // Cyan Allies
        cyanSpawns.forEach((pos, idx) => {
            this.createBotEntity(`ALLY_BOT_${idx + 1}`, 'Cyan', 0x00f0ff, pos);
        });
    }

    createBotEntity(id, team, colorHex, pos) {
        const botGroup = new THREE.Group();

        const bodyGeo = new THREE.CapsuleGeometry(0.45, 1.1, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        botGroup.add(bodyMesh);

        const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
        const visorMat = new THREE.MeshStandardMaterial({ color: 0xffb703, emissive: 0xffb703, emissiveIntensity: 0.5 });
        const headMesh = new THREE.Mesh(headGeo, visorMat);
        headMesh.position.set(0, 0.75, 0.1);
        botGroup.add(headMesh);

        const weaponGeo = new THREE.BoxGeometry(0.1, 0.1, 0.6);
        const weaponMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
        const weaponMesh = new THREE.Mesh(weaponGeo, weaponMat);
        weaponMesh.position.set(0.3, 0.2, -0.3);
        botGroup.add(weaponMesh);

        botGroup.position.copy(pos);
        this.scene.add(botGroup);

        this.bots.push({
            id,
            team,
            colorHex,
            group: botGroup,
            hitMesh: bodyMesh,
            health: 100,
            armor: 50,
            pos: botGroup.position,
            lastShotTime: 0,
            moveTarget: pos.clone()
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

        // Weapon Slot Switching Hotkeys
        if (e.code === 'Digit1') this.switchSlot(1);
        if (e.code === 'Digit2') this.switchSlot(2);
        if (e.code === 'Digit3') this.switchSlot(3);

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

    handleMouseWheel(e) {
        if (!this.isPointerLocked) return;
        if (e.deltaY > 0) {
            let nextSlot = this.activeSlot + 1;
            if (nextSlot > 3) nextSlot = 1;
            this.switchSlot(nextSlot);
        } else if (e.deltaY < 0) {
            let prevSlot = this.activeSlot - 1;
            if (prevSlot < 1) prevSlot = 3;
            this.switchSlot(prevSlot);
        }
    }

    handleMouseDown(e) {
        if (!this.isPointerLocked) return;
        if (e.button === 0) { // Primary Attack
            this.shootWeapon();
        } else if (e.button === 2 && this.activeSlot !== 3) { // Secondary ADS (Gun only)
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
        // Knife Melee Attack
        if (this.activeSlot === 3) {
            this.viewmodelRot.x = 0.4;
            this.viewmodelOffset.z = 0.15;
            if (window.soundEngine) window.soundEngine.playFootstep('metal');

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
            const hits = raycaster.intersectObjects(this.scene.children, true);

            if (hits.length > 0 && hits[0].distance < 3.5) {
                const targetBot = this.bots.find(b => b.team === 'Red' && (b.hitMesh === hits[0].object || b.group.children.includes(hits[0].object)));
                if (targetBot && targetBot.health > 0) {
                    targetBot.health -= 50;
                    this.createImpactSparks(hits[0].point, 0xff2a5f);
                    if (targetBot.health <= 0) {
                        this.scene.remove(targetBot.group);
                        window.uiManager.addKillfeedEntry('YOU', 'PLASMA BLADE', targetBot.id, false);
                        this.playerCredits += 200;
                    }
                }
            }
            return;
        }

        // Gun Attack
        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;

        if (window.soundEngine) {
            window.soundEngine.playGunshot(this.equippedWeapon.category.toLowerCase());
        }

        // Viewmodel Recoil Kickback
        this.viewmodelOffset.z = 0.08;
        this.viewmodelRot.x = 0.12;

        // Flash Muzzle Light
        this.muzzleLight.intensity = 3.0;
        setTimeout(() => this.muzzleLight.intensity = 0, 40);

        // Raycast Hitscan
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const hits = raycaster.intersectObjects(this.scene.children, true);

        // Calculate Precise Muzzle World Position
        const muzzlePos = new THREE.Vector3();
        this.muzzleLight.getWorldPosition(muzzlePos);

        let targetPos = muzzlePos.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));
        let hitTarget = null;
        let isHeadshot = false;

        for (let i = 0; i < hits.length; i++) {
            if (hits[i].object !== this.gunMesh && !hits[i].object.ancestorsOf(this.viewmodelContainer)) {
                targetPos = hits[i].point;
                const hitBot = this.bots.find(b => b.team === 'Red' && (b.hitMesh === hits[i].object || b.group.children.includes(hits[i].object)));
                if (hitBot) {
                    hitTarget = hitBot;
                    isHeadshot = targetPos.y > (hitBot.pos.y + 0.5);
                }
                break;
            }
        }

        // Create PERFECT PROPER BULLET TRACER cylinder along ray path
        this.createBulletTracer(muzzlePos, targetPos, 0x00f0ff);

        // Apply Damage if Enemy Hit
        if (hitTarget && hitTarget.health > 0) {
            const damage = isHeadshot ? Math.round(this.equippedWeapon.damage * this.equippedWeapon.headshotMult) : this.equippedWeapon.damage;
            hitTarget.health -= damage;

            if (isHeadshot && window.soundEngine) {
                window.soundEngine.playHeadshotPing();
            }

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
        // Compute exact beam direction and distance
        const direction = new THREE.Vector3().subVectors(to, from);
        const distance = direction.length();
        if (distance < 0.1) return;

        const tracerGeo = new THREE.CylinderGeometry(0.02, 0.02, distance, 8);
        tracerGeo.translate(0, distance / 2, 0); // Align origin to base of cylinder
        const tracerMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);

        tracer.position.copy(from);
        tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

        this.scene.add(tracer);
        this.tracers.push({ mesh: tracer, opacity: 0.95 });
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
        if (this.activeSlot === 3) return; // Cannot reload knife
        this.currentAmmo = this.equippedWeapon.magazine;
        this.updateHUD();
    }

    buyWeapon(weapon) {
        if (this.playerCredits >= weapon.cost) {
            this.playerCredits -= weapon.cost;
            if (weapon.category === 'Pistol') {
                this.inventory[2] = weapon;
            } else if (weapon.category !== 'Melee') {
                this.inventory[1] = weapon;
                this.switchSlot(1);
            }
            this.updateHUD();
            return true;
        }
        return false;
    }

    gameLoop(timestamp) {
        const delta = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.updatePlayerMovement(delta);
        this.updateViewmodel(delta);
        this.updateBotAI(delta, timestamp);
        this.updateTracersAndParticles(delta);
        this.updateTimers(delta);
        this.renderMinimap();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    updateViewmodel(delta) {
        const targetPos = (this.isADS && this.activeSlot !== 3) ? this.viewmodelADSPos : this.viewmodelDefaultPos;
        this.viewmodelContainer.position.lerp(targetPos.clone().add(this.viewmodelOffset), delta * 15);

        this.viewmodelOffset.lerp(new THREE.Vector3(), delta * 12);
        this.viewmodelRot.lerp(new THREE.Vector3(), delta * 12);

        this.viewmodelContainer.rotation.x = this.viewmodelRot.x;
    }

    updateBotAI(delta, timestamp) {
        // Bot Team vs Team Combat Engine
        const redBots = this.bots.filter(b => b.team === 'Red' && b.health > 0);
        const cyanBots = this.bots.filter(b => b.team === 'Cyan' && b.health > 0);

        // Update Red Enemy Bots
        redBots.forEach(bot => {
            // Check Player distance
            const distToPlayer = bot.pos.distanceTo(this.playerPos);

            if (distToPlayer < 35) {
                bot.group.lookAt(this.playerPos.x, bot.pos.y, this.playerPos.z);

                if (timestamp - bot.lastShotTime > 1100) {
                    bot.lastShotTime = timestamp;

                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, this.playerPos.clone().add(new THREE.Vector3(0, -0.3, 0)), 0xff2a5f);

                    if (window.soundEngine) window.soundEngine.playGunshot('rifle');

                    if (distToPlayer < 25 && Math.random() < 0.4) {
                        this.health = Math.max(0, this.health - 16);
                        this.updateHUD();
                        if (this.health <= 0) {
                            window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', 'YOU', false);
                        }
                    }
                }
            } else if (cyanBots.length > 0) { // Fight Allied Bots if player not in range
                const targetAlly = cyanBots[0];
                bot.group.lookAt(targetAlly.pos.x, bot.pos.y, targetAlly.pos.z);
                if (timestamp - bot.lastShotTime > 1400) {
                    bot.lastShotTime = timestamp;
                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, targetAlly.pos, 0xff2a5f);
                    targetAlly.health -= 25;
                    if (targetAlly.health <= 0) {
                        this.scene.remove(targetAlly.group);
                        window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', targetAlly.id, false);
                    }
                }
            }
        });

        // Update Cyan Allied Bots
        cyanBots.forEach(bot => {
            if (redBots.length > 0) {
                const targetRed = redBots[0];
                bot.group.lookAt(targetRed.pos.x, bot.pos.y, targetRed.pos.z);

                if (timestamp - bot.lastShotTime > 1300) {
                    bot.lastShotTime = timestamp;
                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, targetRed.pos, 0x00f0ff);
                    targetRed.health -= 30;
                    if (targetRed.health <= 0) {
                        this.scene.remove(targetRed.group);
                        window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', targetRed.id, false);
                    }
                }
            }
        });
    }

    updateTracersAndParticles(delta) {
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            t.opacity -= delta * 5;
            if (t.opacity <= 0) {
                this.scene.remove(t.mesh);
                this.tracers.splice(i, 1);
            } else {
                t.mesh.material.opacity = t.opacity;
            }
        }

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

        // Fast Knife Sprint Speed (10.0 u/s) vs Gun Speed (7.5 u/s)
        const baseSpeed = (this.activeSlot === 3) ? 10.5 : 7.5;
        const moveSpeed = (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) ? baseSpeed : 0;

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

        if (this.activeSlot === 3) {
            document.getElementById('hud-ammo-current').innerText = '∞';
            document.getElementById('hud-ammo-reserve').innerText = 'MELEE';
        } else {
            document.getElementById('hud-ammo-current').innerText = this.currentAmmo;
            document.getElementById('hud-ammo-reserve').innerText = this.reserveAmmo;
        }

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

        // Sites
        ctx.fillStyle = 'rgba(255, 183, 3, 0.4)';
        ctx.beginPath();
        ctx.arc(30, 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffb703';
        ctx.fillText('A', 26, 44);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(130, 40, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('B', 126, 44);

        // Bot Markers
        this.bots.forEach(bot => {
            if (bot.health > 0) {
                const bx = 80 + (bot.pos.x * 0.8);
                const bz = 80 + (bot.pos.z * 0.8);
                ctx.fillStyle = bot.colorHex === 0xff2a5f ? '#ff2a5f' : '#00f0ff';
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

THREE.Object3D.prototype.ancestorsOf = function(object) {
    let curr = object;
    while (curr) {
        if (curr === this) return true;
        curr = curr.parent;
    }
    return false;
};

window.VanguardGame = VanguardGame;
