// VANGUARD: ZERO 3D Map Architecture Generator using Three.js
class MapBuilder {
    static buildNexusPrime(scene) {
        const materials = {
            floor: new THREE.MeshStandardMaterial({ color: 0x182030, roughness: 0.8 }),
            wall: new THREE.MeshStandardMaterial({ color: 0x28344a, roughness: 0.6 }),
            cover: new THREE.MeshStandardMaterial({ color: 0x3e4f6e, roughness: 0.4 }),
            siteA: new THREE.MeshStandardMaterial({ color: 0xffb703, opacity: 0.6, transparent: true }),
            siteB: new THREE.MeshStandardMaterial({ color: 0x00f0ff, opacity: 0.6, transparent: true }),
            metal: new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7, roughness: 0.3 })
        };

        // 1. Ground Floor Plane (120m x 120m)
        const floorGeo = new THREE.PlaneGeometry(140, 140);
        const floor = new THREE.Mesh(floorGeo, materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Grid lines on floor for spatial orientation
        const grid = new THREE.GridHelper(140, 70, 0x00f0ff, 0x1e293b);
        grid.position.y = 0.05;
        scene.add(grid);

        // 2. Perimeter Outer Walls
        this.addWall(scene, 0, 10, -70, 140, 20, 2, materials.wall); // North
        this.addWall(scene, 0, 10, 70, 140, 20, 2, materials.wall);  // South
        this.addWall(scene, -70, 10, 0, 2, 20, 140, materials.wall); // West
        this.addWall(scene, 70, 10, 0, 2, 20, 140, materials.wall);  // East

        // 3. SITE A (West Side - X: -35, Z: -30)
        // Site A Ring Zone
        const siteAGeo = new THREE.CylinderGeometry(10, 10, 0.2, 32);
        const siteAMesh = new THREE.Mesh(siteAGeo, materials.siteA);
        siteAMesh.position.set(-35, 0.1, -30);
        scene.add(siteAMesh);

        // Site A Boxes & Cover
        this.addWall(scene, -35, 2, -30, 4, 4, 4, materials.cover); // Center Core Box
        this.addWall(scene, -42, 3, -35, 6, 6, 3, materials.cover); // Rafters Support
        this.addWall(scene, -28, 2, -22, 3, 4, 6, materials.cover); // Default Plant Cover

        // 4. SITE B (East Side - X: 35, Z: -30)
        // Site B Ring Zone
        const siteBGeo = new THREE.CylinderGeometry(10, 10, 0.2, 32);
        const siteBMesh = new THREE.Mesh(siteBGeo, materials.siteB);
        siteBMesh.position.set(35, 0.1, -30);
        scene.add(siteBMesh);

        // Site B Boxes & Containers
        this.addWall(scene, 35, 2, -30, 4, 4, 4, materials.cover); // Center Core Box
        this.addWall(scene, 40, 2.5, -25, 5, 5, 5, materials.metal); // Shipping Container
        this.addWall(scene, 28, 2, -36, 6, 4, 3, materials.cover); // Back Site Pillar

        // 5. MID LANE & CHOKE POINTS
        // Mid Pillars & Dividers
        this.addWall(scene, 0, 6, -10, 12, 12, 40, materials.wall); // Mid Center Block
        this.addWall(scene, -18, 5, -5, 4, 10, 20, materials.wall); // A Short Wall
        this.addWall(scene, 18, 5, -5, 4, 10, 20, materials.wall);  // B Short Wall

        // 6. SPAWN ZONES
        // Attackers Spawn (South: Z = 45)
        this.addWall(scene, 0, 2, 45, 8, 4, 2, materials.metal); // Atk Barrier Box
        // Defenders Spawn (North: Z = -50)
        this.addWall(scene, 0, 2, -50, 8, 4, 2, materials.metal); // Def Spawn Pillar

        // 7. Tactical Lights
        const lightA = new THREE.PointLight(0xffb703, 1.5, 30);
        lightA.position.set(-35, 12, -30);
        scene.add(lightA);

        const lightB = new THREE.PointLight(0x00f0ff, 1.5, 30);
        lightB.position.set(35, 12, -30);
        scene.add(lightB);

        const lightMid = new THREE.PointLight(0xffffff, 1.0, 40);
        lightMid.position.set(0, 15, 0);
        scene.add(lightMid);

        return {
            siteA: new THREE.Vector3(-35, 0, -30),
            siteB: new THREE.Vector3(35, 0, -30),
            atkSpawn: new THREE.Vector3(0, 1.6, 50),
            defSpawn: new THREE.Vector3(0, 1.6, -55)
        };
    }

    static addWall(scene, x, y, z, w, h, d, mat) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
    }
}

window.MapBuilder = MapBuilder;
