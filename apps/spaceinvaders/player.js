class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 24;
        this.speed = 300; // pixels per second
        this.active = true;
        this.lives = 3;
        
        // Movement state
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = 0;
        this.maxVelocity = 400;
        this.acceleration = 1200;
        this.friction = 800;
        
        // Shooting
        this.canShoot = true;
        this.shootCooldown = 0.15; // seconds
        this.timeSinceShot = 0;
        
        // Visual effects
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.flickerTimer = 0;
        this.engineParticleTimer = 0;
        
        // Animation
        this.animationTimer = 0;
        this.thrusterIntensity = 0;
        
        // Bounds
        this.minX = this.width / 2;
        this.maxX = 800 - this.width / 2;
    }

    handleInput(keys) {
        this.moveLeft = keys['ArrowLeft'] || keys['KeyA'];
        this.moveRight = keys['ArrowRight'] || keys['KeyD'];
    }

    update(deltaTime, bulletManager, particleSystem) {
        // Update timers
        this.timeSinceShot += deltaTime;
        this.animationTimer += deltaTime;
        this.engineParticleTimer += deltaTime;
        
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            this.flickerTimer += deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }

        // Handle movement with acceleration/deceleration
        if (this.moveLeft && !this.moveRight) {
            this.velocity -= this.acceleration * deltaTime;
            this.thrusterIntensity = Math.min(1, this.thrusterIntensity + deltaTime * 3);
        } else if (this.moveRight && !this.moveLeft) {
            this.velocity += this.acceleration * deltaTime;
            this.thrusterIntensity = Math.min(1, this.thrusterIntensity + deltaTime * 3);
        } else {
            // Apply friction
            if (this.velocity > 0) {
                this.velocity -= this.friction * deltaTime;
                if (this.velocity < 0) this.velocity = 0;
            } else if (this.velocity < 0) {
                this.velocity += this.friction * deltaTime;
                if (this.velocity > 0) this.velocity = 0;
            }
            this.thrusterIntensity = Math.max(0, this.thrusterIntensity - deltaTime * 2);
        }

        // Clamp velocity
        this.velocity = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity));

        // Update position
        this.x += this.velocity * deltaTime;

        // Keep player within bounds
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));

        // Create engine particles
        if (this.engineParticleTimer > 0.02) { // 50 FPS particle generation
            this.createEngineParticles(particleSystem);
            this.engineParticleTimer = 0;
        }
    }

    createEngineParticles(particleSystem) {
        if (this.thrusterIntensity > 0.1) {
            // Main engine
            particleSystem.createEngineTrail(
                this.x,
                this.y + this.height / 2 + 2
            );
            
            // Side thrusters when turning
            if (this.moveLeft) {
                particleSystem.createEngineTrail(
                    this.x + this.width / 3,
                    this.y + this.height / 2
                );
            }
            if (this.moveRight) {
                particleSystem.createEngineTrail(
                    this.x - this.width / 3,
                    this.y + this.height / 2
                );
            }
        }
    }

    shoot(bulletManager) {
        if (this.canShoot && this.timeSinceShot >= this.shootCooldown) {
            bulletManager.createBullet(this.x, this.y - this.height / 2, 0, -500, 'player');
            this.timeSinceShot = 0;
            assetManager.playSound('playerShoot');
        }
    }

    takeDamage(particleSystem) {
        if (!this.invulnerable) {
            this.lives--;
            this.invulnerable = true;
            this.invulnerabilityTime = 2.0; // 2 seconds of invulnerability
            
            // Create damage effect
            particleSystem.createExplosion(this.x, this.y, '#ff6600', 10);
            
            assetManager.playSound('playerHit');
            
            return this.lives <= 0; // Return true if player is dead
        }
        return false;
    }

    render(ctx) {
        if (!this.active) return;

        // Skip rendering during flicker effect
        if (this.invulnerable && Math.floor(this.flickerTimer * 10) % 2 === 0) {
            return;
        }

        ctx.save();
        
        // Add slight ship wobble based on movement
        const wobble = Math.sin(this.animationTimer * 8) * this.thrusterIntensity * 0.5;
        ctx.translate(this.x, this.y + wobble);

        // Ship glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';

        // Main ship body
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-16, -12, 32, 24);
        
        // Ship details
        ctx.fillStyle = '#00cc66';
        // Wings
        ctx.fillRect(-14, -8, 4, 8);
        ctx.fillRect(10, -8, 4, 8);
        ctx.fillRect(-16, -4, 8, 8);
        ctx.fillRect(8, -4, 8, 8);
        
        // Engine glow (intensity based on thruster)
        const engineGlow = 0.3 + this.thrusterIntensity * 0.7;
        ctx.globalAlpha = engineGlow;
        ctx.fillStyle = '#0088ff';
        ctx.fillRect(-11, 10, 2, 4);
        ctx.fillRect(9, 10, 2, 4);
        ctx.fillRect(-2, 12, 4, 2);
        
        // Cockpit
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#88ffff';
        ctx.fillRect(-2, -12, 4, 4);
        
        // Add energy field when invulnerable
        if (this.invulnerable) {
            ctx.globalAlpha = 0.3 + Math.sin(this.flickerTimer * 15) * 0.2;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.active = true;
        this.thrusterIntensity = 0;
    }
}