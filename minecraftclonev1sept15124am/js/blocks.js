/**
 * Block System with Materials and Textures
 * Handles all block types, their properties, and rendering
 */
class BlockSystem {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
        this.materials = new Map();
        this.blockTypes = new Map();
        this.setupBlocks();
    }

    setupBlocks() {
        // Define all block types with their properties
        const blocks = {
            air: {
                name: 'Air',
                solid: false,
                transparent: true,
                hardness: 0,
                color: 0x000000,
                opacity: 0
            },
            grass: {
                name: 'Grass Block',
                solid: true,
                transparent: false,
                hardness: 0.6,
                color: 0x7CB342,
                topColor: 0x8BC34A,
                sideColor: 0x795548,
                sound: 'grass'
            },
            dirt: {
                name: 'Dirt',
                solid: true,
                transparent: false,
                hardness: 0.5,
                color: 0x8D6E63,
                sound: 'dirt'
            },
            stone: {
                name: 'Stone',
                solid: true,
                transparent: false,
                hardness: 1.5,
                color: 0x757575,
                sound: 'stone'
            },
            wood: {
                name: 'Wood',
                solid: true,
                transparent: false,
                hardness: 2.0,
                color: 0x8D6E63,
                topColor: 0x6D4C41,
                sideColor: 0x8D6E63,
                sound: 'wood'
            },
            leaves: {
                name: 'Leaves',
                solid: true,
                transparent: true,
                hardness: 0.2,
                color: 0x4CAF50,
                opacity: 0.8,
                sound: 'grass'
            },
            sand: {
                name: 'Sand',
                solid: true,
                transparent: false,
                hardness: 0.5,
                color: 0xFFF176,
                sound: 'sand',
                gravity: true
            },
            water: {
                name: 'Water',
                solid: false,
                transparent: true,
                hardness: 0,
                color: 0x2196F3,
                opacity: 0.6,
                liquid: true,
                sound: 'water'
            },
            lava: {
                name: 'Lava',
                solid: false,
                transparent: true,
                hardness: 0,
                color: 0xFF5722,
                opacity: 0.8,
                liquid: true,
                light: 15,
                damage: 4,
                sound: 'lava'
            },
            coal: {
                name: 'Coal Ore',
                solid: true,
                transparent: false,
                hardness: 3.0,
                color: 0x37474F,
                specks: 0x212121,
                sound: 'stone'
            },
            iron: {
                name: 'Iron Ore',
                solid: true,
                transparent: false,
                hardness: 3.0,
                color: 0xD7CCC8,
                specks: 0xBF360C,
                sound: 'stone'
            },
            gold: {
                name: 'Gold Ore',
                solid: true,
                transparent: false,
                hardness: 3.0,
                color: 0xFFF59D,
                specks: 0xFF8F00,
                sound: 'stone'
            },
            diamond: {
                name: 'Diamond Ore',
                solid: true,
                transparent: false,
                hardness: 5.0,
                color: 0xE1F5FE,
                specks: 0x00BCD4,
                sound: 'stone'
            },
            bedrock: {
                name: 'Bedrock',
                solid: true,
                transparent: false,
                hardness: -1, // Unbreakable
                color: 0x212121,
                sound: 'stone'
            },
            ice: {
                name: 'Ice',
                solid: true,
                transparent: true,
                hardness: 0.5,
                color: 0xE3F2FD,
                opacity: 0.7,
                slippery: true,
                sound: 'glass'
            },
            snow: {
                name: 'Snow',
                solid: true,
                transparent: false,
                hardness: 0.1,
                color: 0xFFFFFF,
                sound: 'snow'
            }
        };

        // Store block definitions
        for (const [id, block] of Object.entries(blocks)) {
            this.blockTypes.set(id, { id, ...block });
        }

        // Create materials for each block type
        this.createMaterials();
    }

    createMaterials() {
        for (const [id, block] of this.blockTypes) {
            if (id === 'air') continue;

            let material;

            if (block.transparent || block.liquid) {
                material = new THREE.MeshLambertMaterial({
                    color: block.color,
                    transparent: true,
                    opacity: block.opacity || 0.8,
                    side: THREE.DoubleSide
                });
            } else {
                material = new THREE.MeshLambertMaterial({
                    color: block.color
                });
            }

            // Add emissive lighting for light-emitting blocks
            if (block.light) {
                material.emissive = new THREE.Color(block.color);
                material.emissiveIntensity = 0.3;
            }

            this.materials.set(id, material);

            // Create special materials for blocks with different face textures
            if (block.topColor && block.sideColor) {
                const materials = [
                    new THREE.MeshLambertMaterial({ color: block.sideColor }), // +X
                    new THREE.MeshLambertMaterial({ color: block.sideColor }), // -X
                    new THREE.MeshLambertMaterial({ color: block.topColor }),  // +Y
                    new THREE.MeshLambertMaterial({ color: block.sideColor }), // -Y
                    new THREE.MeshLambertMaterial({ color: block.sideColor }), // +Z
                    new THREE.MeshLambertMaterial({ color: block.sideColor })  // -Z
                ];
                this.materials.set(id, materials);
            }

            // Add ore speckles
            if (block.specks) {
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 64;
                const ctx = canvas.getContext('2d');
                
                // Base color
                ctx.fillStyle = `#${block.color.toString(16).padStart(6, '0')}`;
                ctx.fillRect(0, 0, 64, 64);
                
                // Add random specks
                ctx.fillStyle = `#${block.specks.toString(16).padStart(6, '0')}`;
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 64;
                    const y = Math.random() * 64;
                    const size = Math.random() * 3 + 1;
                    ctx.fillRect(x, y, size, size);
                }
                
                const texture = new THREE.CanvasTexture(canvas);
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                
                material.map = texture;
                material.needsUpdate = true;
            }
        }
    }

    getBlockType(id) {
        return this.blockTypes.get(id);
    }

    getMaterial(blockId) {
        return this.materials.get(blockId);
    }

    isTransparent(blockId) {
        const block = this.blockTypes.get(blockId);
        return block ? block.transparent : false;
    }

    isSolid(blockId) {
        const block = this.blockTypes.get(blockId);
        return block ? block.solid : false;
    }

    getHardness(blockId) {
        const block = this.blockTypes.get(blockId);
        return block ? block.hardness : 1;
    }

    getLightLevel(blockId) {
        const block = this.blockTypes.get(blockId);
        return block ? (block.light || 0) : 0;
    }

    getBreakingTime(blockId, tool = 'hand') {
        const hardness = this.getHardness(blockId);
        if (hardness < 0) return Infinity; // Unbreakable
        
        const toolMultipliers = {
            hand: 1,
            pickaxe: 0.3,
            axe: 0.2,
            shovel: 0.1
        };
        
        return hardness * (toolMultipliers[tool] || 1) * 1000; // milliseconds
    }

    /**
     * Create a block mesh
     */
    createBlockMesh(blockId, position) {
        if (blockId === 'air') return null;
        
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = this.getMaterial(blockId);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.userData = { blockId, position: position.clone() };
        
        // Add custom properties
        const block = this.getBlockType(blockId);
        if (block) {
            mesh.userData.blockType = block;
        }
        
        return mesh;
    }

    /**
     * Get block drop items
     */
    getDrops(blockId, tool = 'hand') {
        const drops = {
            grass: [{ id: 'dirt', count: 1 }],
            stone: [{ id: 'stone', count: 1 }],
            wood: [{ id: 'wood', count: 1 }],
            leaves: Math.random() > 0.9 ? [{ id: 'wood', count: 1 }] : [],
            coal: [{ id: 'coal', count: 1 }],
            iron: tool === 'pickaxe' ? [{ id: 'iron', count: 1 }] : [],
            gold: tool === 'pickaxe' ? [{ id: 'gold', count: 1 }] : [],
            diamond: tool === 'pickaxe' ? [{ id: 'diamond', count: 1 }] : []
        };
        
        return drops[blockId] || [{ id: blockId, count: 1 }];
    }
}