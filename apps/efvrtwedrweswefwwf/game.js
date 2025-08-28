class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
        
        // Game state
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameSpeed = 1.0;
        
        // Input handling
        this.keys = {};
        this.setupInput();
        
        // Game objects
        this.player = new Player(400, 550);
        this.invaderFormation = new InvaderFormation();
        this.bulletManager = new BulletManager();
        this.particleSystem = new ParticleSystem();
        
        // Game timing
        this.lastTime = 0;
        this.gameTime = 0;
        this.levelStartTime = 0;
        
        // UI elements
        this.setupUI();
        
        // Performance monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        // Background
        this.stars = this.createStarField();
        this.starSpeed = 20;
        
        // Load assets and start
        this.init();
    }

    async init() {
        await assetManager.loadAssets();
        this.startGameLoop();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle special keys
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.player.shoot(this.bulletManager);
                }
            }
            
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.gameState = 'paused';
                this.showScreen('pauseScreen');
            } else if (e.code === 'KeyP' && this.gameState === 'paused') {
                this.gameState = 'playing';
                this.hideAllScreens();
            }
            
            if (e.code === 'Enter' && this.gameState === 'menu') {
                this.startGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupUI() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    createStarField() {
        const stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                speed: 10 + Math.random() * 40,
                size: 1 + Math.random() * 2,
                brightness: 0.3 + Math.random() * 0.7
            });
        }
        return stars;
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 0;
        
        // Initialize audio context (requires user interaction)
        assetManager.createAudioContext();
        
        // Reset game objects
        this.player = new Player(400, 550);
        this.invaderFormation.createFormation();
        this.bulletManager.clear();
        this.particleSystem.clear();
        
        this.hideAllScreens();
        this.updateHUD();
    }

    restartGame() {
        this.startGame();
    }

    nextLevel() {
        this.level++;
        this.levelStartTime = this.gameTime;
        this.invaderFormation.createFormation(100, 80 + Math.min(this.level * 10, 50));
        this.bulletManager.clear();
        
        // Increase game speed slightly
        this.gameSpeed = Math.min(2.0, 1 + (this.level - 1) * 0.1);
        
        // Bonus points for completing level
        this.score += this.level * 100;
        this.updateHUD();
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        this.showScreen('gameOverScreen');
        
        // Create massive explosion effect
        this.particleSystem.createExplosion(this.player.x, this.player.y, '#ff6600', 30);
    }

    showScreen(screenId) {
        this.hideAllScreens();
        document.getElementById(screenId).classList.remove('hidden');
    }

    hideAllScreens() {
        const screens = ['startScreen', 'gameOverScreen', 'pauseScreen'];
        screens.forEach(screenId => {
            document.getElementById(screenId).classList.add('hidden');
        });
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // Update game time
        this.gameTime += deltaTime;
        
        // Update player
        this.player.handleInput(this.keys);
        this.player.update(deltaTime, this.bulletManager, this.particleSystem);
        
        // Update invaders
        this.invaderFormation.update(deltaTime, this.bulletManager, this.player, this.particleSystem);
        
        // Update bullets
        this.bulletManager.update(deltaTime);
        
        // Update particles
        this.particleSystem.update(deltaTime);
        
        // Update stars
        this.updateStarField(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Check win/lose conditions
        this.checkGameConditions();
    }

    updateStarField(deltaTime) {
        this.stars.forEach(star => {
            star.y += star.speed * deltaTime;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }

    checkCollisions() {
        // Player bullets vs invaders
        const playerBullets = this.bulletManager.getPlayerBullets();
        const scoreGained = this.invaderFormation.checkCollisions(playerBullets, this.particleSystem);
        if (scoreGained > 0) {
            this.score += scoreGained;
            this.updateHUD();
        }
        
        // Enemy bullets vs player
        const enemyBullets = this.bulletManager.getEnemyBullets();
        enemyBullets.forEach(bullet => {
            if (bullet.active && bullet.checkCollision(this.player)) {
                bullet.active = false;
                const playerDied = this.player.takeDamage(this.particleSystem);
                
                if (playerDied) {
                    this.gameOver();
                } else {
                    this.lives = this.player.lives;
                    this.updateHUD();
                }
            }
        });
        
        // Check if invaders reached player level
        const lowestInvader = this.invaderFormation.getLowestRow();
        if (lowestInvader >= this.player.y - 20) {
            this.gameOver();
        }
    }

    checkGameConditions() {
        // Check if all invaders destroyed
        if (this.invaderFormation.getActiveCount() === 0) {
            this.nextLevel();
        }
    }

    render() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000408');
        gradient.addColorStop(0.5, '#001122');
        gradient.addColorStop(1, '#000408');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render star field
        this.renderStarField();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Render particles (background layer)
            this.particleSystem.render(this.ctx);
            
            // Render game objects
            this.invaderFormation.render(this.ctx);
            this.bulletManager.render(this.ctx);
            this.player.render(this.ctx);
            
            // Render UI overlays
            this.renderGameUI();
        }
        
        // Render FPS counter (debug)
        this.renderDebugInfo();
    }

    renderStarField() {
        this.ctx.save();
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        this.ctx.restore();
    }

    renderGameUI() {
        // Render scan lines effect
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 0.5;
        for (let y = 0; y < this.canvas.height; y += 4) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        // Render border glow effect
        this.ctx.save();
        this.ctx.strokeStyle = '#00ff88';
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ff88';
        this.ctx.strokeRect(2, 2, this.canvas.width - 4, this.canvas.height - 4);
        this.ctx.restore();
    }

    renderDebugInfo() {
        if (this.gameState === 'playing') {
            this.ctx.save();
            this.ctx.fillStyle = '#00ff88';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
            this.ctx.fillText(`Bullets: ${this.bulletManager.getBulletCount()}`, 10, 35);
            this.ctx.fillText(`Invaders: ${this.invaderFormation.getActiveCount()}`, 10, 50);
            this.ctx.restore();
        }
    }

    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1/30); // Cap at 30 FPS minimum
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1.0) {
            this.fps = Math.round(this.frameCount);
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        
        // Update and render
        this.update(deltaTime);
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    startGameLoop() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new SpaceInvadersGame();
});