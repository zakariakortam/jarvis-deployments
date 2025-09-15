/**
 * Advanced Noise Generation System
 * Handles terrain generation using multiple noise layers
 */
class NoiseGenerator {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.simplex = new SimplexNoise(seed);
        
        // Terrain generation parameters
        this.heightScale = 32;
        this.mountainScale = 64;
        this.caveScale = 16;
        this.oreScale = 8;
        
        // Frequency settings for different terrain features
        this.frequencies = {
            terrain: 0.01,
            mountains: 0.005,
            hills: 0.02,
            caves: 0.03,
            ores: 0.08
        };
    }

    /**
     * Generate height at given coordinates
     */
    getHeight(x, z) {
        const terrain = this.simplex.noise2D(x * this.frequencies.terrain, z * this.frequencies.terrain);
        const mountains = this.simplex.noise2D(x * this.frequencies.mountains, z * this.frequencies.mountains);
        const hills = this.simplex.noise2D(x * this.frequencies.hills, z * this.frequencies.hills);
        
        // Combine different noise layers
        let height = terrain * this.heightScale;
        height += mountains * this.mountainScale * Math.max(0, terrain + 0.3);
        height += hills * 8;
        
        return Math.floor(height + 64); // Base sea level at 64
    }

    /**
     * Determine if there should be a cave at given coordinates
     */
    isCave(x, y, z) {
        const cave1 = this.simplex.noise3D(x * this.frequencies.caves, y * this.frequencies.caves * 0.5, z * this.frequencies.caves);
        const cave2 = this.simplex.noise3D(x * this.frequencies.caves * 1.5, y * this.frequencies.caves * 0.3, z * this.frequencies.caves * 1.5);
        
        return (cave1 > 0.6 && cave2 > 0.4) || (cave1 > 0.7);
    }

    /**
     * Generate ore deposits
     */
    getOreType(x, y, z) {
        const oreNoise = this.simplex.noise3D(x * this.frequencies.ores, y * this.frequencies.ores, z * this.frequencies.ores);
        
        // Different ores at different depths
        if (y < 16) {
            if (oreNoise > 0.8) return 'diamond';
            if (oreNoise > 0.6) return 'gold';
        } else if (y < 32) {
            if (oreNoise > 0.7) return 'iron';
            if (oreNoise > 0.5) return 'coal';
        } else if (y < 64) {
            if (oreNoise > 0.6) return 'coal';
        }
        
        return null;
    }

    /**
     * Get biome at given coordinates
     */
    getBiome(x, z) {
        const temperature = this.simplex.noise2D(x * 0.003, z * 0.003);
        const humidity = this.simplex.noise2D(x * 0.004 + 1000, z * 0.004 + 1000);
        
        if (temperature > 0.6) {
            return humidity > 0.3 ? 'jungle' : 'desert';
        } else if (temperature > 0.2) {
            return humidity > 0.2 ? 'forest' : 'plains';
        } else {
            return humidity > 0.4 ? 'swamp' : 'tundra';
        }
    }

    /**
     * Generate tree positions
     */
    shouldGenerateTree(x, z, biome) {
        const treeNoise = this.simplex.noise2D(x * 0.05, z * 0.05);
        
        const thresholds = {
            forest: 0.4,
            jungle: 0.2,
            plains: 0.7,
            swamp: 0.6,
            desert: 0.95,
            tundra: 0.8
        };
        
        return treeNoise > (thresholds[biome] || 0.8);
    }
}