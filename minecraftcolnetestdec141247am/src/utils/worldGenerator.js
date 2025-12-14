import { BLOCK_TYPES, BLOCK_PROPERTIES, CHUNK_SIZE, CHUNK_HEIGHT, BIOME_TYPES, BIOME_PROPERTIES, WATER_LEVEL } from './constants';
import { NoiseGenerator, SeededRandom } from './noise';

export class WorldGenerator {
  constructor(seed) {
    this.seed = seed;
    this.noise = new NoiseGenerator(seed);
    this.random = new SeededRandom(seed);
  }

  // Generate a chunk at the given chunk coordinates
  generateChunk(chunkX, chunkZ) {
    const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
    const lightLevels = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);

    // Generate terrain for each column
    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      for (let localZ = 0; localZ < CHUNK_SIZE; localZ++) {
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldZ = chunkZ * CHUNK_SIZE + localZ;

        // Determine biome
        const biomeType = this.noise.getBiome(worldX, worldZ, BIOME_TYPES, BIOME_PROPERTIES);
        const biome = BIOME_PROPERTIES[biomeType];

        // Get terrain height
        const height = this.noise.getTerrainHeight(worldX, worldZ, biome);

        // Generate column
        this.generateColumn(blocks, localX, localZ, height, biome, biomeType, worldX, worldZ);
      }
    }

    // Generate structures (trees, etc.)
    this.generateStructures(blocks, chunkX, chunkZ);

    // Calculate initial light levels
    this.calculateLighting(blocks, lightLevels);

    return {
      blocks,
      lightLevels,
      chunkX,
      chunkZ,
      isDirty: false,
      mesh: null,
    };
  }

  // Generate a single column of blocks
  generateColumn(blocks, localX, localZ, height, biome, biomeType, worldX, worldZ) {
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      const index = this.getBlockIndex(localX, y, localZ);
      let blockType = BLOCK_TYPES.AIR;

      if (y === 0) {
        // Bedrock layer
        blockType = BLOCK_TYPES.BEDROCK;
      } else if (y < 5) {
        // Mixed bedrock and stone
        if (this.random.random() < 0.5) {
          blockType = BLOCK_TYPES.BEDROCK;
        } else {
          blockType = BLOCK_TYPES.STONE;
        }
      } else if (y < height - 4) {
        // Stone layer
        blockType = BLOCK_TYPES.STONE;

        // Cave generation
        if (this.noise.isCave(worldX, y, worldZ)) {
          blockType = BLOCK_TYPES.AIR;
        } else {
          // Ore generation
          blockType = this.generateOre(worldX, y, worldZ);
        }
      } else if (y < height - 1) {
        // Subsurface layer
        if (!this.noise.isCave(worldX, y, worldZ)) {
          blockType = biome.subsurfaceBlock;
        }
      } else if (y === height - 1) {
        // Surface layer
        if (height <= WATER_LEVEL) {
          // Underwater surface
          blockType = BLOCK_TYPES.SAND;
        } else if (height === WATER_LEVEL + 1) {
          // Beach level
          blockType = BLOCK_TYPES.SAND;
        } else {
          blockType = biome.surfaceBlock;
        }
      } else if (y < WATER_LEVEL) {
        // Water fill
        blockType = BLOCK_TYPES.WATER;
      }

      blocks[index] = blockType;
    }
  }

  // Generate ores at position
  generateOre(x, y, z) {
    // Coal ore (5-52)
    if (y >= 5 && y <= 52) {
      const coalValue = this.noise.getOreValue(x, y, z, 1);
      if (coalValue > 0.92) {
        return BLOCK_TYPES.COAL_ORE;
      }
    }

    // Iron ore (1-63)
    if (y >= 1 && y <= 63) {
      const ironValue = this.noise.getOreValue(x, y, z, 2);
      if (ironValue > 0.94) {
        return BLOCK_TYPES.IRON_ORE;
      }
    }

    // Gold ore (1-31)
    if (y >= 1 && y <= 31) {
      const goldValue = this.noise.getOreValue(x, y, z, 3);
      if (goldValue > 0.96) {
        return BLOCK_TYPES.GOLD_ORE;
      }
    }

    // Diamond ore (1-16)
    if (y >= 1 && y <= 16) {
      const diamondValue = this.noise.getOreValue(x, y, z, 4);
      if (diamondValue > 0.975) {
        return BLOCK_TYPES.DIAMOND_ORE;
      }
    }

    // Gravel patches
    const gravelValue = this.noise.getOreValue(x, y, z, 5);
    if (gravelValue > 0.93) {
      return BLOCK_TYPES.GRAVEL;
    }

    return BLOCK_TYPES.STONE;
  }

  // Generate structures like trees
  generateStructures(blocks, chunkX, chunkZ) {
    // Use consistent random for tree placement
    const structureRandom = new SeededRandom(this.seed + chunkX * 1000 + chunkZ);

    for (let localX = 2; localX < CHUNK_SIZE - 2; localX++) {
      for (let localZ = 2; localZ < CHUNK_SIZE - 2; localZ++) {
        const worldX = chunkX * CHUNK_SIZE + localX;
        const worldZ = chunkZ * CHUNK_SIZE + localZ;

        // Find surface height
        let surfaceY = 0;
        for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
          const block = blocks[this.getBlockIndex(localX, y, localZ)];
          if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
            surfaceY = y;
            break;
          }
        }

        // Check if we can place a tree
        const surfaceBlock = blocks[this.getBlockIndex(localX, surfaceY, localZ)];
        if (surfaceBlock !== BLOCK_TYPES.GRASS && surfaceBlock !== BLOCK_TYPES.DIRT) {
          continue;
        }

        // Skip if underwater
        if (surfaceY < WATER_LEVEL) continue;

        // Get biome for tree frequency
        const biomeType = this.noise.getBiome(worldX, worldZ, BIOME_TYPES, BIOME_PROPERTIES);
        const biome = BIOME_PROPERTIES[biomeType];

        // Check tree placement probability
        const treeNoise = this.noise.getTreeNoise(worldX, worldZ);
        if (treeNoise < 1 - biome.treeFrequency * 10) continue;

        // Additional random check
        if (structureRandom.random() > 0.3) continue;

        // Generate tree
        if (biomeType === BIOME_TYPES.DESERT) {
          this.generateCactus(blocks, localX, surfaceY + 1, localZ, structureRandom);
        } else {
          this.generateTree(blocks, localX, surfaceY + 1, localZ, structureRandom);
        }
      }
    }
  }

  // Generate a tree at position
  generateTree(blocks, x, y, z, random) {
    const trunkHeight = random.randomInt(4, 6);

    // Generate trunk
    for (let dy = 0; dy < trunkHeight; dy++) {
      if (y + dy < CHUNK_HEIGHT) {
        blocks[this.getBlockIndex(x, y + dy, z)] = BLOCK_TYPES.LOG;
      }
    }

    // Generate leaves
    const leafStart = y + trunkHeight - 2;
    const leafHeight = 3;

    for (let dy = 0; dy < leafHeight + 1; dy++) {
      const currentY = leafStart + dy;
      if (currentY >= CHUNK_HEIGHT) continue;

      const radius = dy < leafHeight ? 2 - Math.floor(dy / 2) : 0;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const nx = x + dx;
          const nz = z + dz;

          // Skip corners sometimes for natural look
          if (Math.abs(dx) === radius && Math.abs(dz) === radius && random.random() > 0.6) {
            continue;
          }

          // Check bounds
          if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) continue;

          const index = this.getBlockIndex(nx, currentY, nz);
          if (blocks[index] === BLOCK_TYPES.AIR) {
            blocks[index] = BLOCK_TYPES.LEAVES;
          }
        }
      }
    }

    // Top leaves
    if (y + trunkHeight < CHUNK_HEIGHT) {
      blocks[this.getBlockIndex(x, y + trunkHeight, z)] = BLOCK_TYPES.LEAVES;
    }
  }

  // Generate cactus
  generateCactus(blocks, x, y, z, random) {
    const height = random.randomInt(1, 3);

    for (let dy = 0; dy < height; dy++) {
      if (y + dy < CHUNK_HEIGHT) {
        blocks[this.getBlockIndex(x, y + dy, z)] = BLOCK_TYPES.CACTUS;
      }
    }
  }

  // Calculate lighting for the chunk
  calculateLighting(blocks, lightLevels) {
    // Simple sky light propagation from top
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        let sunlight = 15;

        for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
          const index = this.getBlockIndex(x, y, z);
          const block = blocks[index];
          const props = BLOCK_PROPERTIES[block];

          if (props && !props.transparent && props.solid) {
            sunlight = 0;
          } else if (block === BLOCK_TYPES.WATER) {
            sunlight = Math.max(0, sunlight - 3);
          } else if (block === BLOCK_TYPES.LEAVES) {
            sunlight = Math.max(0, sunlight - 1);
          }

          // Add light from light-emitting blocks
          let blockLight = 0;
          if (props && props.light) {
            blockLight = props.light;
          }

          lightLevels[index] = Math.max(sunlight, blockLight);
        }
      }
    }
  }

  // Convert local coordinates to array index
  getBlockIndex(x, y, z) {
    return y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x;
  }

  // Get block from chunk data
  getBlock(blocks, x, y, z) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return BLOCK_TYPES.AIR;
    }
    return blocks[this.getBlockIndex(x, y, z)];
  }

  // Set block in chunk data
  setBlock(blocks, x, y, z, blockType) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
      return false;
    }
    blocks[this.getBlockIndex(x, y, z)] = blockType;
    return true;
  }
}

export default WorldGenerator;
