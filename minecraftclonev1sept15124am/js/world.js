/**
 * World Generation and Management System
 * Handles terrain generation, chunk loading, and world state
 */
class World {
    constructor(blockSystem) {
        this.blockSystem = blockSystem;
        this.noiseGenerator = new NoiseGenerator(Math.random());
        
        // World parameters
        this.chunkSize = 16;
        this.worldHeight = 128;
        this.seaLevel = 64;
        this.renderDistance = 4; // chunks
        
        // Data structures
        this.chunks = new Map();
        this.blocks = new Map(); // position string -> blockId
        this.meshes = new Map(); // position string -> mesh
        this.loadedChunks = new Set();
        
        // Three.js objects
        this.scene = null;
        this.blockCount = 0;
        
        // Performance optimization
        this.geometryCache = new Map();
        this.updateQueue = [];
        this.maxUpdatesPerFrame = 5;
    }

    init(scene) {
        this.scene = scene;
        this.setupGeometryCache();
    }

    setupGeometryCache() {
        // Pre-create geometries for better performance
        this.geometryCache.set('block', new THREE.BoxGeometry(1, 1, 1));
    }

    /**
     * Convert world position to chunk coordinates
     */
    worldToChunk(x, z) {
        return {
            x: Math.floor(x / this.chunkSize),
            z: Math.floor(z / this.chunkSize)
        };
    }

    /**
     * Convert chunk coordinates to world position
     */
    chunkToWorld(chunkX, chunkZ) {
        return {
            x: chunkX * this.chunkSize,
            z: chunkZ * this.chunkSize
        };
    }

    /**
     * Get block at position
     */
    getBlock(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.blocks.get(key) || 'air';
    }

    /**
     * Set block at position
     */
    setBlock(x, y, z, blockId) {
        const key = `${x},${y},${z}`;
        const oldBlockId = this.blocks.get(key);
        
        if (oldBlockId === blockId) return false;
        
        if (blockId === 'air') {
            this.blocks.delete(key);
        } else {
            this.blocks.set(key, blockId);
        }
        
        this.updateBlockMesh(x, y, z, blockId);
        this.updateAdjacentBlocks(x, y, z);
        
        return true;
    }

    /**
     * Update block mesh
     */
    updateBlockMesh(x, y, z, blockId) {
        const key = `${x},${y},${z}`;
        const existingMesh = this.meshes.get(key);
        
        // Remove existing mesh
        if (existingMesh) {
            this.scene.remove(existingMesh);
            existingMesh.geometry.dispose();
            this.meshes.delete(key);
            this.blockCount--;
        }
        
        // Add new mesh if not air
        if (blockId !== 'air') {
            const mesh = this.blockSystem.createBlockMesh(
                blockId,
                new THREE.Vector3(x, y, z)
            );
            
            if (mesh) {
                this.scene.add(mesh);
                this.meshes.set(key, mesh);
                this.blockCount++;
            }
        }
    }

    /**
     * Update adjacent blocks for transparency/culling
     */
    updateAdjacentBlocks(x, y, z) {
        const directions = [
            [1, 0, 0], [-1, 0, 0],
            [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1]
        ];
        
        for (const [dx, dy, dz] of directions) {
            const adjX = x + dx;
            const adjY = y + dy;
            const adjZ = z + dz;
            
            if (adjY >= 0 && adjY < this.worldHeight) {
                this.updateQueue.push([adjX, adjY, adjZ]);
            }
        }
    }

    /**
     * Generate chunk data
     */
    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.loadedChunks.has(chunkKey)) return;
        
        const startX = chunkX * this.chunkSize;
        const startZ = chunkZ * this.chunkSize;
        
        // Generate terrain
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;
                
                // Get biome and height
                const biome = this.noiseGenerator.getBiome(worldX, worldZ);
                const height = this.noiseGenerator.getHeight(worldX, worldZ);
                
                // Generate vertical column
                this.generateColumn(worldX, worldZ, height, biome);
            }
        }
        
        // Generate structures (trees, etc.)
        this.generateStructures(chunkX, chunkZ);
        
        this.loadedChunks.add(chunkKey);
    }

    /**
     * Generate a vertical column of blocks
     */
    generateColumn(x, z, height, biome) {
        for (let y = 0; y < this.worldHeight; y++) {
            let blockId = 'air';
            
            if (y === 0) {
                blockId = 'bedrock';
            } else if (y < height - 5) {
                // Check for caves
                if (!this.noiseGenerator.isCave(x, y, z)) {
                    blockId = 'stone';
                    
                    // Add ores
                    const oreType = this.noiseGenerator.getOreType(x, y, z);
                    if (oreType) {
                        blockId = oreType;
                    }
                }
            } else if (y < height - 1) {
                blockId = this.getSoilBlock(biome);
            } else if (y < height) {
                blockId = this.getSurfaceBlock(biome);
            } else if (y < this.seaLevel) {
                blockId = 'water';
            }
            
            if (blockId !== 'air') {
                this.setBlock(x, y, z, blockId);
            }
        }
    }

    /**
     * Get surface block based on biome
     */
    getSurfaceBlock(biome) {
        const surfaces = {
            forest: 'grass',
            plains: 'grass',
            jungle: 'grass',
            desert: 'sand',
            swamp: 'grass',
            tundra: 'snow'
        };
        return surfaces[biome] || 'grass';
    }

    /**
     * Get soil block based on biome
     */
    getSoilBlock(biome) {
        const soils = {
            forest: 'dirt',
            plains: 'dirt',
            jungle: 'dirt',
            desert: 'sand',
            swamp: 'dirt',
            tundra: 'dirt'
        };
        return soils[biome] || 'dirt';
    }

    /**
     * Generate structures in chunk
     */
    generateStructures(chunkX, chunkZ) {
        const startX = chunkX * this.chunkSize;
        const startZ = chunkZ * this.chunkSize;
        
        for (let x = 0; x < this.chunkSize; x += 4) {
            for (let z = 0; z < this.chunkSize; z += 4) {
                const worldX = startX + x;
                const worldZ = startZ + z;
                
                const biome = this.noiseGenerator.getBiome(worldX, worldZ);
                
                if (this.noiseGenerator.shouldGenerateTree(worldX, worldZ, biome)) {
                    this.generateTree(worldX, worldZ, biome);
                }
            }
        }
    }

    /**
     * Generate a tree at position
     */
    generateTree(x, z, biome) {
        const height = this.noiseGenerator.getHeight(x, z);
        
        // Find ground level
        let groundY = height;
        while (groundY > 0 && this.getBlock(x, groundY, z) === 'air') {
            groundY--;
        }
        
        if (this.getBlock(x, groundY, z) !== 'grass') return;
        
        // Tree parameters based on biome
        const treeParams = {
            forest: { height: 6, leafRadius: 2 },
            jungle: { height: 8, leafRadius: 3 },
            plains: { height: 5, leafRadius: 2 },
            swamp: { height: 4, leafRadius: 2 }
        };
        
        const params = treeParams[biome] || treeParams.forest;
        
        // Generate trunk
        for (let y = 1; y <= params.height; y++) {
            this.setBlock(x, groundY + y, z, 'wood');
        }
        
        // Generate leaves
        const leafY = groundY + params.height;
        const radius = params.leafRadius;
        
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                for (let dy = -1; dy <= 2; dy++) {
                    const distance = Math.sqrt(dx * dx + dz * dz + dy * dy);
                    
                    if (distance <= radius && Math.random() > 0.3) {
                        const leafX = x + dx;
                        const leafZ = z + dz;
                        const leafPos = leafY + dy;
                        
                        if (this.getBlock(leafX, leafPos, leafZ) === 'air') {
                            this.setBlock(leafX, leafPos, leafZ, 'leaves');
                        }
                    }
                }
            }
        }
    }

    /**
     * Update world around player
     */
    updateAroundPlayer(playerPosition) {
        const playerChunk = this.worldToChunk(playerPosition.x, playerPosition.z);
        
        // Load chunks in render distance
        for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
            for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
                const chunkX = playerChunk.x + dx;
                const chunkZ = playerChunk.z + dz;
                
                this.generateChunk(chunkX, chunkZ);
            }
        }
        
        // Process update queue
        let updates = 0;
        while (this.updateQueue.length > 0 && updates < this.maxUpdatesPerFrame) {
            const [x, y, z] = this.updateQueue.shift();
            const blockId = this.getBlock(x, y, z);
            this.updateBlockMesh(x, y, z, blockId);
            updates++;
        }
    }

    /**
     * Raycast for block selection
     */
    raycast(origin, direction, maxDistance = 10) {
        const step = 0.1;
        const steps = maxDistance / step;
        
        for (let i = 0; i < steps; i++) {
            const point = origin.clone().add(direction.clone().multiplyScalar(i * step));
            const x = Math.floor(point.x);
            const y = Math.floor(point.y);
            const z = Math.floor(point.z);
            
            const blockId = this.getBlock(x, y, z);
            if (blockId !== 'air' && this.blockSystem.isSolid(blockId)) {
                return {
                    hit: true,
                    position: new THREE.Vector3(x, y, z),
                    blockId: blockId,
                    distance: i * step
                };
            }
        }
        
        return { hit: false };
    }

    /**
     * Get adjacent empty position for block placement
     */
    getPlacementPosition(hitPosition, origin, direction) {
        const offsets = [
            [0, 1, 0], [0, -1, 0],
            [1, 0, 0], [-1, 0, 0],
            [0, 0, 1], [0, 0, -1]
        ];
        
        let bestPos = null;
        let minDistance = Infinity;
        
        for (const [dx, dy, dz] of offsets) {
            const pos = new THREE.Vector3(
                hitPosition.x + dx,
                hitPosition.y + dy,
                hitPosition.z + dz
            );
            
            if (this.getBlock(pos.x, pos.y, pos.z) === 'air') {
                const distance = pos.distanceTo(origin);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestPos = pos;
                }
            }
        }
        
        return bestPos;
    }

    /**
     * Clean up distant chunks for performance
     */
    cleanup(playerPosition) {
        const playerChunk = this.worldToChunk(playerPosition.x, playerPosition.z);
        const unloadDistance = this.renderDistance + 2;
        
        const chunksToRemove = [];
        
        for (const chunkKey of this.loadedChunks) {
            const [chunkX, chunkZ] = chunkKey.split(',').map(Number);
            const distance = Math.max(
                Math.abs(chunkX - playerChunk.x),
                Math.abs(chunkZ - playerChunk.z)
            );
            
            if (distance > unloadDistance) {
                chunksToRemove.push(chunkKey);
                
                // Remove meshes in this chunk
                const startX = chunkX * this.chunkSize;
                const startZ = chunkZ * this.chunkSize;
                
                for (let x = 0; x < this.chunkSize; x++) {
                    for (let z = 0; z < this.chunkSize; z++) {
                        for (let y = 0; y < this.worldHeight; y++) {
                            const worldX = startX + x;
                            const worldZ = startZ + z;
                            const key = `${worldX},${y},${worldZ}`;
                            
                            const mesh = this.meshes.get(key);
                            if (mesh) {
                                this.scene.remove(mesh);
                                mesh.geometry.dispose();
                                this.meshes.delete(key);
                                this.blockCount--;
                            }
                        }
                    }
                }
            }
        }
        
        chunksToRemove.forEach(key => this.loadedChunks.delete(key));
    }

    getBlockCount() {
        return this.blockCount;
    }
}