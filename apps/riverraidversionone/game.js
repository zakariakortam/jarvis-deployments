/**
 * River Raid - Complete Game Implementation
 * A JavaScript recreation of the classic Atari 2600 game
 */

class RiverRaid {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Ensure canvas dimensions are set
        if (!this.canvas.width || !this.canvas.height) {
            console.log('Setting default canvas dimensions');
            this.canvas.width = 800;
            this.canvas.height = 600;
        }
        
        console.log(`Canvas initialized: ${this.canvas.width}x${this.canvas.height}`);
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver', 'paused'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Game world
        this.camera = { y: 0 };
        this.scrollSpeed = 2;
        
        // River generation
        this.riverWidth = 300;
        this.riverCenter = this.canvas.width / 2;
        this.riverSegments = [];
        this.bridgeSegments = [];
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.fuelDepots = [];
        this.explosions = [];
        this.powerUps = [];
        
        // Input handling
        this.keys = {};
        this.setupControls();
        
        // Initialize game
        this.init();
    }
    
    init() {
        console.log('Initializing River Raid game...');
        
        // Initialize player
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        
        // Generate initial river
        this.generateRiver();
        
        // Start game loop
        this.lastTime = 0;
        this.gameLoop();
        
        console.log('Game initialization complete');
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Game state controls
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'start' || this.gameState === 'gameOver') {
                    this.startGame();
                } else if (this.gameState === 'playing') {
                    this.player.shoot();
                }
            }
            
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.pauseGame();
            }
            
            if (e.code === 'Escape') {
                this.gameState = 'start';
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    startGame() {
        console.log('Starting new game');
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.camera.y = 0;
        
        // Reset player
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        
        // Clear game objects
        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        this.powerUps = [];
        
        // Regenerate river
        this.riverSegments = [];
        this.bridgeSegments = [];
        this.fuelDepots = [];
        this.generateRiver();
    }
    
    pauseGame() {
        this.gameState = this.gameState === 'paused' ? 'playing' : 'paused';
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        try {
            if (this.gameState === 'playing') {
                this.update(deltaTime);
            }
            this.render();
        } catch (error) {
            console.error('Error in game loop:', error);
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Handle input
        this.handleInput();
        
        // Update camera
        this.camera.y += this.scrollSpeed;
        
        // Update player
        this.player.update(deltaTime, this.canvas);
        
        // Check river boundaries
        this.checkRiverCollision();
        
        // Update game objects
        this.updateProjectiles(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateExplosions(deltaTime);
        this.updateFuelDepots(deltaTime);
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Generate more river
        this.generateRiver();
        
        // Check collisions
        this.checkCollisions();
        
        // Update fuel
        this.updateFuel();
        
        // Clean up off-screen objects
        this.cleanup();
        
        // Check game over conditions
        this.checkGameOver();
    }
    
    handleInput() {
        const speed = 5;
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x -= speed;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x += speed;
        }
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.player.y -= speed;
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.player.y += speed;
        }
        
        // Keep player in bounds
        this.player.x = Math.max(20, Math.min(this.canvas.width - 20, this.player.x));
        this.player.y = Math.max(50, Math.min(this.canvas.height - 50, this.player.y));
    }
    
    generateRiver() {
        const segmentHeight = 50;
        const targetSegments = Math.floor(this.canvas.height / segmentHeight) + 10;
        
        while (this.riverSegments.length < targetSegments) {
            const y = -this.riverSegments.length * segmentHeight;
            
            // Generate river curve
            let centerOffset = 0;
            if (this.riverSegments.length > 0) {
                const lastSegment = this.riverSegments[this.riverSegments.length - 1];
                centerOffset = (Math.random() - 0.5) * 30;
            }
            
            const newCenter = Math.max(150, Math.min(this.canvas.width - 150, 
                this.riverCenter + centerOffset));
            
            this.riverSegments.push({
                y: y,
                center: newCenter,
                width: this.riverWidth + (Math.random() - 0.5) * 100
            });
            
            this.riverCenter = newCenter;
            
            // Generate bridges occasionally
            if (Math.random() < 0.1 && this.riverSegments.length > 20) {
                this.bridgeSegments.push({
                    y: y,
                    center: newCenter,
                    width: this.riverWidth + 50,
                    destroyed: false
                });
            }
            
            // Generate fuel depots
            if (Math.random() < 0.05) {
                this.fuelDepots.push(new FuelDepot(newCenter, y - 30));
            }
        }
    }
    
    spawnEnemies() {
        if (Math.random() < 0.02) {
            const riverSegment = this.riverSegments.find(seg => 
                seg.y > this.camera.y - this.canvas.height && 
                seg.y < this.camera.y + 100
            );
            
            if (riverSegment) {
                const enemyTypes = ['helicopter', 'jet', 'ship', 'tanker'];
                const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                
                let x = riverSegment.center + (Math.random() - 0.5) * (riverSegment.width - 60);
                let y = riverSegment.y - 50;
                
                this.enemies.push(new Enemy(x, y, type));
            }
        }
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles.forEach((projectile, index) => {
            projectile.update(deltaTime);
            
            // Remove off-screen projectiles
            if (projectile.y < this.camera.y - this.canvas.height || 
                projectile.y > this.camera.y + this.canvas.height) {
                this.projectiles.splice(index, 1);
            }
        });
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            enemy.update(deltaTime, this.camera.y);
            
            // Enemy shooting
            if (Math.random() < 0.01 && enemy.type !== 'ship' && enemy.type !== 'tanker') {
                this.projectiles.push(new Projectile(enemy.x, enemy.y + 20, false));
            }
            
            // Remove off-screen enemies
            if (enemy.y > this.camera.y + this.canvas.height + 100) {
                this.enemies.splice(index, 1);
            }
        });
    }
    
    updateExplosions(deltaTime) {
        this.explosions.forEach((explosion, index) => {
            explosion.update(deltaTime);
            if (explosion.finished) {
                this.explosions.splice(index, 1);
            }
        });
    }
    
    updateFuelDepots(deltaTime) {
        this.fuelDepots.forEach((depot, index) => {
            depot.update(deltaTime);
            if (depot.y > this.camera.y + this.canvas.height + 100) {
                this.fuelDepots.splice(index, 1);
            }
        });
    }
    
    checkCollisions() {
        // Player projectiles vs enemies
        this.projectiles.forEach((projectile, pIndex) => {
            if (projectile.isPlayerProjectile) {
                this.enemies.forEach((enemy, eIndex) => {
                    if (this.isColliding(projectile, enemy)) {
                        this.explosions.push(new Explosion(enemy.x, enemy.y));
                        this.addScore(enemy.getPoints());
                        this.enemies.splice(eIndex, 1);
                        this.projectiles.splice(pIndex, 1);
                    }
                });
                
                // Projectiles vs bridges
                this.bridgeSegments.forEach((bridge) => {
                    if (!bridge.destroyed && 
                        projectile.y < bridge.y + 20 && 
                        projectile.y > bridge.y - 20 &&
                        Math.abs(projectile.x - bridge.center) < bridge.width / 2) {
                        bridge.destroyed = true;
                        this.explosions.push(new Explosion(projectile.x, projectile.y));
                        this.addScore(500);
                        this.projectiles.splice(pIndex, 1);
                    }
                });
            }
        });
        
        // Enemy projectiles vs player
        this.projectiles.forEach((projectile, index) => {
            if (!projectile.isPlayerProjectile && this.isColliding(projectile, this.player)) {
                this.playerHit();
                this.projectiles.splice(index, 1);
            }
        });
        
        // Player vs enemies
        this.enemies.forEach((enemy, index) => {
            if (this.isColliding(this.player, enemy)) {
                this.playerHit();
                this.explosions.push(new Explosion(enemy.x, enemy.y));
                this.enemies.splice(index, 1);
            }
        });
        
        // Player vs fuel depots
        this.fuelDepots.forEach((depot, index) => {
            if (this.isColliding(this.player, depot) && !depot.collected) {
                depot.collected = true;
                this.player.fuel = Math.min(100, this.player.fuel + 30);
                this.addScore(100);
            }
        });
        
        // Player vs bridges
        this.bridgeSegments.forEach((bridge) => {
            if (!bridge.destroyed && 
                Math.abs(this.player.y - bridge.y) < 20 &&
                Math.abs(this.player.x - bridge.center) < bridge.width / 2) {
                this.playerHit();
            }
        });
    }
    
    isColliding(obj1, obj2) {
        const distance = Math.sqrt(
            Math.pow(obj1.x - obj2.x, 2) + 
            Math.pow(obj1.y - obj2.y, 2)
        );
        return distance < (obj1.radius || 15) + (obj2.radius || 15);
    }
    
    checkRiverCollision() {
        const currentSegment = this.riverSegments.find(seg => 
            Math.abs(seg.y - this.player.y) < 25
        );
        
        if (currentSegment) {
            const riverLeft = currentSegment.center - currentSegment.width / 2;
            const riverRight = currentSegment.center + currentSegment.width / 2;
            
            if (this.player.x < riverLeft + 20 || this.player.x > riverRight - 20) {
                this.playerHit();
            }
        }
    }
    
    playerHit() {
        this.explosions.push(new Explosion(this.player.x, this.player.y));
        this.lives--;
        
        if (this.lives > 0) {
            // Respawn player
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height - 100;
        }
    }
    
    updateFuel() {
        this.player.fuel -= 0.05;
        if (this.player.fuel <= 0) {
            this.playerHit();
        }
    }
    
    addScore(points) {
        this.score += points;
        if (this.score > this.level * 10000) {
            this.level++;
            this.scrollSpeed += 0.5;
        }
    }
    
    cleanup() {
        // Remove off-screen objects
        const screenBounds = {
            top: this.camera.y - this.canvas.height,
            bottom: this.camera.y + this.canvas.height * 2
        };
        
        this.riverSegments = this.riverSegments.filter(seg => 
            seg.y > screenBounds.top && seg.y < screenBounds.bottom
        );
        
        this.bridgeSegments = this.bridgeSegments.filter(bridge =>
            bridge.y > screenBounds.top && bridge.y < screenBounds.bottom
        );
    }
    
    checkGameOver() {
        if (this.lives <= 0) {
            this.gameState = 'gameOver';
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.renderGame();
            this.renderUI();
            
            if (this.gameState === 'paused') {
                this.renderPauseScreen();
            }
        } else if (this.gameState === 'start') {
            this.renderStartScreen();
        } else if (this.gameState === 'gameOver') {
            this.renderGameOverScreen();
        }
    }
    
    renderGame() {
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        
        // Render river
        this.renderRiver();
        
        // Render bridges
        this.renderBridges();
        
        // Render fuel depots
        this.fuelDepots.forEach(depot => depot.render(this.ctx));
        
        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Render explosions
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        
        this.ctx.restore();
        
        // Render player (always in screen space)
        this.player.render(this.ctx);
        
        // Render projectiles
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        this.projectiles.forEach(projectile => projectile.render(this.ctx));
        this.ctx.restore();
    }
    
    renderRiver() {
        this.ctx.fillStyle = '#4169E1';
        
        this.riverSegments.forEach((segment, index) => {
            const nextSegment = this.riverSegments[index + 1];
            
            if (nextSegment) {
                // Draw river segment as a trapezoid
                this.ctx.beginPath();
                this.ctx.moveTo(segment.center - segment.width / 2, segment.y);
                this.ctx.lineTo(segment.center + segment.width / 2, segment.y);
                this.ctx.lineTo(nextSegment.center + nextSegment.width / 2, nextSegment.y);
                this.ctx.lineTo(nextSegment.center - nextSegment.width / 2, nextSegment.y);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
        
        // Draw river banks
        this.ctx.fillStyle = '#228B22';
        this.riverSegments.forEach((segment, index) => {
            const nextSegment = this.riverSegments[index + 1];
            
            if (nextSegment) {
                // Left bank
                this.ctx.fillRect(0, segment.y, segment.center - segment.width / 2, 
                    nextSegment.y - segment.y);
                
                // Right bank
                this.ctx.fillRect(segment.center + segment.width / 2, segment.y, 
                    this.canvas.width - (segment.center + segment.width / 2), 
                    nextSegment.y - segment.y);
            }
        });
    }
    
    renderBridges() {
        this.ctx.fillStyle = '#8B4513';
        
        this.bridgeSegments.forEach(bridge => {
            if (!bridge.destroyed) {
                this.ctx.fillRect(
                    bridge.center - bridge.width / 2, 
                    bridge.y - 10, 
                    bridge.width, 
                    20
                );
                
                // Bridge supports
                this.ctx.fillStyle = '#654321';
                for (let i = 0; i < 5; i++) {
                    const x = bridge.center - bridge.width / 2 + (bridge.width / 4) * i;
                    this.ctx.fillRect(x - 2, bridge.y - 10, 4, 20);
                }
                this.ctx.fillStyle = '#8B4513';
            }
        });
    }
    
    renderUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 60);
        this.ctx.fillText(`Level: ${this.level}`, 10, 90);
        
        // Fuel bar
        const fuelBarWidth = 200;
        const fuelBarHeight = 20;
        const fuelBarX = this.canvas.width - fuelBarWidth - 20;
        const fuelBarY = 20;
        
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(fuelBarX, fuelBarY, fuelBarWidth, fuelBarHeight);
        
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(fuelBarX, fuelBarY, 
            (this.player.fuel / 100) * fuelBarWidth, fuelBarHeight);
        
        this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(fuelBarX, fuelBarY, fuelBarWidth, fuelBarHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('FUEL', fuelBarX, fuelBarY - 5);
    }
    
    renderStartScreen() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('RIVER RAID', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press SPACE to start', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Arrow keys to move, SPACE to shoot', this.canvas.width / 2, this.canvas.height / 2 + 100);
        
        this.ctx.textAlign = 'left';
    }
    
    renderGameOverScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.textAlign = 'left';
    }
    
    renderPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        this.ctx.textAlign = 'left';
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.fuel = 100;
        this.lastShot = 0;
        this.shotCooldown = 200; // milliseconds
    }
    
    update(deltaTime, canvas) {
        // Keep player in bounds
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }
    
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShot > this.shotCooldown) {
            game.projectiles.push(new Projectile(this.x, this.y - 20, true));
            this.lastShot = currentTime;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // Draw player airplane
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 15);
        ctx.lineTo(this.x - 10, this.y + 10);
        ctx.lineTo(this.x - 5, this.y + 5);
        ctx.lineTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + 10, this.y + 10);
        ctx.closePath();
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(this.x - 15, this.y - 5, 30, 5);
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.speed = Math.random() * 2 + 1;
        this.direction = Math.random() < 0.5 ? -1 : 1;
    }
    
    update(deltaTime, cameraY) {
        switch (this.type) {
            case 'helicopter':
                this.x += this.direction * this.speed;
                this.y += 1;
                break;
            case 'jet':
                this.y += 3;
                break;
            case 'ship':
                this.x += this.direction * this.speed * 0.5;
                this.y += 0.5;
                break;
            case 'tanker':
                this.y += 1;
                break;
        }
    }
    
    getPoints() {
        switch (this.type) {
            case 'helicopter': return 100;
            case 'jet': return 200;
            case 'ship': return 150;
            case 'tanker': return 300;
            default: return 100;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        switch (this.type) {
            case 'helicopter':
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(this.x - 12, this.y - 8, 24, 16);
                // Rotor
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x - 20, this.y - 10);
                ctx.lineTo(this.x + 20, this.y - 10);
                ctx.stroke();
                break;
                
            case 'jet':
                ctx.fillStyle = '#DC143C';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 12);
                ctx.lineTo(this.x - 8, this.y + 8);
                ctx.lineTo(this.x + 8, this.y + 8);
                ctx.closePath();
                ctx.fill();
                // Wings
                ctx.fillRect(this.x - 15, this.y, 30, 4);
                break;
                
            case 'ship':
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(this.x - 15, this.y - 5, 30, 10);
                // Mast
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - 5);
                ctx.lineTo(this.x, this.y - 20);
                ctx.stroke();
                break;
                
            case 'tanker':
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x - 20, this.y - 8, 40, 16);
                // Tank
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(this.x - 15, this.y - 12, 30, 8);
                break;
        }
        
        ctx.restore();
    }
}

class Projectile {
    constructor(x, y, isPlayerProjectile) {
        this.x = x;
        this.y = y;
        this.isPlayerProjectile = isPlayerProjectile;
        this.speed = isPlayerProjectile ? -8 : 4;
        this.radius = 3;
    }
    
    update(deltaTime) {
        this.y += this.speed;
    }
    
    render(ctx) {
        ctx.fillStyle = this.isPlayerProjectile ? '#FFFF00' : '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];
        this.duration = 500; // milliseconds
        this.startTime = Date.now();
        this.finished = false;
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    update(deltaTime) {
        const elapsed = Date.now() - this.startTime;
        
        if (elapsed > this.duration) {
            this.finished = true;
            return;
        }
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                particle.life = 0;
            }
        });
    }
    
    render(ctx) {
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = '#FF4500';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }
}

class FuelDepot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.collected = false;
    }
    
    update(deltaTime) {
        this.y += 2; // Move with river
    }
    
    render(ctx) {
        if (!this.collected) {
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw 'F' for fuel
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('F', this.x, this.y + 5);
            ctx.textAlign = 'left';
        }
    }
}

// Initialize game when page loads
let game;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    try {
        game = new RiverRaid();
        console.log('River Raid game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
});