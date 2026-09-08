// VANGUARD: ZERO Bullet-Proof 3D Game Engine Loop
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
        this.equippedHero = window.HEROES_DATA ? window.HEROES_DATA[0] : null;

        // Inventory
        this.inventory = {
            1: window.WEAPONS_DATA[5], // Aether V
            2: window.WEAPONS_DATA[1], // Venom-45
            3: window.WEAPONS_DATA[11] // Knife
        };
        this.activeSlot = 1;
        this.equippedWeapon = this.inventory[1];

        this.currentAmmo = this.equippedWeapon ? this.equippedWeapon.magazine : 25;
        this.reserveAmmo = this.equippedWeapon ? this.equippedWeapon.reserve : 75;
        this.isADS = false;

        this.keys = {};

        // Objective State
        this.coreState = 'IDLE';
        this.coreTimer = 45.0;
        this.corePlantProgress = 0;
        this.coreDefuseProgress = 0;

        // Round State
        this.currentRound = 1;
        this.matchPhase = 'ACTION_PHASE';
        this.phaseTimer = 100.0;

        this.bots = [];
        this.tracers = [];
        this.particles = [];
        this.killEffects = [];
        this.deathPings = [];
        this.killStreak = 0;
        this.lastKillTime = 0;

        this.viewmodelOffset = new THREE.Vector3();
        this.viewmodelRot = new THREE.Vector3();

        this.initEngine();
    }

    initEngine() {
        try {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.shadowMap.enabled = true;
            this.scene.background = new THREE.Color(0x1a233a);

            // Hemisphere & Directional Lights
            const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 0.8);
            this.scene.add(hemiLight);

            const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
            sunLight.position.set(50, 80, 50);
            sunLight.castShadow = true;
            this.scene.add(sunLight);

            // Build 3D Map
            this.mapSpawns = window.MapBuilder.buildNexusPrime(this.scene);

            // Create Viewmodels
            this.createViewmodels();

            // Spawn Bots immediately
            this.spawnBots();

            // Event Listeners
            this.canvas.addEventListener('click', () => {
                this.canvas.requestPointerLock();
                if (window.soundEngine) window.soundEngine.init();
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

            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.gameLoop(t));
        } catch (err) {
            console.error('[Vanguard Engine Error]', err);
        }
    }

    createViewmodels() {
        this.viewmodelContainer = new THREE.Group();

        // 1. GUN MESH
        this.gunGroup = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.12, 0.16, 0.55);
        const gunMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, metalness: 0.85, roughness: 0.2 });
        this.gunMesh = new THREE.Mesh(bodyGeo, gunMat);

        const barrelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.03, -0.4);
        this.gunMesh.add(barrel);

        const sightGeo = new THREE.BoxGeometry(0.06, 0.06, 0.15);
        const sightMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
        const sight = new THREE.Mesh(sightGeo, sightMat);
        sight.position.set(0, 0.11, -0.05);
        this.gunMesh.add(sight);

        this.muzzleLight = new THREE.PointLight(0xffb703, 0, 8);
        this.muzzleLight.position.set(0, 0.03, -0.65);
        this.gunMesh.add(this.muzzleLight);

        this.gunGroup.add(this.gunMesh);
        this.viewmodelContainer.add(this.gunGroup);

        // 2. KNIFE MESH
        this.knifeGroup = new THREE.Group();
        const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 12);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
        const handle = new THREE.Mesh(handleGeo, handleMat);

        const bladeGeo = new THREE.BoxGeometry(0.015, 0.35, 0.06);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.set(0, 0.25, 0);
        handle.add(blade);

        handle.rotation.x = Math.PI / 3;
        this.knifeGroup.add(handle);
        this.knifeGroup.visible = false;
        this.viewmodelContainer.add(this.knifeGroup);

        // Position Container
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

        if (slot === 3) {
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
        this.equippedHero = hero || (window.HEROES_DATA ? window.HEROES_DATA[0] : null);
        this.playerPos.copy(this.mapSpawns.atkSpawn);
        this.matchPhase = 'ACTION_PHASE';
        this.phaseTimer = 100.0;
        this.health = 100;
        this.armor = 50;

        this.spawnBots();
        this.updateHUD();
        this.renderMinimap();
    }

    spawnBots() {
        this.bots.forEach(b => this.scene.remove(b.group));
        this.bots = [];
        this.killStreak = 0;
        this.lastKillTime = 0;
        if (window.uiManager) window.uiManager.resetKillBanner();

        const enemyDefs = [
            // Site A Defenders & Perches
            { id: 'ENEMY_BOT_1', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(0, 1.2, 25) },
            { id: 'ENEMY_BOT_2', role: 'SNIPER', hp: 80, armor: 25, colorHex: 0xdb2777, pos: new THREE.Vector3(-12, 2.5, 20) },
            { id: 'ENEMY_BOT_3', role: 'JUGGERNAUT', hp: 200, armor: 100, colorHex: 0x991b1b, pos: new THREE.Vector3(12, 1.2, 20) },
            { id: 'ENEMY_BOT_4', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(-28, 1.2, 35) },
            
            // Mid Lane & Chokepoints
            { id: 'ENEMY_BOT_5', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(0, 1.2, -5) },
            { id: 'ENEMY_BOT_6', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(-18, 1.2, 5) },
            { id: 'ENEMY_BOT_7', role: 'SNIPER', hp: 80, armor: 25, colorHex: 0xdb2777, pos: new THREE.Vector3(18, 2.5, -10) },

            // Site B Defenders
            { id: 'ENEMY_BOT_8', role: 'JUGGERNAUT', hp: 200, armor: 100, colorHex: 0x991b1b, pos: new THREE.Vector3(-35, 1.2, -30) },
            { id: 'ENEMY_BOT_9', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(35, 1.2, -30) },
            { id: 'ENEMY_BOT_10', role: 'ASSAULT', hp: 100, armor: 50, colorHex: 0xff2a5f, pos: new THREE.Vector3(-25, 1.2, -20) },
            { id: 'ENEMY_BOT_11', role: 'SNIPER', hp: 80, armor: 25, colorHex: 0xdb2777, pos: new THREE.Vector3(25, 2.8, -25) },

            // Defender Spawn & Flank Guards
            { id: 'ENEMY_BOT_12', role: 'JUGGERNAUT', hp: 200, armor: 100, colorHex: 0x991b1b, pos: new THREE.Vector3(0, 1.2, -45) }
        ];

        enemyDefs.forEach((def) => {
            this.createBotEntity(def.id, 'Red', def.role, def.colorHex, def.pos, def.hp, def.armor);
        });

        const allyPositions = [
            new THREE.Vector3(-5, 1.2, 45),
            new THREE.Vector3(5, 1.2, 45),
            new THREE.Vector3(-15, 1.2, 40),
            new THREE.Vector3(15, 1.2, 40)
        ];

        allyPositions.forEach((pos, idx) => {
            this.createBotEntity(`ALLY_BOT_${idx + 1}`, 'Cyan', 'ASSAULT', 0x00f0ff, pos, 100, 50);
        });
    }

    createBotEntity(id, team, role = 'ASSAULT', colorHex = 0xff2a5f, pos, maxHp = 100, maxArmor = 50) {
        const botGroup = new THREE.Group();

        // 1. Capsule Body
        const bodyGeo = new THREE.CapsuleGeometry(role === 'JUGGERNAUT' ? 0.65 : 0.5, 1.2, 8, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.3,
            emissive: colorHex,
            emissiveIntensity: 0.35
        });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        botGroup.add(bodyMesh);

        // 2. Head & Visor
        const headGeo = new THREE.SphereGeometry(role === 'JUGGERNAUT' ? 0.4 : 0.35, 16, 16);
        const visorMat = new THREE.MeshStandardMaterial({
            color: role === 'SNIPER' ? 0xec4899 : 0xffb703,
            emissive: role === 'SNIPER' ? 0xec4899 : 0xffb703,
            emissiveIntensity: 0.9
        });
        const headMesh = new THREE.Mesh(headGeo, visorMat);
        headMesh.position.set(0, 0.8, 0.1);
        botGroup.add(headMesh);

        // 3. Juggernaut Heavy Shoulder Armor Pads
        if (role === 'JUGGERNAUT') {
            const padGeo = new THREE.BoxGeometry(0.35, 0.35, 0.45);
            const padMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.9 });
            const leftPad = new THREE.Mesh(padGeo, padMat);
            leftPad.position.set(-0.65, 0.5, 0);
            const rightPad = new THREE.Mesh(padGeo, padMat);
            rightPad.position.set(0.65, 0.5, 0);
            botGroup.add(leftPad);
            botGroup.add(rightPad);
        }

        // 4. Weapon Mesh
        const weaponGeo = new THREE.BoxGeometry(0.12, 0.12, role === 'SNIPER' ? 0.95 : 0.65);
        const weaponMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
        const weaponMesh = new THREE.Mesh(weaponGeo, weaponMat);
        weaponMesh.position.set(0.32, 0.2, -0.3);
        botGroup.add(weaponMesh);

        // 5. Point Light Aura
        const botLight = new THREE.PointLight(colorHex, 1.5, 8);
        botLight.position.set(0, 1.2, 0);
        botGroup.add(botLight);

        // 6. Floating Overhead 3D Health Bar Canvas Sprite
        const hpInfo = this.createBotHealthBar(id, role, maxHp, maxHp, maxArmor, colorHex);
        botGroup.add(hpInfo.sprite);

        botGroup.position.copy(pos);
        this.scene.add(botGroup);

        this.bots.push({
            id,
            team,
            role,
            colorHex,
            group: botGroup,
            hitMesh: bodyMesh,
            health: maxHp,
            maxHealth: maxHp,
            armor: maxArmor,
            pos: botGroup.position,
            basePos: pos.clone(),
            strafeSeed: Math.random() * 100,
            hpInfo: hpInfo,
            lastShotTime: 0
        });
    }

    createBotHealthBar(id, role, health, maxHealth, armor, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.8, 0.45, 1);
        sprite.position.set(0, 1.85, 0);

        this.drawHealthBarCanvas(canvas, ctx, texture, id, role, health, maxHealth, armor, colorHex);

        return { sprite, canvas, ctx, texture };
    }

    drawHealthBarCanvas(canvas, ctx, texture, id, role, health, maxHealth, armor, colorHex) {
        ctx.clearRect(0, 0, 256, 64);

        ctx.fillStyle = 'rgba(10, 15, 25, 0.88)';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = colorHex === 0x00f0ff ? '#00f0ff' : '#ff2a5f';
        ctx.lineWidth = 3;
        ctx.strokeRect(1, 1, 254, 62);

        ctx.font = 'bold 15px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${id}`, 10, 22);

        ctx.font = 'bold 12px Rajdhani, sans-serif';
        ctx.fillStyle = colorHex === 0x00f0ff ? '#00f0ff' : '#ffb703';
        ctx.fillText(`[${role}]`, 140, 22);

        if (armor > 0) {
            ctx.font = '13px Rajdhani, sans-serif';
            ctx.fillStyle = '#00f0ff';
            ctx.fillText(`🛡️${armor}`, 205, 22);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(10, 32, 236, 20);

        const pct = Math.max(0, health / maxHealth);
        let fillColor = '#00ff87';
        if (pct < 0.35) fillColor = '#ff2a5f';
        else if (pct < 0.65) fillColor = '#ffb703';

        ctx.fillStyle = fillColor;
        ctx.fillRect(10, 32, 236 * pct, 20);

        ctx.font = 'bold 13px Rajdhani, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${Math.max(0, health)} / ${maxHealth}`, 95, 47);

        texture.needsUpdate = true;
    }

    updateBotHealthBar(bot) {
        if (bot && bot.hpInfo) {
            this.drawHealthBarCanvas(
                bot.hpInfo.canvas,
                bot.hpInfo.ctx,
                bot.hpInfo.texture,
                bot.id,
                bot.role || 'ASSAULT',
                bot.health,
                bot.maxHealth || 100,
                bot.armor || 0,
                bot.colorHex
            );
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

        if (e.code === 'Escape') {
            if (window.uiManager) {
                window.uiManager.showMainMenu();
            }
        }

        if (e.code === 'Digit1') this.switchSlot(1);
        if (e.code === 'Digit2') this.switchSlot(2);
        if (e.code === 'Digit3') this.switchSlot(3);

        if (e.code === 'KeyK') {
            this.spawnBots();
            if (window.uiManager) window.uiManager.addKillfeedEntry('SYSTEM', 'RESPAWN BOTS', 'READY', false);
        }

        if (e.code === 'KeyB') {
            if (window.uiManager) window.uiManager.toggleBuyMenu(document.getElementById('buy-menu').classList.contains('hidden'));
        }
        if (e.code === 'Tab') {
            e.preventDefault();
            if (window.uiManager) window.uiManager.toggleScoreboard(true);
        }
        if (e.code === 'KeyR') {
            this.reload();
        }

        if (e.code === 'KeyC') this.triggerAbility(0);
        if (e.code === 'KeyQ') this.triggerAbility(1);
        if (e.code === 'KeyE') this.triggerAbility(2);
        if (e.code === 'KeyX') this.triggerAbility(3);
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
        if (e.code === 'Tab') {
            if (window.uiManager) window.uiManager.toggleScoreboard(false);
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
        if (e.button === 0) {
            this.shootWeapon();
        } else if (e.button === 2 && this.activeSlot !== 3) {
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
            if (window.uiManager) window.uiManager.addKillfeedEntry(this.equippedHero.name, ability.name, 'TACTICAL ZONE', false);
        }
    }

    shootWeapon() {
        if (this.activeSlot === 3) { // Knife
            this.viewmodelRot.x = 0.45;
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
                        this.onPlayerKill(targetBot, 'PLASMA BLADE', false);
                    }
                }
            }
            return;
        }

        if (this.currentAmmo <= 0) return;
        this.currentAmmo--;

        if (window.soundEngine) {
            window.soundEngine.playGunshot(this.equippedWeapon ? this.equippedWeapon.category.toLowerCase() : 'rifle');
        }

        this.viewmodelOffset.z = 0.08;
        this.viewmodelRot.x = 0.12;

        if (this.muzzleLight) {
            this.muzzleLight.intensity = 3.0;
            setTimeout(() => { if (this.muzzleLight) this.muzzleLight.intensity = 0; }, 40);
        }

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const hits = raycaster.intersectObjects(this.scene.children, true);

        const muzzlePos = new THREE.Vector3();
        if (this.muzzleLight) {
            this.muzzleLight.getWorldPosition(muzzlePos);
        } else {
            muzzlePos.copy(this.camera.position);
        }

        let targetPos = muzzlePos.clone().add(raycaster.ray.direction.clone().multiplyScalar(60));
        let hitTarget = null;
        let isHeadshot = false;

        for (let i = 0; i < hits.length; i++) {
            if (this.gunMesh && hits[i].object !== this.gunMesh && !hits[i].object.ancestorsOf(this.viewmodelContainer)) {
                targetPos = hits[i].point;
                const hitBot = this.bots.find(b => b.team === 'Red' && (b.hitMesh === hits[i].object || b.group.children.includes(hits[i].object)));
                if (hitBot) {
                    hitTarget = hitBot;
                    isHeadshot = targetPos.y > (hitBot.pos.y + 0.5);
                }
                break;
            }
        }

        this.createBulletTracer(muzzlePos, targetPos, 0x00f0ff);

        if (hitTarget && hitTarget.health > 0) {
            const damage = isHeadshot ? Math.round(this.equippedWeapon.damage * this.equippedWeapon.headshotMult) : this.equippedWeapon.damage;
            hitTarget.health -= damage;
            this.updateBotHealthBar(hitTarget);

            if (isHeadshot && window.soundEngine) {
                window.soundEngine.playHeadshotPing();
            }

            this.createImpactSparks(targetPos, 0xff2a5f);

            if (hitTarget.health <= 0) {
                this.onPlayerKill(hitTarget, this.equippedWeapon.name, isHeadshot);
            }
        } else {
            this.createImpactSparks(targetPos, 0xffb703);
        }

        this.updateHUD();
    }

    createBulletTracer(from, to, colorHex) {
        if (!from || !to) return;
        const direction = new THREE.Vector3().subVectors(to, from);
        const distance = direction.length();
        if (distance < 0.5 || isNaN(distance)) return;

        const dirNormalized = direction.clone().normalize();
        if (isNaN(dirNormalized.x) || isNaN(dirNormalized.y) || isNaN(dirNormalized.z)) return;

        const tracerGeo = new THREE.CylinderGeometry(0.02, 0.02, distance, 8);
        tracerGeo.translate(0, distance / 2, 0);
        const tracerMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);

        tracer.position.copy(from);
        tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNormalized);

        this.scene.add(tracer);
        this.tracers.push({ mesh: tracer, opacity: 0.95 });
    }

    createImpactSparks(pos, colorHex) {
        if (!pos) return;
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

    onPlayerKill(hitBot, weaponName, isHeadshot) {
        const now = performance.now();
        if (now - this.lastKillTime < 10000) {
            this.killStreak = Math.min(this.killStreak + 1, 5);
        } else {
            this.killStreak = 1;
        }
        this.lastKillTime = now;

        const deathPos = hitBot.pos.clone();
        this.scene.remove(hitBot.group);

        this.createKillEffect(deathPos, hitBot.colorHex || 0xff2a5f, isHeadshot, this.killStreak, hitBot.group);

        this.deathPings.push({
            pos: deathPos.clone(),
            time: 2.5
        });

        if (window.soundEngine) {
            window.soundEngine.playKillChime(this.killStreak, isHeadshot);
        }

        if (window.uiManager) {
            window.uiManager.showKillBanner({
                killer: 'YOU',
                weapon: weaponName,
                victim: hitBot.id,
                streakCount: this.killStreak,
                isHeadshot: isHeadshot
            });
            window.uiManager.addKillfeedEntry('YOU', weaponName, hitBot.id, isHeadshot);
        }

        this.viewmodelRot.x = -0.15;
        this.viewmodelOffset.z = 0.12;

        this.playerCredits += 200;
    }

    createKillEffect(pos, colorHex, isHeadshot, streakCount, originalGroup) {
        // 1. Dissolving Emissive Ghost Body
        if (originalGroup) {
            const ghost = originalGroup.clone(true);
            ghost.position.copy(originalGroup.position);
            ghost.traverse((child) => {
                if (child.isMesh) {
                    child.material = child.material.clone();
                    child.material.transparent = true;
                    child.material.emissive = new THREE.Color(streakCount === 5 ? 0xffb703 : colorHex);
                    child.material.emissiveIntensity = 2.5;
                    child.material.opacity = 0.95;
                }
            });
            this.scene.add(ghost);
            this.killEffects.push({
                type: 'ghost',
                mesh: ghost,
                scaleSpeed: 1.2,
                life: 0.35,
                maxLife: 0.35
            });
        }

        // 2. Ground Shockwave Ring
        const ringGeo = new THREE.RingGeometry(0.3, 0.6, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: streakCount === 5 ? 0xffb703 : (isHeadshot ? 0xff2a5f : colorHex),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos).add(new THREE.Vector3(0, 0.05, 0));
        this.scene.add(ringMesh);

        this.killEffects.push({
            type: 'ring',
            mesh: ringMesh,
            maxScale: 6.5,
            life: 0.75,
            maxLife: 0.75
        });

        // 3. Vertical Energy Light Pillar
        const pillarGeo = new THREE.CylinderGeometry(0.4, 0.9, 5.0, 16);
        const pillarMat = new THREE.MeshBasicMaterial({
            color: streakCount === 5 ? 0xffb703 : colorHex,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
        pillarMesh.position.copy(pos).add(new THREE.Vector3(0, 2.5, 0));
        this.scene.add(pillarMesh);

        this.killEffects.push({
            type: 'pillar',
            mesh: pillarMesh,
            life: 0.5,
            maxLife: 0.5
        });

        // 4. Floating 3D Holographic Crest Ring
        const crestGeo = new THREE.TorusGeometry(0.65, 0.06, 12, 32);
        crestGeo.rotateX(Math.PI / 2);
        const crestMat = new THREE.MeshBasicMaterial({
            color: streakCount === 5 ? 0xffb703 : (isHeadshot ? 0xff2a5f : 0x00f0ff),
            transparent: true,
            opacity: 0.95
        });
        const crestMesh = new THREE.Mesh(crestGeo, crestMat);
        crestMesh.position.copy(pos).add(new THREE.Vector3(0, 1.8, 0));
        this.scene.add(crestMesh);

        this.killEffects.push({
            type: 'crest',
            mesh: crestMesh,
            rotSpeed: 4.5,
            riseSpeed: 1.8,
            life: 1.0,
            maxLife: 1.0
        });

        // 5. Rising Spark Embers
        for (let i = 0; i < 28; i++) {
            const pGeo = new THREE.BufferGeometry();
            const pMat = new THREE.PointsMaterial({
                color: isHeadshot ? 0xff2a5f : (streakCount === 5 ? 0xffb703 : colorHex),
                size: 0.12,
                transparent: true,
                opacity: 1
            });
            const pMesh = new THREE.Points(pGeo, pMat);
            pMesh.position.copy(pos).add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.8,
                Math.random() * 1.5,
                (Math.random() - 0.5) * 0.8
            ));

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                Math.random() * 7 + 2,
                (Math.random() - 0.5) * 6
            );

            this.scene.add(pMesh);
            this.particles.push({
                mesh: pMesh,
                velocity: vel,
                life: Math.random() * 0.6 + 0.4
            });
        }
    }

    reload() {
        if (this.activeSlot === 3 || !this.equippedWeapon) return;
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
        try {
            const delta = Math.min(Math.max((timestamp - this.lastTime) / 1000, 0.001), 0.1);
            this.lastTime = timestamp;

            this.updatePlayerMovement(delta);
            this.updateViewmodel(delta);
            this.updateBotAI(delta, timestamp);
            this.updateTracersAndParticles(delta);
            this.updateTimers(delta);
            this.renderMinimap();

            this.renderer.render(this.scene, this.camera);
        } catch (err) {
            console.error('[Loop Exception Handler]', err);
        }
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
        const redBots = this.bots.filter(b => b.team === 'Red' && b.health > 0);
        const cyanBots = this.bots.filter(b => b.team === 'Cyan' && b.health > 0);

        redBots.forEach(bot => {
            // 1. Billboard 3D Overhead Health Bar to Camera
            if (bot.hpInfo && bot.hpInfo.sprite) {
                bot.hpInfo.sprite.lookAt(this.camera.position);
            }

            // 2. Tactical Side-to-Side Strafe Movement
            if (bot.basePos) {
                const strafeAmount = bot.role === 'SNIPER' ? 0.4 : (bot.role === 'JUGGERNAUT' ? 0.6 : 1.8);
                const strafeX = Math.sin(timestamp * 0.0025 + bot.strafeSeed) * strafeAmount;
                bot.group.position.x = bot.basePos.x + strafeX;
            }

            const distToPlayer = bot.pos.distanceTo(this.playerPos);

            if (distToPlayer < 50) {
                const targetLook = new THREE.Vector3(this.playerPos.x, bot.pos.y, this.playerPos.z);
                if (bot.pos.distanceTo(targetLook) > 0.1) {
                    bot.group.lookAt(targetLook);
                }

                const shotCooldown = bot.role === 'SNIPER' ? 1800 : (bot.role === 'JUGGERNAUT' ? 700 : 1200);

                if (timestamp - bot.lastShotTime > shotCooldown) {
                    bot.lastShotTime = timestamp;

                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    const tracerColor = bot.role === 'SNIPER' ? 0xdb2777 : 0xff2a5f;
                    this.createBulletTracer(botMuzzle, this.playerPos.clone().add(new THREE.Vector3(0, -0.3, 0)), tracerColor);

                    if (window.soundEngine) window.soundEngine.playGunshot(bot.role === 'SNIPER' ? 'sniper' : 'rifle');

                    if (distToPlayer < 40 && Math.random() < (bot.role === 'SNIPER' ? 0.5 : 0.3)) {
                        const botDamage = bot.role === 'SNIPER' ? 25 : (bot.role === 'JUGGERNAUT' ? 8 : 12);
                        this.health = Math.max(0, this.health - botDamage);
                        this.updateHUD();
                        if (this.health <= 0 && window.uiManager) {
                            window.uiManager.addKillfeedEntry(bot.id, bot.role === 'SNIPER' ? 'APEX-9' : 'AETHER V', 'YOU', false);
                        }
                    }
                }
            } else if (cyanBots.length > 0) {
                const targetAlly = cyanBots[0];
                const targetLook = new THREE.Vector3(targetAlly.pos.x, bot.pos.y, targetAlly.pos.z);
                if (bot.pos.distanceTo(targetLook) > 0.1) {
                    bot.group.lookAt(targetLook);
                }

                if (timestamp - bot.lastShotTime > 1500) {
                    bot.lastShotTime = timestamp;
                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, targetAlly.pos, 0xff2a5f);
                    targetAlly.health -= 25;
                    this.updateBotHealthBar(targetAlly);
                    if (targetAlly.health <= 0) {
                        this.scene.remove(targetAlly.group);
                        if (window.uiManager) window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', targetAlly.id, false);
                    }
                }
            }
        });

        cyanBots.forEach(bot => {
            if (bot.hpInfo && bot.hpInfo.sprite) {
                bot.hpInfo.sprite.lookAt(this.camera.position);
            }

            if (redBots.length > 0) {
                const targetRed = redBots[0];
                const targetLook = new THREE.Vector3(targetRed.pos.x, bot.pos.y, targetRed.pos.z);
                if (bot.pos.distanceTo(targetLook) > 0.1) {
                    bot.group.lookAt(targetLook);
                }

                if (timestamp - bot.lastShotTime > 1400) {
                    bot.lastShotTime = timestamp;
                    const botMuzzle = bot.pos.clone().add(new THREE.Vector3(0, 0.4, 0));
                    this.createBulletTracer(botMuzzle, targetRed.pos, 0x00f0ff);
                    targetRed.health -= 30;
                    this.updateBotHealthBar(targetRed);
                    if (targetRed.health <= 0) {
                        this.scene.remove(targetRed.group);
                        if (window.uiManager) window.uiManager.addKillfeedEntry(bot.id, 'AETHER V', targetRed.id, false);
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

        // Update Kill FX
        for (let i = this.killEffects.length - 1; i >= 0; i--) {
            const fx = this.killEffects[i];
            fx.life -= delta;

            if (fx.life <= 0) {
                this.scene.remove(fx.mesh);
                this.killEffects.splice(i, 1);
                continue;
            }

            const progress = 1 - (fx.life / fx.maxLife);

            if (fx.type === 'ghost') {
                fx.mesh.scale.addScalar(fx.scaleSpeed * delta);
                fx.mesh.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = (fx.life / fx.maxLife) * 0.95;
                    }
                });
            } else if (fx.type === 'ring') {
                const s = 1 + progress * (fx.maxScale - 1);
                fx.mesh.scale.set(s, 1, s);
                fx.mesh.material.opacity = (1 - progress) * 0.9;
            } else if (fx.type === 'pillar') {
                fx.mesh.scale.set(1 + progress * 0.5, 1 + progress * 0.2, 1 + progress * 0.5);
                fx.mesh.material.opacity = (1 - progress) * 0.75;
            } else if (fx.type === 'crest') {
                fx.mesh.rotation.z += fx.rotSpeed * delta;
                fx.mesh.position.y += fx.riseSpeed * delta;
                fx.mesh.material.opacity = (1 - progress) * 0.95;
            }
        }

        // Update Death Pings for Minimap
        for (let i = this.deathPings.length - 1; i >= 0; i--) {
            this.deathPings[i].time -= delta;
            if (this.deathPings[i].time <= 0) {
                this.deathPings.splice(i, 1);
            }
        }
    }

    updatePlayerMovement(delta) {
        if (!this.isPointerLocked) return;

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

        const distSiteA = this.playerPos.distanceTo(this.mapSpawns.siteA);
        const distSiteB = this.playerPos.distanceTo(this.mapSpawns.siteB);

        const promptBar = document.getElementById('interaction-bar-container');
        const fillBar = document.getElementById('interaction-progress-fill');
        const labelText = document.getElementById('interaction-label');

        if (promptBar && fillBar && labelText) {
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
                        if (window.uiManager) window.uiManager.addKillfeedEntry('ATTACKERS', 'CORE DEVICE', 'SITE A', false);
                    }
                } else if (this.coreState === 'PLANTED') {
                    this.coreDefuseProgress += delta;
                    labelText.innerText = 'DEFUSING CORE...';
                    fillBar.style.width = `${(this.coreDefuseProgress / 7.0) * 100}%`;

                    if (this.coreDefuseProgress >= 7.0) {
                        this.coreState = 'DEFUSED';
                        document.getElementById('core-status-banner').classList.add('hidden');
                        if (window.uiManager) window.uiManager.addKillfeedEntry('DEFENDERS', 'DEFUSE DEVICE', 'CORE', false);
                    }
                }
            } else {
                promptBar.classList.add('hidden');
                this.corePlantProgress = 0;
                if (this.coreState !== 'PLANTED') this.coreDefuseProgress = 0;
            }
        }
    }

    updateTimers(delta) {
        if (this.phaseTimer > 0) {
            this.phaseTimer -= delta;
            const mins = Math.floor(this.phaseTimer / 60);
            const secs = Math.floor(this.phaseTimer % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('hud-timer');
            if (timerEl) timerEl.innerText = `${mins}:${secs}`;
        }

        if (this.coreState === 'PLANTED') {
            this.coreTimer -= delta;
            if (Math.floor(this.coreTimer * 2) % 2 === 0 && window.soundEngine) {
                window.soundEngine.playCoreBeep();
            }
        }
    }

    updateHUD() {
        const hpVal = document.getElementById('hud-health-val');
        const hpFill = document.getElementById('hud-health-fill');
        const wpName = document.getElementById('hud-weapon-name');
        const ammoCur = document.getElementById('hud-ammo-current');
        const ammoRes = document.getElementById('hud-ammo-reserve');

        if (hpVal) hpVal.innerText = Math.max(0, this.health);
        if (hpFill) hpFill.style.width = `${this.health}%`;
        if (wpName && this.equippedWeapon) wpName.innerText = this.equippedWeapon.name.toUpperCase();

        if (ammoCur && ammoRes) {
            if (this.activeSlot === 3) {
                ammoCur.innerText = '∞';
                ammoRes.innerText = 'MELEE';
            } else {
                ammoCur.innerText = this.currentAmmo;
                ammoRes.innerText = this.reserveAmmo;
            }
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

        // Minimap Death Markers Pings
        this.deathPings.forEach(dp => {
            const dx = 80 + (dp.pos.x * 0.8);
            const dz = 80 + (dp.pos.z * 0.8);
            const alpha = Math.min(1, dp.time / 1.0);

            ctx.strokeStyle = `rgba(255, 42, 95, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(dx, dz, Math.max(3, 8 + (2.5 - dp.time) * 4), 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 42, 95, ${alpha})`;
            ctx.font = '10px Orbitron, sans-serif';
            ctx.fillText('☠', dx - 4, dz + 3);
        });

        // Player Dot
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
