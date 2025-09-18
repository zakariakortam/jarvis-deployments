// Minecraft Clone Game Engine
class MinecraftClone {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = {};
        this.world = new World();
        this.player = new Player();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedBlock = 'grass';
        this.isFlying = false;
        this.chunks = new Map();
        
        this.init();
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupControls();
        this.setupEventListeners();
        this.generateInitialWorld();
        this.animate();
        
        document.getElementById('loading').style.display = 'none';
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 80, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false
        };
    }

    setupEventListeners() {
        // Pointer lock
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });

        // Mouse movement
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                this.player.updateRotation(event.movementX, event.movementY);
            }
        });

        // Mouse clicks
        document.addEventListener('mousedown', (event) => {
            if (document.pointerLockElement === document.body) {
                if (event.button === 0) { // Left click - break block
                    this.breakBlock();
                } else if (event.button === 2) { // Right click - place block
                    this.placeBlock();
                }
            }
        });

        // Keyboard
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW': this.controls.forward = true; break;
                case 'KeyS': this.controls.backward = true; break;
                case 'KeyA': this.controls.left = true; break;
                case 'KeyD': this.controls.right = true; break;
                case 'Space': 
                    event.preventDefault();
                    this.controls.jump = true; 
                    break;
                case 'ShiftLeft': this.controls.sprint = true; break;
                case 'KeyF': 
                    this.isFlying = !this.isFlying;
                    this.player.setFlying(this.isFlying);
                    break;
                case 'Digit1': this.selectBlock('grass'); break;
                case 'Digit2': this.selectBlock('dirt'); break;
                case 'Digit3': this.selectBlock('stone'); break;
                case 'Digit4': this.selectBlock('wood'); break;
                case 'Digit5': this.selectBlock('leaves'); break;
                case 'Digit6': this.selectBlock('sand'); break;
                case 'Digit7': this.selectBlock('water'); break;
                case 'Digit8': this.selectBlock('cobblestone'); break;
                case 'Digit9': this.selectBlock('bedrock'); break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW': this.controls.forward = false; break;
                case 'KeyS': this.controls.backward = false; break;
                case 'KeyA': this.controls.left = false; break;
                case 'KeyD': this.controls.right = false; break;
                case 'Space': this.controls.jump = false; break;
                case 'ShiftLeft': this.controls.sprint = false; break;
            }
        });

        // Inventory clicks
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.selectBlock(slot.dataset.block);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Prevent context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
    }

    selectBlock(blockType) {
        this.selectedBlock = blockType;
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.remove('active');
        });
        document.querySelector(`[data-block="${blockType}"]`).classList.add('active');
    }

    generateInitialWorld() {
        const chunkSize = 16;
        const renderDistance = 3;
        
        for (let x = -renderDistance; x <= renderDistance; x++) {
            for (let z = -renderDistance; z <= renderDistance; z++) {
                this.world.generateChunk(x, z);
            }
        }

        this.world.generateMeshes(this.scene);
    }

    breakBlock() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const position = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(-0.5));
            const blockPos = {
                x: Math.floor(position.x),
                y: Math.floor(position.y),
                z: Math.floor(position.z)
            };

            this.world.removeBlock(blockPos.x, blockPos.y, blockPos.z);
            this.world.updateChunkMeshes(this.scene);
        }
    }

    placeBlock() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const position = intersect.point.clone().add(intersect.face.normal.clone().multiplyScalar(0.5));
            const blockPos = {
                x: Math.floor(position.x),
                y: Math.floor(position.y),
                z: Math.floor(position.z)
            };

            // Don't place block where player is
            const playerPos = this.camera.position;
            if (Math.abs(blockPos.x - playerPos.x) < 1 && 
                Math.abs(blockPos.y - playerPos.y) < 2 && 
                Math.abs(blockPos.z - playerPos.z) < 1) {
                return;
            }

            this.world.setBlock(blockPos.x, blockPos.y, blockPos.z, this.selectedBlock);
            this.world.updateChunkMeshes(this.scene);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update player
        this.player.update(this.controls, this.world);
        
        // Update camera position
        this.camera.position.copy(this.player.position);
        this.camera.rotation.copy(this.player.rotation);

        // Update UI
        this.updateUI();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    updateUI() {
        const pos = this.player.position;
        document.getElementById('position').textContent = 
            `${Math.floor(pos.x)}, ${Math.floor(pos.y)}, ${Math.floor(pos.z)}`;
        
        document.getElementById('chunks').textContent = this.world.chunks.size;
    }
}

// Player class
class Player {
    constructor() {
        this.position = new THREE.Vector3(0, 80, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isFlying = false;
        this.onGround = false;
        this.speed = 5;
        this.jumpPower = 12;
        this.sensitivity = 0.002;
    }

    updateRotation(deltaX, deltaY) {
        this.rotation.y -= deltaX * this.sensitivity;
        this.rotation.x -= deltaY * this.sensitivity;
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    }

    setFlying(flying) {
        this.isFlying = flying;
        if (flying) {
            this.velocity.y = 0;
        }
    }

    update(controls, world) {
        const direction = new THREE.Vector3();
        const speed = controls.sprint ? this.speed * 1.5 : this.speed;

        // Movement
        if (controls.forward) direction.z -= 1;
        if (controls.backward) direction.z += 1;
        if (controls.left) direction.x -= 1;
        if (controls.right) direction.x += 1;

        direction.normalize();
        direction.multiplyScalar(speed * 0.016); // 60fps

        // Apply rotation to movement
        direction.applyEuler(new THREE.Euler(0, this.rotation.y, 0));

        // Flying mode
        if (this.isFlying) {
            if (controls.jump) direction.y += speed * 0.016;
            if (controls.forward && this.rotation.x < -0.1) direction.y -= Math.sin(-this.rotation.x) * speed * 0.016;
            if (controls.backward && this.rotation.x < -0.1) direction.y += Math.sin(-this.rotation.x) * speed * 0.016;
            
            this.position.add(direction);
            return;
        }

        // Ground-based movement
        this.velocity.x = direction.x;
        this.velocity.z = direction.z;

        // Jumping
        if (controls.jump && this.onGround) {
            this.velocity.y = this.jumpPower;
            this.onGround = false;
        }

        // Gravity
        this.velocity.y -= 32 * 0.016; // gravity

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(0.016));

        // Simple ground collision
        const groundY = world.getHeightAt(this.position.x, this.position.z) + 1.8;
        if (this.position.y <= groundY) {
            this.position.y = groundY;
            this.velocity.y = 0;
            this.onGround = true;
        }
    }
}

// World generation and management
class World {
    constructor() {
        this.chunks = new Map();
        this.chunkSize = 16;
        this.worldHeight = 128;
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    generateChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        if (this.chunks.has(key)) return;

        const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, this.worldHeight);
        chunk.generate();
        this.chunks.set(key, chunk);
    }

    getBlock(x, y, z) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
        
        if (!chunk) return null;
        
        const localX = x - chunkX * this.chunkSize;
        const localZ = z - chunkZ * this.chunkSize;
        
        return chunk.getBlock(localX, y, localZ);
    }

    setBlock(x, y, z, blockType) {
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const chunk = this.chunks.get(this.getChunkKey(chunkX, chunkZ));
        
        if (!chunk) return;
        
        const localX = x - chunkX * this.chunkSize;
        const localZ = z - chunkZ * this.chunkSize;
        
        chunk.setBlock(localX, y, localZ, blockType);
    }

    removeBlock(x, y, z) {
        this.setBlock(x, y, z, 'air');
    }

    generateMeshes(scene) {
        this.chunks.forEach(chunk => {
            chunk.generateMesh();
            if (chunk.mesh) {
                scene.add(chunk.mesh);
            }
        });
    }

    updateChunkMeshes(scene) {
        this.chunks.forEach(chunk => {
            if (chunk.mesh) {
                scene.remove(chunk.mesh);
            }
            chunk.generateMesh();
            if (chunk.mesh) {
                scene.add(chunk.mesh);
            }
        });
    }

    getHeightAt(x, z) {
        for (let y = this.worldHeight - 1; y >= 0; y--) {
            const block = this.getBlock(Math.floor(x), y, Math.floor(z));
            if (block && block !== 'air') {
                return y;
            }
        }
        return 0;
    }
}

// Chunk class for world generation
class Chunk {
    constructor(chunkX, chunkZ, size, height) {
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.size = size;
        this.height = height;
        this.blocks = new Array(size * height * size).fill('air');
        this.mesh = null;
    }

    getIndex(x, y, z) {
        return x + y * this.size + z * this.size * this.height;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return 'air';
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, blockType) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
            return;
        }
        this.blocks[this.getIndex(x, y, z)] = blockType;
    }

    generate() {
        const worldX = this.chunkX * this.size;
        const worldZ = this.chunkZ * this.size;

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const worldPosX = worldX + x;
                const worldPosZ = worldZ + z;
                
                // Simple terrain generation using noise
                const height = this.getTerrainHeight(worldPosX, worldPosZ);
                
                // Generate terrain layers
                for (let y = 0; y < height; y++) {
                    if (y === 0) {
                        this.setBlock(x, y, z, 'bedrock');
                    } else if (y < height - 4) {
                        this.setBlock(x, y, z, 'stone');
                    } else if (y < height - 1) {
                        this.setBlock(x, y, z, 'dirt');
                    } else {
                        this.setBlock(x, y, z, height < 45 ? 'sand' : 'grass');
                    }
                }

                // Add trees randomly
                if (height > 45 && Math.random() < 0.02) {
                    this.generateTree(x, height, z);
                }

                // Add water
                if (height < 45) {
                    for (let y = height; y < 45; y++) {
                        this.setBlock(x, y, z, 'water');
                    }
                }
            }
        }
    }

    getTerrainHeight(x, z) {
        // Simple noise function for terrain
        const noise1 = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 20;
        const noise2 = Math.sin(x * 0.02) * Math.sin(z * 0.02) * 10;
        const noise3 = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5;
        
        return Math.floor(50 + noise1 + noise2 + noise3);
    }

    generateTree(x, baseY, z) {
        const treeHeight = 5 + Math.floor(Math.random() * 3);
        
        // Trunk
        for (let y = 0; y < treeHeight; y++) {
            this.setBlock(x, baseY + y, z, 'wood');
        }
        
        // Leaves
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = -2; dy <= 1; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) < 4 && Math.random() > 0.3) {
                        const leafX = x + dx;
                        const leafY = baseY + treeHeight + dy;
                        const leafZ = z + dz;
                        
                        if (leafX >= 0 && leafX < this.size && leafZ >= 0 && leafZ < this.size && 
                            leafY >= 0 && leafY < this.height) {
                            this.setBlock(leafX, leafY, leafZ, 'leaves');
                        }
                    }
                }
            }
        }
    }

    generateMesh() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];
        const uvs = [];
        const colors = [];

        const blockColors = {
            grass: [0.2, 0.8, 0.2],
            dirt: [0.6, 0.4, 0.2],
            stone: [0.5, 0.5, 0.5],
            wood: [0.4, 0.2, 0.1],
            leaves: [0.1, 0.6, 0.1],
            sand: [0.9, 0.8, 0.4],
            water: [0.2, 0.4, 0.8],
            cobblestone: [0.4, 0.4, 0.4],
            bedrock: [0.1, 0.1, 0.1]
        };

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.size; z++) {
                    const block = this.getBlock(x, y, z);
                    if (block === 'air') continue;

                    const worldX = this.chunkX * this.size + x;
                    const worldZ = this.chunkZ * this.size + z;

                    // Check each face
                    const faces = [
                        { dir: [0, 1, 0], corners: [[0,1,1], [1,1,1], [1,1,0], [0,1,0]] }, // top
                        { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] }, // bottom
                        { dir: [1, 0, 0], corners: [[1,0,0], [1,1,0], [1,1,1], [1,0,1]] }, // right
                        { dir: [-1, 0, 0], corners: [[0,0,1], [0,1,1], [0,1,0], [0,0,0]] }, // left
                        { dir: [0, 0, 1], corners: [[1,0,1], [1,1,1], [0,1,1], [0,0,1]] }, // front
                        { dir: [0, 0, -1], corners: [[0,0,0], [0,1,0], [1,1,0], [1,0,0]] }  // back
                    ];

                    faces.forEach(face => {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = this.getBlock(x + dx, y + dy, z + dz);
                        
                        if (neighborBlock === 'air' || (block !== 'water' && neighborBlock === 'water')) {
                            // Add face vertices
                            const faceVertices = face.corners.map(corner => [
                                worldX + corner[0],
                                y + corner[1],
                                worldZ + corner[2]
                            ]);

                            // Create triangles (2 triangles per face)
                            vertices.push(...faceVertices[0], ...faceVertices[1], ...faceVertices[2]);
                            vertices.push(...faceVertices[0], ...faceVertices[2], ...faceVertices[3]);

                            // Add normals
                            for (let i = 0; i < 6; i++) {
                                normals.push(...face.dir);
                            }

                            // Add UVs
                            const faceUvs = [[0,1], [1,1], [1,0], [0,1], [1,0], [0,0]];
                            uvs.push(...faceUvs.flat());

                            // Add colors
                            const color = blockColors[block] || [1, 0, 1]; // Magenta for unknown blocks
                            for (let i = 0; i < 6; i++) {
                                colors.push(...color);
                            }
                        }
                    });
                }
            }
        }

        if (vertices.length === 0) {
            this.mesh = null;
            return;
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshLambertMaterial({ 
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new MinecraftClone();
});

// FPS counter
let fps = 0;
let lastTime = Date.now();
setInterval(() => {
    const now = Date.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;
    document.getElementById('fps').textContent = fps;
}, 100);