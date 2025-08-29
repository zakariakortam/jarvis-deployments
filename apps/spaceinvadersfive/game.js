// Cosmic Defender - Complete Game Implementation
class CosmicDefender {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('cosmicDefenderHighScore')) || 0;
        this.wave = 1;
        this.lives = 3;
        this.health = 100;
        this.maxHealth = 100;
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.stars = [];
        this.boss = null;
        
        // Input handling
        this.keys = {};
        this.lastShotTime = 0;
        this.shotCooldown = 200; // milliseconds
        
        // Wave management
        this.enemiesRemaining = 0;
        this.waveStartTime = 0;
        this.betweenWaves = false;
        
        // Power-ups
        this.activePowerUps = new Map();
        
        // Audio context
        this.audioContext = null;
        
        // Difficulty scaling
        this.difficultyMultiplier = 1;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupEventListeners();
        this.createStarField();
        this.updateHighScoreDisplay();
        this.gameLoop();
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.shoot();
                }
            }
            
            if (e.code === 'KeyP') {
                e.preventDefault();
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button events
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    createStarField() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.health = this.maxHealth;
        this.difficultyMultiplier = 1;
        
        // Clear arrays
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.particles = [];
        this.boss = null;
        this.activePowerUps.clear();
        
        // Create player
        this.player = new Player(this.width / 2, this.height - 50);
        
        // Start first wave
        this.startWave();
        
        // Show game UI
        this.showScreen('gameUI');
        this.updateUI();
    }
    
    startWave() {
        this.betweenWaves = false;
        this.waveStartTime = Date.now();
        
        // Boss wave every 5 waves
        if (this.wave % 5 === 0) {
            this.spawnBoss();
        } else {
            this.spawnEnemyWave();
        }
        
        this.difficultyMultiplier = 1 + (this.wave - 1) * 0.2;
    }
    
    spawnEnemyWave() {
        const enemyCount = Math.min(5 + this.wave * 2, 20);
        this.enemiesRemaining = enemyCount;
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    const enemyType = Math.random() < 0.7 ? 'basic' : 
                                    Math.random() < 0.5 ? 'fast' : 'heavy';
                    const x = Math.random() * (this.width - 60) + 30;
                    const y = -50 - Math.random() * 200;
                    this.enemies.push(new Enemy(x, y, enemyType, this.difficultyMultiplier));
                }
            }, i * 500);
        }
    }
    
    spawnBoss() {
        this.enemiesRemaining = 1;
        this.boss = new Boss(this.width / 2, 100, this.difficultyMultiplier);
        this.enemies.push(this.boss);
    }
    
    shoot() {
        const now = Date.now();
        const cooldown = this.activePowerUps.has('rapidFire') ? this.shotCooldown / 3 : this.shotCooldown;
        
        if (now - this.lastShotTime > cooldown) {
            this.lastShotTime = now;
            
            if (this.activePowerUps.has('multiShot')) {
                // Triple shot
                this.bullets.push(new Bullet(this.player.x - 10, this.player.y, 0, -8, true));
                this.bullets.push(new Bullet(this.player.x, this.player.y, 0, -8, true));
                this.bullets.push(new Bullet(this.player.x + 10, this.player.y, 0, -8, true));
            } else {
                this.bullets.push(new Bullet(this.player.x, this.player.y, 0, -8, true));
            }
            
            this.playSound(800, 0.1, 'square', 0.05);
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseScreen');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('gameUI');
        }
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.showScreen('menuScreen');
    }
    
    showScreen(screenId) {
        const screens = ['menuScreen', 'gameOverScreen', 'pauseScreen', 'gameUI'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (id === screenId) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }
    
    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('waveDisplay').textContent = this.wave;
        document.getElementById('livesDisplay').textContent = this.lives;
        
        const healthPercent = (this.health / this.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        
        // Update power-ups display
        const powerUpDisplay = document.getElementById('powerUpDisplay');
        powerUpDisplay.innerHTML = '';
        this.activePowerUps.forEach((endTime, powerUp) => {
            const icon = document.createElement('div');
            icon.className = 'power-up-icon';
            icon.textContent = powerUp.charAt(0).toUpperCase();
            powerUpDisplay.appendChild(icon);
        });
    }
    
    updateHighScoreDisplay() {
        document.getElementById('highScoreDisplay').textContent = this.highScore;
    }
    
    takeDamage(amount) {
        if (this.activePowerUps.has('shield')) {
            this.activePowerUps.delete('shield');
            this.playSound(600, 0.2, 'sawtooth', 0.1);
            return;
        }
        
        this.health -= amount;
        this.playSound(300, 0.3, 'sawtooth', 0.1);
        
        if (this.health <= 0) {
            this.health = 0;
            this.loseLife();
        }
    }
    
    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.health = this.maxHealth;
            this.player.x = this.width / 2;
            this.player.y = this.height - 50;
            
            // Brief invincibility
            this.activePowerUps.set('shield', Date.now() + 2000);
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Check for high score
        let newHighScore = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cosmicDefenderHighScore', this.highScore.toString());
            newHighScore = true;
        }
        
        // Update game over screen
        document.getElementById('finalScore').textContent = `Score: ${this.score}`;
        const newHighScoreElement = document.getElementById('newHighScore');
        if (newHighScore) {
            newHighScoreElement.classList.remove('hidden');
        } else {
            newHighScoreElement.classList.add('hidden');
        }
        
        this.updateHighScoreDisplay();
        this.showScreen('gameOverScreen');
        
        this.playSound(200, 1, 'sawtooth', 0.2);
    }
    
    spawnPowerUp(x, y) {
        if (Math.random() < 0.3) { // 30% chance
            const types = ['rapidFire', 'multiShot', 'shield', 'health'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push(new PowerUp(x, y, type));
        }
    }
    
    collectPowerUp(powerUp) {
        this.score += 50;
        this.playSound(1000, 0.3, 'sine', 0.1);
        
        switch (powerUp.type) {
            case 'rapidFire':
            case 'multiShot':
            case 'shield':
                this.activePowerUps.set(powerUp.type, Date.now() + 10000); // 10 seconds
                break;
            case 'health':
                this.health = Math.min(this.health + 30, this.maxHealth);
                break;
        }
    }
    
    createExplosion(x, y, color = '#ff6b6b', size = 20) {
        for (let i = 0; i < size; i++) {
            const angle = (Math.PI * 2 * i) / size;
            const speed = Math.random() * 4 + 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color
            ));
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update power-ups timer
        const now = Date.now();
        for (const [powerUp, endTime] of this.activePowerUps) {
            if (now > endTime) {
                this.activePowerUps.delete(powerUp);
            }
        }
        
        // Update player
        if (this.player) {
            this.player.update(this.keys, deltaTime);
            
            // Keep player in bounds
            this.player.x = Math.max(25, Math.min(this.width - 25, this.player.x));
            this.player.y = Math.max(25, Math.min(this.height - 25, this.player.y));
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.y > -10 && bullet.y < this.height + 10;
        });
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.y > -10 && bullet.y < this.height + 10;
        });
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            
            // Enemy shooting
            if (enemy.canShoot && Math.random() < 0.01 * this.difficultyMultiplier) {
                const dx = this.player.x - enemy.x;
                const dy = this.player.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                this.enemyBullets.push(new Bullet(
                    enemy.x, enemy.y,
                    (dx / distance) * 3,
                    (dy / distance) * 3,
                    false
                ));
            }
        });
        
        // Remove off-screen enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.y > this.height + 50) {
                if (enemy.isBoss) {
                    // Boss escaped, lose life
                    this.loseLife();
                }
                return false;
            }
            return enemy.health > 0;
        });
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return powerUp.y < this.height + 50;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // Update stars
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = -5;
                star.x = Math.random() * this.width;
            }
        });
        
        // Collision detection
        this.checkCollisions();
        
        // Check wave completion
        if (this.enemies.length === 0 && !this.betweenWaves) {
            this.betweenWaves = true;
            setTimeout(() => {
                this.wave++;
                this.startWave();
            }, 2000);
        }
        
        this.updateUI();
    }
    
    checkCollisions() {
        // Player bullets vs enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isPlayerBullet) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.checkCollision(bullet, enemy)) {
                    // Hit enemy
                    enemy.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);
                    
                    this.createExplosion(bullet.x, bullet.y, '#ffff00', 8);
                    this.playSound(600, 0.1, 'square', 0.03);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.createExplosion(enemy.x, enemy.y, '#ff6b6b', 15);
                        this.playSound(400, 0.3, 'sawtooth', 0.1);
                        
                        // Spawn power-up chance
                        this.spawnPowerUp(enemy.x, enemy.y);
                        
                        this.enemies.splice(j, 1);
                        this.enemiesRemaining--;
                    }
                    break;
                }
            }
        }
        
        // Enemy bullets vs player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.checkCollision(bullet, this.player)) {
                this.takeDamage(bullet.damage);
                this.enemyBullets.splice(i, 1);
                this.createExplosion(bullet.x, bullet.y, '#ff0000', 10);
            }
        }
        
        // Player vs enemies
        this.enemies.forEach(enemy => {
            if (this.checkCollision(this.player, enemy)) {
                this.takeDamage(enemy.contactDamage);
                enemy.takeDamage(50); // Damage enemy too
                this.createExplosion(this.player.x, this.player.y, '#ff0000', 12);
            }
        });
        
        // Player vs power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.checkCollision(this.player, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 17, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillRect(star.x, star.y, 1, 1);
        });
        this.ctx.globalAlpha = 1;
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw game objects
            this.particles.forEach(particle => particle.render(this.ctx));
            this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
            this.bullets.forEach(bullet => bullet.render(this.ctx));
            this.enemyBullets.forEach(bullet => bullet.render(this.ctx));
            this.enemies.forEach(enemy => enemy.render(this.ctx));
            
            if (this.player) {
                this.player.render(this.ctx, this.activePowerUps.has('shield'));
            }
            
            // Draw wave indicator
            if (this.betweenWaves) {
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '32px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Wave ${this.wave}`, this.width / 2, this.height / 2);
            }
        }
    }
    
    gameLoop() {
        const currentTime = Date.now();
        const deltaTime = Math.min(currentTime - (this.lastTime || currentTime), 16.67); // Cap at 60fps
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Game object classes
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 5;
        this.angle = 0;
    }
    
    update(keys, deltaTime) {
        // Movement
        if (keys['KeyW'] || keys['ArrowUp']) this.y -= this.speed;
        if (keys['KeyS'] || keys['ArrowDown']) this.y += this.speed;
        if (keys['KeyA'] || keys['ArrowLeft']) this.x -= this.speed;
        if (keys['KeyD'] || keys['ArrowRight']) this.x += this.speed;
        
        this.angle += 0.1;
    }
    
    render(ctx, hasShield = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Shield effect
        if (hasShield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Ship body
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(-this.radius * 0.6, this.radius);
        ctx.lineTo(this.radius * 0.6, this.radius);
        ctx.closePath();
        ctx.fill();
        
        // Ship details
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type = 'basic', difficultyMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.angle = 0;
        this.canShoot = true;
        this.isBoss = false;
        
        // Set properties based on type
        switch (type) {
            case 'basic':
                this.radius = 12;
                this.speed = 1 * difficultyMultiplier;
                this.health = 1;
                this.maxHealth = 1;
                this.points = 10;
                this.contactDamage = 20;
                this.color = '#ff6b6b';
                break;
            case 'fast':
                this.radius = 10;
                this.speed = 2.5 * difficultyMultiplier;
                this.health = 1;
                this.maxHealth = 1;
                this.points = 20;
                this.contactDamage = 15;
                this.color = '#ffff00';
                break;
            case 'heavy':
                this.radius = 18;
                this.speed = 0.5 * difficultyMultiplier;
                this.health = 3;
                this.maxHealth = 3;
                this.points = 50;
                this.contactDamage = 30;
                this.color = '#ff8e53';
                break;
        }
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.angle += 0.05;
    }
    
    takeDamage(amount) {
        this.health -= amount;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Enemy details
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Health bar for heavy enemies
        if (this.type === 'heavy' && this.health < this.maxHealth) {
            ctx.restore();
            const barWidth = 30;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth * healthPercent, barHeight);
        } else {
            ctx.restore();
        }
    }
}

class Boss extends Enemy {
    constructor(x, y, difficultyMultiplier = 1) {
        super(x, y, 'boss', difficultyMultiplier);
        this.radius = 40;
        this.speed = 0.5;
        this.health = 20 * difficultyMultiplier;
        this.maxHealth = this.health;
        this.points = 500;
        this.contactDamage = 50;
        this.color = '#ff0000';
        this.isBoss = true;
        this.movePattern = 0;
        this.moveTimer = 0;
    }
    
    update(deltaTime) {
        this.moveTimer += deltaTime;
        
        // Complex movement pattern
        if (this.moveTimer > 2000) {
            this.movePattern = (this.movePattern + 1) % 3;
            this.moveTimer = 0;
        }
        
        switch (this.movePattern) {
            case 0: // Move left
                this.x -= 1;
                break;
            case 1: // Move right
                this.x += 1;
                break;
            case 2: // Move down slightly
                this.y += 0.3;
                break;
        }
        
        // Keep boss in bounds
        this.x = Math.max(this.radius, Math.min(800 - this.radius, this.x));
        
        this.angle += 0.02;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Boss body - larger and more detailed
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Boss details
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x = Math.cos(angle) * this.radius * 0.6;
            const y = Math.sin(angle) * this.radius * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Health bar
        const barWidth = 80;
        const barHeight = 6;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 15, barWidth * healthPercent, barHeight);
        
        // Boss label
        ctx.fillStyle = '#ffff00';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.x, this.y - this.radius - 25);
    }
}

class Bullet {
    constructor(x, y, vx, vy, isPlayerBullet = true) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 3;
        this.isPlayerBullet = isPlayerBullet;
        this.damage = isPlayerBullet ? 1 : 20;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    render(ctx) {
        ctx.fillStyle = this.isPlayerBullet ? '#00ffff' : '#ff6b6b';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bullet trail
        ctx.fillStyle = this.isPlayerBullet ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 107, 107, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.vx, this.y - this.vy, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.speed = 2;
        this.angle = 0;
        this.pulseScale = 1;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.angle += 0.1;
        this.pulseScale = 1 + Math.sin(this.angle * 2) * 0.2;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Power-up glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Power-up body
        let color;
        switch (this.type) {
            case 'rapidFire': color = '#ff6b6b'; break;
            case 'multiShot': color = '#4ecdc4'; break;
            case 'shield': color = '#00ffff'; break;
            case 'health': color = '#00ff00'; break;
            default: color = '#ffffff';
        }
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Power-up symbol
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let symbol;
        switch (this.type) {
            case 'rapidFire': symbol = 'R'; break;
            case 'multiShot': symbol = 'M'; break;
            case 'shield': symbol = 'S'; break;
            case 'health': symbol = '+'; break;
            default: symbol = '?';
        }
        
        ctx.fillText(symbol, 0, 0);
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, vx, vy, color = '#ffffff') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 3 + 1;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
        this.size *= 0.99;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new CosmicDefender();
});