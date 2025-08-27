class Invader {
    constructor(x, y, type = 0, points = 10) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.type = type; // 0, 1, 2 for different invader types
        this.width = 24;
        this.height = 16;
        this.active = true;
        this.points = points;
        
        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.animationSpeed = 0.5; // seconds per frame
        
        // Movement (handled by formation)
        this.moveDirection = 1; // 1 for right, -1 for left
        
        // Shooting
        this.shootTimer = Math.random() * 5; // Random initial delay
        this.shootCooldown = 3 + Math.random() * 4; // 3-7 seconds between shots
        
        // Visual effects
        this.hitEffect = false;
        this.hitEffectTimer = 0;
        this.glowIntensity = 0.5 + Math.random() * 0.5;
    }

    update(deltaTime, bulletManager, player) {
        // Update animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.animationTimer = 0;
        }

        // Update shooting timer
        this.shootTimer -= deltaTime;
        
        // Randomly shoot at player
        if (this.shootTimer <= 0 && this.active) {
            const distanceToPlayer = Math.abs(this.x - player.x);
            const shootChance = Math.max(0.1, 1 - (distanceToPlayer / 200)); // Higher chance if closer to player
            
            if (Math.random() < shootChance * 0.3) { // 30% base chance modified by distance
                this.shoot(bulletManager, player);
                this.shootTimer = this.shootCooldown;
            } else {
                this.shootTimer = 1; // Try again in 1 second
            }
        }

        // Update hit effect
        if (this.hitEffect) {
            this.hitEffectTimer -= deltaTime;
            if (this.hitEffectTimer <= 0) {
                this.hitEffect = false;
            }
        }
    }

    shoot(bulletManager, player) {
        // Simple AI: shoot towards player with some inaccuracy
        const dx = player.x - this.x;
        const targetX = player.x + (player.velocity * 0.3); // Lead the target slightly
        const aimX = this.x + (targetX - this.x) * 0.7; // Add some inaccuracy
        
        const bulletVx = (aimX - this.x) * 2; // Horizontal velocity towards player
        const bulletVy = 200; // Downward velocity
        
        bulletManager.createBullet(
            this.x, 
            this.y + this.height / 2, 
            bulletVx, 
            bulletVy, 
            'enemy', 
            1
        );
        
        assetManager.playSound('invaderShoot');
    }

    takeDamage(particleSystem) {
        if (this.active) {
            this.active = false;
            
            // Create explosion effect
            const colors = ['#ff4444', '#ffaa00', '#aa44ff'];
            particleSystem.createExplosion(this.x, this.y, colors[this.type], 12);
            
            assetManager.playSound('invaderDestroy');
            return this.points;
        }
        return 0;
    }

    showHitEffect() {
        this.hitEffect = true;
        this.hitEffectTimer = 0.1;
    }

    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow effect
        ctx.shadowBlur = 6;
        
        // Different colors for different types
        const colors = ['#ff4444', '#ffaa00', '#aa44ff'];
        const glowColors = ['#ff6666', '#ffcc44', '#cc66ff'];
        
        ctx.shadowColor = glowColors[this.type];
        
        // Hit effect - flash white
        if (this.hitEffect) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = colors[this.type];
        }

        // Render invader based on type and animation frame
        this.renderInvaderType(ctx, this.type, this.animationFrame);
        
        ctx.restore();
    }

    renderInvaderType(ctx, type, frame) {
        const offset = frame * 2; // Animation offset
        
        switch (type) {
            case 0: // Octopus-like invader
                this.renderOctopus(ctx, offset);
                break;
            case 1: // Crab-like invader
                this.renderCrab(ctx, offset);
                break;
            case 2: // Squid-like invader
                this.renderSquid(ctx, offset);
                break;
        }
    }

    renderOctopus(ctx, offset) {
        // Main body
        ctx.fillRect(-6 + offset, -6, 12, 2);
        ctx.fillRect(-10 + offset, -4, 20, 2);
        ctx.fillRect(-12 + offset, -2, 24, 2);
        
        // Tentacles (animated)
        ctx.fillRect(-10 + offset, 0, 2, 2);
        ctx.fillRect(-6 + offset, 0, 2, 2);
        ctx.fillRect(4 - offset, 0, 2, 2);
        ctx.fillRect(8 - offset, 0, 2, 2);
        
        ctx.fillRect(-8 + offset, 2, 2, 2);
        ctx.fillRect(-4 + offset, 2, 8, 2);
        ctx.fillRect(6 - offset, 2, 2, 2);
        
        ctx.fillRect(-12 + offset, 4, 4, 2);
        ctx.fillRect(8 - offset, 4, 4, 2);
    }

    renderCrab(ctx, offset) {
        // Claws
        ctx.fillRect(-10 + offset, -8, 2, 2);
        ctx.fillRect(8 - offset, -8, 2, 2);
        ctx.fillRect(-8 + offset, -6, 2, 2);
        ctx.fillRect(6 - offset, -6, 2, 2);
        
        // Body
        ctx.fillRect(-8 + offset, -4, 16, 2);
        ctx.fillRect(-10 + offset, -2, 20, 2);
        ctx.fillRect(-12 + offset, 0, 24, 2);
        
        // Legs (animated)
        ctx.fillRect(-12 + offset, 2, 4, 2);
        ctx.fillRect(-4 + offset, 2, 8, 2);
        ctx.fillRect(8 - offset, 2, 4, 2);
        
        ctx.fillRect(-8 + offset, 4, 2, 2);
        ctx.fillRect(6 - offset, 4, 2, 2);
        ctx.fillRect(-10 + offset, 6, 2, 2);
        ctx.fillRect(8 - offset, 6, 2, 2);
    }

    renderSquid(ctx, offset) {
        // Head
        ctx.fillRect(-4 + offset, -8, 8, 2);
        ctx.fillRect(-6 + offset, -6, 12, 2);
        ctx.fillRect(-8 + offset, -4, 16, 2);
        ctx.fillRect(-10 + offset, -2, 20, 2);
        ctx.fillRect(-12 + offset, 0, 24, 2);
        
        // Tentacles (animated)
        ctx.fillRect(-8 + offset, 2, 2, 2);
        ctx.fillRect(-2 + offset, 2, 4, 2);
        ctx.fillRect(6 - offset, 2, 2, 2);
        
        ctx.fillRect(-10 + offset, 4, 2, 2);
        ctx.fillRect(-4 + offset, 4, 2, 2);
        ctx.fillRect(2 - offset, 4, 2, 2);
        ctx.fillRect(8 - offset, 4, 2, 2);
    }

    getBounds() {
        return {
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2
        };
    }
}

class InvaderFormation {
    constructor() {
        this.invaders = [];
        this.moveSpeed = 50; // pixels per second
        this.dropDistance = 20;
        this.direction = 1; // 1 for right, -1 for left
        this.edgeReached = false;
        this.formationY = 0;
        this.moveTimer = 0;
        this.moveInterval = 0.5; // Move every 0.5 seconds initially
        this.speedIncrement = 1.05; // Speed up by 5% when invaders are destroyed
    }

    createFormation(startX = 100, startY = 100) {
        this.invaders = [];
        const rows = 5;
        const cols = 11;
        const spacingX = 48;
        const spacingY = 40;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                
                let type, points;
                if (row === 0) {
                    type = 2; // Top row - squids (30 points)
                    points = 30;
                } else if (row <= 2) {
                    type = 1; // Middle rows - crabs (20 points)
                    points = 20;
                } else {
                    type = 0; // Bottom rows - octopi (10 points)
                    points = 10;
                }
                
                this.invaders.push(new Invader(x, y, type, points));
            }
        }
        
        this.formationY = startY;
    }

    update(deltaTime, bulletManager, player, particleSystem) {
        // Update individual invaders
        this.invaders.forEach(invader => {
            if (invader.active) {
                invader.update(deltaTime, bulletManager, player);
            }
        });

        // Update formation movement
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveFormation();
            this.moveTimer = 0;
        }

        // Speed up as invaders are destroyed
        const activeCount = this.getActiveCount();
        this.moveInterval = Math.max(0.1, 0.5 - (55 - activeCount) * 0.01);
    }

    moveFormation() {
        const activeInvaders = this.invaders.filter(inv => inv.active);
        if (activeInvaders.length === 0) return;

        // Check if we need to drop down
        if (this.edgeReached) {
            // Move all invaders down
            activeInvaders.forEach(invader => {
                invader.y += this.dropDistance;
            });
            this.formationY += this.dropDistance;
            this.direction *= -1; // Change direction
            this.edgeReached = false;
        } else {
            // Move horizontally
            const moveDistance = this.moveSpeed * this.direction * this.moveInterval;
            
            activeInvaders.forEach(invader => {
                invader.x += moveDistance;
            });

            // Check if any invader reached the edge
            const leftmost = Math.min(...activeInvaders.map(inv => inv.x));
            const rightmost = Math.max(...activeInvaders.map(inv => inv.x));

            if (rightmost >= 760 || leftmost <= 40) {
                this.edgeReached = true;
            }
        }
    }

    render(ctx) {
        this.invaders.forEach(invader => invader.render(ctx));
    }

    getActiveCount() {
        return this.invaders.filter(inv => inv.active).length;
    }

    getActiveInvaders() {
        return this.invaders.filter(inv => inv.active);
    }

    checkCollisions(bullets, particleSystem) {
        let score = 0;
        
        bullets.forEach(bullet => {
            if (!bullet.active) return;
            
            this.invaders.forEach(invader => {
                if (invader.active && bullet.checkCollision(invader)) {
                    bullet.active = false;
                    score += invader.takeDamage(particleSystem);
                    
                    // Create hit effect
                    particleSystem.createHitEffect(invader.x, invader.y, '#ffffff');
                }
            });
        });
        
        return score;
    }

    getLowestRow() {
        const activeInvaders = this.invaders.filter(inv => inv.active);
        if (activeInvaders.length === 0) return 0;
        return Math.max(...activeInvaders.map(inv => inv.y));
    }

    clear() {
        this.invaders = [];
    }
}