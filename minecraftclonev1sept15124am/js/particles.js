/**
 * Advanced Particle Effects System
 * Handles visual effects for block breaking, water, lava, and environmental effects
 */
class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.particleGeometry = new THREE.BufferGeometry();
        this.particleCount = 0;
        this.maxParticles = 1000;
        
        // Particle pools for different effects
        this.pools = {
            blockBreak: [],
            water: [],
            lava: [],
            smoke: [],
            sparkle: [],
            dust: []
        };
        
        this.init();
    }

    init() {
        // Create particle geometry
        this.setupParticleGeometry();
        this.createMaterials();
    }

    setupParticleGeometry() {
        const positions = new Float32Array(this.maxParticles * 3);
        const colors = new Float32Array(this.maxParticles * 3);
        const sizes = new Float32Array(this.maxParticles);
        const velocities = new Float32Array(this.maxParticles * 3);
        const lifetimes = new Float32Array(this.maxParticles);

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        this.particleGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    }

    createMaterials() {
        // Create different materials for different particle types
        this.materials = {
            blockBreak: new THREE.PointsMaterial({
                size: 0.1,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                alphaTest: 0.1
            }),
            water: new THREE.PointsMaterial({
                color: 0x4FC3F7,
                size: 0.05,
                transparent: true,
                opacity: 0.7
            }),
            lava: new THREE.PointsMaterial({
                color: 0xFF5722,
                size: 0.08,
                transparent: true,
                opacity: 0.9
            }),
            smoke: new THREE.PointsMaterial({
                color: 0x666666,
                size: 0.2,
                transparent: true,
                opacity: 0.3
            }),
            sparkle: new THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 0.03,
                transparent: true,
                opacity: 1.0
            }),
            dust: new THREE.PointsMaterial({
                color: 0x8D6E63,
                size: 0.04,
                transparent: true,
                opacity: 0.5
            })
        };
    }

    /**
     * Create block breaking particle effect
     */
    createBlockBreakEffect(position, blockType, blockSystem) {
        const blockInfo = blockSystem.getBlockType(blockType);
        const color = new THREE.Color(blockInfo.color);
        
        // Create 15-20 particles
        const particleCount = 15 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'blockBreak',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5),
                    position.y + (Math.random() - 0.5),
                    position.z + (Math.random() - 0.5)
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * 0.15 + 0.05,
                    (Math.random() - 0.5) * 0.2
                ),
                color: color.clone(),
                size: 0.05 + Math.random() * 0.05,
                lifetime: 1.0 + Math.random() * 0.5,
                maxLifetime: 1.0 + Math.random() * 0.5,
                gravity: -0.01,
                bounce: 0.3
            };
            
            // Add slight color variation
            particle.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3);
            
            this.particles.push(particle);
        }
    }

    /**
     * Create water particle effects
     */
    createWaterEffect(position, intensity = 1) {
        const particleCount = Math.floor(10 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'water',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5),
                    position.y + Math.random() * 0.5,
                    position.z + (Math.random() - 0.5)
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                color: new THREE.Color(0x2196F3),
                size: 0.03 + Math.random() * 0.02,
                lifetime: 2.0 + Math.random(),
                maxLifetime: 2.0 + Math.random(),
                gravity: -0.008,
                bounce: 0.1
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Create lava particle effects
     */
    createLavaEffect(position, intensity = 1) {
        const particleCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'lava',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 0.8,
                    position.y + Math.random() * 0.3,
                    position.z + (Math.random() - 0.5) * 0.8
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    Math.random() * 0.2 + 0.1,
                    (Math.random() - 0.5) * 0.05
                ),
                color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.3),
                size: 0.06 + Math.random() * 0.04,
                lifetime: 3.0 + Math.random() * 2,
                maxLifetime: 3.0 + Math.random() * 2,
                gravity: -0.005,
                bounce: 0.2,
                glow: true
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Create smoke particle effects
     */
    createSmokeEffect(position, intensity = 1) {
        const particleCount = Math.floor(5 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'smoke',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 0.5,
                    position.y,
                    position.z + (Math.random() - 0.5) * 0.5
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    0.05 + Math.random() * 0.03,
                    (Math.random() - 0.5) * 0.02
                ),
                color: new THREE.Color(0.4, 0.4, 0.4),
                size: 0.1 + Math.random() * 0.1,
                lifetime: 4.0 + Math.random() * 3,
                maxLifetime: 4.0 + Math.random() * 3,
                gravity: 0,
                expansion: 0.02
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Create sparkle effects for special blocks
     */
    createSparkleEffect(position, color = 0xFFFFFF) {
        const particleCount = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'sparkle',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 1.2,
                    position.y + (Math.random() - 0.5) * 1.2,
                    position.z + (Math.random() - 0.5) * 1.2
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.08,
                    (Math.random() - 0.5) * 0.08,
                    (Math.random() - 0.5) * 0.08
                ),
                color: new THREE.Color(color),
                size: 0.02 + Math.random() * 0.02,
                lifetime: 1.5 + Math.random(),
                maxLifetime: 1.5 + Math.random(),
                gravity: 0,
                twinkle: true
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Create dust clouds
     */
    createDustCloud(position, color = 0x8D6E63) {
        const particleCount = 12 + Math.floor(Math.random() * 8);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'dust',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 0.8,
                    position.y + Math.random() * 0.5,
                    position.z + (Math.random() - 0.5) * 0.8
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    Math.random() * 0.05,
                    (Math.random() - 0.5) * 0.1
                ),
                color: new THREE.Color(color),
                size: 0.03 + Math.random() * 0.03,
                lifetime: 2.0 + Math.random() * 1.5,
                maxLifetime: 2.0 + Math.random() * 1.5,
                gravity: -0.003,
                drift: true
            };
            
            // Add some color variation
            particle.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
            
            this.particles.push(particle);
        }
    }

    /**
     * Update all particles
     */
    update(deltaTime) {
        const dt = deltaTime * 0.016; // Convert to consistent time step
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update lifetime
            particle.lifetime -= dt;
            
            if (particle.lifetime <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Update position
            particle.position.add(particle.velocity.clone().multiplyScalar(dt));
            
            // Apply gravity
            if (particle.gravity) {
                particle.velocity.y += particle.gravity * dt;
            }
            
            // Apply special effects based on particle type
            this.updateParticleSpecialEffects(particle, dt);
            
            // Ground collision
            if (particle.position.y < 0 && particle.velocity.y < 0) {
                if (particle.bounce) {
                    particle.velocity.y *= -particle.bounce;
                    particle.velocity.x *= 0.8;
                    particle.velocity.z *= 0.8;
                    particle.position.y = 0;
                } else {
                    particle.lifetime = 0; // Remove particle
                }
            }
        }
        
        // Clean up excess particles
        if (this.particles.length > this.maxParticles) {
            this.particles.splice(0, this.particles.length - this.maxParticles);
        }
    }

    updateParticleSpecialEffects(particle, dt) {
        const ageRatio = 1 - (particle.lifetime / particle.maxLifetime);
        
        switch (particle.type) {
            case 'smoke':
                // Expand and fade smoke
                if (particle.expansion) {
                    particle.size += particle.expansion * dt;
                }
                particle.color.setRGB(
                    0.4 * (1 - ageRatio * 0.5),
                    0.4 * (1 - ageRatio * 0.5),
                    0.4 * (1 - ageRatio * 0.5)
                );
                break;
                
            case 'sparkle':
                // Twinkling effect
                if (particle.twinkle) {
                    const twinkle = Math.sin(particle.lifetime * 20) * 0.5 + 0.5;
                    particle.size = (0.02 + Math.random() * 0.02) * (0.5 + twinkle * 0.5);
                }
                break;
                
            case 'dust':
                // Slow drift and fade
                if (particle.drift) {
                    particle.velocity.x += (Math.random() - 0.5) * 0.001;
                    particle.velocity.z += (Math.random() - 0.5) * 0.001;
                }
                break;
                
            case 'lava':
                // Color transition for lava particles
                const hue = 0.05 + (1 - ageRatio) * 0.1;
                particle.color.setHSL(hue, 1, 0.5 + (1 - ageRatio) * 0.3);
                break;
        }
    }

    /**
     * Render particles to the scene
     */
    render() {
        // Clear existing particle meshes
        const existingParticles = this.scene.children.filter(child => child.userData.isParticle);
        existingParticles.forEach(particle => this.scene.remove(particle));
        
        if (this.particles.length === 0) return;
        
        // Group particles by type for efficient rendering
        const particlesByType = {};
        
        this.particles.forEach(particle => {
            if (!particlesByType[particle.type]) {
                particlesByType[particle.type] = [];
            }
            particlesByType[particle.type].push(particle);
        });
        
        // Render each particle type
        Object.entries(particlesByType).forEach(([type, particles]) => {
            this.renderParticleType(type, particles);
        });
    }

    renderParticleType(type, particles) {
        const positions = [];
        const colors = [];
        const sizes = [];
        
        particles.forEach(particle => {
            positions.push(particle.position.x, particle.position.y, particle.position.z);
            colors.push(particle.color.r, particle.color.g, particle.color.b);
            sizes.push(particle.size);
        });
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        const material = this.materials[type].clone();
        material.vertexColors = true;
        
        const particleSystem = new THREE.Points(geometry, material);
        particleSystem.userData.isParticle = true;
        
        this.scene.add(particleSystem);
    }

    /**
     * Create environmental effects based on biome
     */
    createEnvironmentalEffects(position, biome) {
        switch (biome) {
            case 'desert':
                // Create dust particles
                if (Math.random() > 0.98) {
                    this.createDustCloud(position, 0xFFF176);
                }
                break;
                
            case 'swamp':
                // Create occasional bubble effects
                if (Math.random() > 0.99) {
                    this.createWaterEffect(position, 0.3);
                }
                break;
                
            case 'tundra':
                // Create snow particles
                if (Math.random() > 0.95) {
                    this.createSnowEffect(position);
                }
                break;
        }
    }

    createSnowEffect(position) {
        const particleCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                type: 'dust',
                position: new THREE.Vector3(
                    position.x + (Math.random() - 0.5) * 10,
                    position.y + 5 + Math.random() * 5,
                    position.z + (Math.random() - 0.5) * 10
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    -0.02 - Math.random() * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                color: new THREE.Color(1, 1, 1),
                size: 0.02 + Math.random() * 0.01,
                lifetime: 10 + Math.random() * 5,
                maxLifetime: 10 + Math.random() * 5,
                gravity: 0,
                drift: true
            };
            
            this.particles.push(particle);
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        
        // Remove particle meshes from scene
        const existingParticles = this.scene.children.filter(child => child.userData.isParticle);
        existingParticles.forEach(particle => {
            this.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
    }

    /**
     * Get particle count for debugging
     */
    getParticleCount() {
        return this.particles.length;
    }
}