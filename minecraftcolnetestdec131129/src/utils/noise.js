import { createNoise2D, createNoise3D } from 'simplex-noise';
import alea from './alea.js';

// Custom Alea PRNG for seeded random numbers
export class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.prng = alea(seed.toString());
  }

  random() {
    return this.prng();
  }

  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return this.random() * (max - min) + min;
  }
}

// Noise generator class for terrain generation
export class NoiseGenerator {
  constructor(seed = Date.now()) {
    this.seed = seed;
    const prng = alea(seed.toString());

    // Create multiple noise functions for different purposes
    this.noise2D = createNoise2D(prng);
    this.noise3D = createNoise3D(prng);

    // Create additional noise instances for variety
    const prng2 = alea((seed + 1).toString());
    const prng3 = alea((seed + 2).toString());
    this.detailNoise2D = createNoise2D(prng2);
    this.caveNoise3D = createNoise3D(prng3);
  }

  // Basic 2D noise with optional octaves for fractal brownian motion
  fbm2D(x, z, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  // 3D noise for caves and ore generation
  fbm3D(x, y, z, octaves = 3, persistence = 0.5, lacunarity = 2.0) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  // Generate terrain height at a given position
  getTerrainHeight(x, z, biome) {
    const scale = 0.01;
    const detailScale = 0.05;

    // Base continent noise
    const continentNoise = this.fbm2D(x * scale * 0.5, z * scale * 0.5, 2, 0.5, 2.0);

    // Main terrain noise
    const terrainNoise = this.fbm2D(x * scale, z * scale, 4, 0.5, 2.0);

    // Detail noise for smaller variations
    const detailNoise = this.detailNoise2D(x * detailScale, z * detailScale) * 0.3;

    // Combine noises based on biome
    const baseHeight = biome.baseHeight;
    const variation = biome.heightVariation;

    let height = baseHeight + (terrainNoise * variation) + detailNoise;

    // Apply continent shaping
    height += continentNoise * 10;

    return Math.floor(height);
  }

  // Determine biome at a position
  getBiome(x, z, biomeTypes, biomeProperties) {
    const tempScale = 0.003;
    const humidScale = 0.004;

    // Temperature noise
    const temperature = (this.fbm2D(x * tempScale, z * tempScale, 2, 0.5, 2.0) + 1) / 2;

    // Humidity noise
    const humidity = (this.fbm2D(x * humidScale + 1000, z * humidScale + 1000, 2, 0.5, 2.0) + 1) / 2;

    // Determine biome based on temperature and humidity
    if (temperature < 0.2) {
      return biomeTypes.SNOW;
    } else if (temperature > 0.8) {
      if (humidity < 0.3) {
        return biomeTypes.DESERT;
      } else if (humidity > 0.7) {
        return biomeTypes.SWAMP;
      }
    }

    if (humidity > 0.6) {
      return biomeTypes.FOREST;
    } else if (humidity < 0.3) {
      return biomeTypes.PLAINS;
    }

    // Check for mountains
    const mountainNoise = this.fbm2D(x * 0.005, z * 0.005, 2, 0.5, 2.0);
    if (mountainNoise > 0.4) {
      return biomeTypes.MOUNTAINS;
    }

    return biomeTypes.PLAINS;
  }

  // Cave generation
  getCaveValue(x, y, z) {
    const scale = 0.05;
    const caveNoise = this.caveNoise3D(x * scale, y * scale * 0.5, z * scale);

    // Additional noise for cave variety
    const detailNoise = this.noise3D(x * scale * 2, y * scale, z * scale * 2) * 0.3;

    return caveNoise + detailNoise;
  }

  // Check if position should be a cave
  isCave(x, y, z) {
    // No caves near surface or bedrock
    if (y > 55 || y < 5) return false;

    const caveValue = this.getCaveValue(x, y, z);

    // Cave threshold - larger value = fewer caves
    const threshold = 0.5;

    // Caves are more common deeper underground
    const depthFactor = 1 - (y / 64) * 0.3;

    return caveValue > threshold * depthFactor;
  }

  // Ore generation probability
  getOreValue(x, y, z, oreType) {
    const scale = 0.1;
    const oreNoise = this.noise3D(x * scale + oreType * 100, y * scale, z * scale + oreType * 100);
    return (oreNoise + 1) / 2;
  }

  // Tree placement noise
  getTreeNoise(x, z) {
    const scale = 0.5;
    return (this.detailNoise2D(x * scale, z * scale) + 1) / 2;
  }
}

export default NoiseGenerator;
