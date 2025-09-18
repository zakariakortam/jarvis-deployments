class OverRaidGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        this.lastTime = 0;
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        
        // Game stats
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.health = 100;
        this.maxHealth = 100;
        
        // Wave management
        this.enemiesRemaining = 0;
        this.waveStartTime = 0;
        this.betweenWaves = false;
        
        // Input
        this.keys = {};
        this.mobileControls = {
            left: false, right: false, up: false, down: false, shoot: false
        };
        
        // Power-ups
        this.powerups_active = {
            rapidFire: { active: false, endTime: 0 },
            multiShot: { active: false, endTime: 0 },
            scoreMultiplier: { active: false, endTime: 0 }
        };
        
        // Audio context for sound effects
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initAudio();
        this.createSounds();
        this.setupPlayer();
    }

    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = document.getElementById('gameContainer');
        const maxWidth = Math.min(window.innerWidth - 40, 1200);
        const maxHeight = Math.min(window.innerHeight - 120, 800);
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    createSounds() {
        if (!this.audioContext) return;
        
        // Create procedural sound effects
        this.sounds.shoot = this.createSound([200, 150, 100], [0.1, 0.05, 0.05], 'sawtooth');
        this.sounds.explosion = this.createSound([150, 100, 50], [0.2, 0.3, 0.2], 'square');
        this.sounds.powerup = this.createSound([400, 600, 800], [0.1, 0.1, 0.1], 'sine');
        this.sounds.hit = this.createSound([300, 200], [0.1, 0.1], 'square');
    }

    createSound(frequencies, durations, waveType = 'sine') {
        if (!this.audioContext) return null;
        
        return () => {
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = waveType;
                
                let currentTime = this.audioContext.currentTime;
                frequencies.forEach((freq, index) => {
                    oscillator.frequency.setValueAtTime(freq, currentTime);
                    gainNode.gain.setValueAtTime(0.1, currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + durations[index]);
                    currentTime += durations[index];
                });
                
                oscillator.start();
                oscillator.stop(currentTime);
            } catch (e) {
                console.log('Audio error:', e);
            }
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('mainMenuBtn').addEventListener('click', () => this.showMenu());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') this.shoot();
            }
            if (e.code === 'KeyP' && this.gameState !== 'menu') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mobile controls
        const mobileButtons = {
            'moveLeft': 'left',
            'moveRight': 'right',
            'moveUp': 'up',
            'moveDown': 'down'
        };

        Object.entries(mobileButtons).forEach(([id, direction]) => {
            const btn = document.getElementById(id);
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls[direction] = true;
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls[direction] = false;
            });
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.mobileControls[direction] = true;
            });
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.mobileControls[direction] = false;
            });
        });

        const shootBtn = document.getElementById('shootBtn');
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls.shoot = true;
        });
        shootBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls.shoot = false;
        });
        shootBtn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.mobileControls.shoot = true;
        });
        shootBtn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.mobileControls.shoot = false;
        });
    }

    setupPlayer() {
        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 40,
            speed: 5,
            lastShot: 0,
            shootCooldown: 250 // ms
        };
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.health = this.maxHealth;
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.enemiesRemaining = 0;
        this.betweenWaves = false;
        
        // Reset power-ups
        Object.values(this.powerups_active).forEach(powerup => {
            powerup.active = false;
            powerup.endTime = 0;
        });
        
        // Position player
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 20;
        
        this.showGameUI();
        this.spawnWave();
        this.gameLoop();
    }

    showMenu() {
        this.gameState = 'menu';
        document.getElementById('startMenu').style.display = 'block';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameUI').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
    }

    showInstructions() {
        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('instructions').style.display = 'block';
    }

    showGameUI() {
        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        document.getElementById('gameOver').style.display = 'none';
    }

    showGameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('finalWave').textContent = `Waves Survived: ${this.wave - 1}`;
        document.getElementById('gameOver').style.display = 'block';
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').style.display = 'flex';
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pauseMenu').style.display = 'none';
        this.gameLoop();
    }

    spawnWave() {
        const enemiesInWave = Math.min(5 + this.wave * 2, 15);
        this.enemiesRemaining = enemiesInWave;
        
        for (let i = 0; i < enemiesInWave; i++) {
            setTimeout(() => this.spawnEnemy(), i * 1000);
        }
    }

    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
            speed: 1 + Math.random() * 2 + this.wave * 0.2,
            health: 1 + Math.floor(this.wave / 3),
            maxHealth: 1 + Math.floor(this.wave / 3),
            lastShot: Date.now(),
            shootCooldown: 1000 + Math.random() * 1500,
            type: Math.random() < 0.8 ? 'basic' : 'shooter'
        };
        
        this.enemies.push(enemy);
    }

    shoot() {
        const now = Date.now();
        const cooldown = this.powerups_active.rapidFire.active ? 100 : this.player.shootCooldown;
        
        if (now - this.player.lastShot < cooldown) return;
        
        this.player.lastShot = now;
        this.playSound('shoot');
        
        if (this.powerups_active.multiShot.active) {
            // Triple shot
            for (let i = -1; i <= 1; i++) {
                this.bullets.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y,
                    width: 4,
                    height: 10,
                    speed: 8,
                    dx: i * 2,
                    dy: -8,
                    isPlayer: true
                });
            }
        } else {
            // Single shot
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 8,
                dx: 0,
                dy: -8,
                isPlayer: true
            });
        }
    }

    spawnPowerup(x, y) {
        if (Math.random() < 0.3) { // 30% chance
            const types = ['shield', 'rapidFire', 'multiShot', 'scoreMultiplier'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.powerups.push({
                x: x,
                y: y,
                width: 25,
                height: 25,
                speed: 2,
                type: type
            });
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer(deltaTime);
        this.updateBullets(deltaTime);
        this.updateEnemies(deltaTime);
        this.updatePowerups(deltaTime);
        this.updateParticles(deltaTime);
        this.checkCollisions();
        this.updatePowerupTimers();
        this.updateUI();
        
        // Check wave completion
        if (this.enemies.length === 0 && this.enemiesRemaining === 0 && !this.betweenWaves) {
            this.betweenWaves = true;
            setTimeout(() => {
                this.wave++;
                this.betweenWaves = false;
                this.spawnWave();
            }, 2000);
        }
    }

    updatePlayer(deltaTime) {
        // Handle movement
        let dx = 0, dy = 0;
        
        if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.mobileControls.left) dx = -1;
        if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.mobileControls.right) dx = 1;
        if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.mobileControls.up) dy = -1;
        if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.mobileControls.down) dy = 1;
        
        this.player.x += dx * this.player.speed;
        this.player.y += dy * this.player.speed;
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
        
        // Mobile shooting
        if (this.mobileControls.shoot) {
            this.shoot();
        }
    }

    updateBullets(deltaTime) {
        this.bullets.forEach((bullet, index) => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            
            // Remove bullets that are off screen
            if (bullet.y < -bullet.height || bullet.y > this.canvas.height + bullet.height ||
                bullet.x < -bullet.width || bullet.x > this.canvas.width + bullet.width) {
                this.bullets.splice(index, 1);
            }
        });
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            enemy.y += enemy.speed;
            
            // Enemy shooting
            if (enemy.type === 'shooter' && Date.now() - enemy.lastShot > enemy.shootCooldown) {
                enemy.lastShot = Date.now();
                this.bullets.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height,
                    width: 3,
                    height: 8,
                    speed: 4,
                    dx: 0,
                    dy: 4,
                    isPlayer: false
                });
            }
            
            // Remove enemies that are off screen
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(index, 1);
            }
        });
    }

    updatePowerups(deltaTime) {
        this.powerups.forEach((powerup, index) => {
            powerup.y += powerup.speed;
            
            if (powerup.y > this.canvas.height) {
                this.powerups.splice(index, 1);
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    checkCollisions() {
        // Player bullets vs enemies
        this.bullets.forEach((bullet, bulletIndex) => {
            if (!bullet.isPlayer) return;
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    // Damage enemy
                    enemy.health--;
                    this.bullets.splice(bulletIndex, 1);
                    
                    // Create hit particles
                    this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff6b6b', 3);
                    
                    if (enemy.health <= 0) {
                        // Enemy destroyed
                        this.playSound('explosion');
                        const points = 100 * (this.powerups_active.scoreMultiplier.active ? 2 : 1);
                        this.score += points;
                        
                        // Create explosion particles
                        this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffaa00', 8);
                        
                        // Chance for powerup
                        this.spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        
                        this.enemies.splice(enemyIndex, 1);
                    } else {
                        this.playSound('hit');
                    }
                }
            });
        });
        
        // Enemy bullets vs player
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.isPlayer) return;
            
            if (this.isColliding(bullet, this.player)) {
                this.health -= 20;
                this.bullets.splice(bulletIndex, 1);
                this.playSound('hit');
                
                // Screen shake effect
                document.getElementById('gameCanvas').classList.add('shake');
                setTimeout(() => {
                    document.getElementById('gameCanvas').classList.remove('shake');
                }, 300);
                
                if (this.health <= 0) {
                    this.playerDied();
                }
            }
        });
        
        // Enemies vs player
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(enemy, this.player)) {
                this.health -= 30;
                this.playSound('hit');
                this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff6b6b', 5);
                this.enemies.splice(enemyIndex, 1);
                
                if (this.health <= 0) {
                    this.playerDied();
                }
            }
        });
        
        // Powerups vs player
        this.powerups.forEach((powerup, powerupIndex) => {
            if (this.isColliding(powerup, this.player)) {
                this.collectPowerup(powerup);
                this.powerups.splice(powerupIndex, 1);
            }
        });
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    collectPowerup(powerup) {
        this.playSound('powerup');
        
        switch (powerup.type) {
            case 'shield':
                this.health = Math.min(this.maxHealth, this.health + 50);
                break;
            case 'rapidFire':
                this.powerups_active.rapidFire.active = true;
                this.powerups_active.rapidFire.endTime = Date.now() + 10000;
                break;
            case 'multiShot':
                this.powerups_active.multiShot.active = true;
                this.powerups_active.multiShot.endTime = Date.now() + 8000;
                break;
            case 'scoreMultiplier':
                this.powerups_active.scoreMultiplier.active = true;
                this.powerups_active.scoreMultiplier.endTime = Date.now() + 15000;
                break;
        }
        
        this.createParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, '#00ffff', 6);
    }

    updatePowerupTimers() {
        const now = Date.now();
        Object.entries(this.powerups_active).forEach(([key, powerup]) => {
            if (powerup.active && now > powerup.endTime) {
                powerup.active = false;
            }
        });
    }

    playerDied() {
        this.lives--;
        this.health = this.maxHealth;
        this.playSound('explosion');
        this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff6b6b', 12);
        
        if (this.lives <= 0) {
            this.showGameOver();
        }
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                life: 500 + Math.random() * 500,
                maxLife: 500 + Math.random() * 500,
                color: color,
                alpha: 1
            });
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('healthFill').style.width = `${(this.health / this.maxHealth) * 100}%`;
        
        // Update powerup display
        const activePowerups = [];
        Object.entries(this.powerups_active).forEach(([key, powerup]) => {
            if (powerup.active) {
                const timeLeft = Math.ceil((powerup.endTime - Date.now()) / 1000);
                activePowerups.push(`${key}: ${timeLeft}s`);
            }
        });
        document.getElementById('powerupDisplay').textContent = activePowerups.join(' | ');
    }

    render() {
        if (!this.ctx) return;
        
        // Clear canvas with starfield effect
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw starfield
        this.drawStarfield();
        
        if (this.gameState !== 'playing') return;
        
        // Draw game objects
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawPowerups();
        this.drawParticles();
        
        // Draw wave transition
        if (this.betweenWaves) {
            this.drawWaveTransition();
        }
    }

    drawStarfield() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 47 + Date.now() * 0.01) % this.canvas.width;
            const y = (i * 73 + Date.now() * 0.02) % this.canvas.height;
            const size = Math.sin(i) * 2 + 2;
            this.ctx.fillRect(x, y, size, size);
        }
    }

    drawPlayer() {
        const gradient = this.ctx.createRadialGradient(
            this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 0,
            this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, this.player.width / 2
        );
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#0088cc');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Player glow
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 10;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;
    }

    drawBullets() {
        this.bullets.forEach(bullet => {
            if (bullet.isPlayer) {
                this.ctx.fillStyle = '#ffff00';
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 5;
            } else {
                this.ctx.fillStyle = '#ff4444';
                this.ctx.shadowColor = '#ff4444';
                this.ctx.shadowBlur = 3;
            }
            
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }

    drawEnemies() {
        this.enemies.forEach(enemy => {
            const healthPercent = enemy.health / enemy.maxHealth;
            
            // Enemy body
            const gradient = this.ctx.createRadialGradient(
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 0,
                enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2
            );
            
            if (enemy.type === 'shooter') {
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(1, '#cc4444');
            } else {
                gradient.addColorStop(0, '#ff9966');
                gradient.addColorStop(1, '#cc6633');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Health bar
            if (enemy.maxHealth > 1) {
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
            }
        });
    }

    drawPowerups() {
        this.powerups.forEach(powerup => {
            let color;
            switch (powerup.type) {
                case 'shield': color = '#ff0000'; break;
                case 'rapidFire': color = '#ffff00'; break;
                case 'multiShot': color = '#0000ff'; break;
                case 'scoreMultiplier': color = '#00ff00'; break;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
            this.ctx.shadowBlur = 0;
            
            // Pulsing effect
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            this.ctx.globalAlpha = pulse;
            this.ctx.fillRect(powerup.x - 2, powerup.y - 2, powerup.width + 4, powerup.height + 4);
            this.ctx.globalAlpha = 1;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;
    }

    drawWaveTransition() {
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`WAVE ${this.wave}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '24px Courier New';
        this.ctx.fillText('GET READY!', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OverRaidGame();
});