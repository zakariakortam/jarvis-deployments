class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5,
            lives: 3
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.score = 0;
        this.gameRunning = true;
        this.keys = {};
        
        this.lastShot = 0;
        this.shotDelay = 200;
        this.invaderDirection = 1;
        this.invaderDropDistance = 40;
        
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        // Create invader formation (5 rows, 10 columns)
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 10; col++) {
                this.invaders.push({
                    x: col * 60 + 100,
                    y: row * 50 + 50,
                    width: 40,
                    height: 30,
                    alive: true,
                    points: (4 - row + 1) * 10 // Top row worth more points
                });
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Player shooting
        const now = Date.now();
        if (this.keys['Space'] && now - this.lastShot > this.shotDelay) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 7
            });
            this.lastShot = now;
        }
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });
        
        // Move invaders
        this.updateInvaders();
        
        // Random enemy shooting
        if (Math.random() < 0.002) {
            this.enemyShoot();
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Check win/lose conditions
        this.checkGameState();
    }
    
    updateInvaders() {
        let hitEdge = false;
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        
        // Check if any invader hits the edge
        for (let invader of aliveInvaders) {
            if ((invader.x <= 0 && this.invaderDirection === -1) || 
                (invader.x >= this.canvas.width - invader.width && this.invaderDirection === 1)) {
                hitEdge = true;
                break;
            }
        }
        
        // Move invaders
        for (let invader of aliveInvaders) {
            if (hitEdge) {
                invader.y += this.invaderDropDistance;
            } else {
                invader.x += this.invaderDirection * 0.5;
            }
        }
        
        // Change direction if hit edge
        if (hitEdge) {
            this.invaderDirection *= -1;
        }
    }
    
    enemyShoot() {
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        if (aliveInvaders.length > 0) {
            const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
            this.enemyBullets.push({
                x: shooter.x + shooter.width / 2 - 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10,
                speed: 3
            });
        }
    }
    
    checkCollisions() {
        // Player bullets vs invaders
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.invaders.length - 1; j >= 0; j--) {
                const invader = this.invaders[j];
                if (invader.alive && this.collision(bullet, invader)) {
                    this.score += invader.points;
                    invader.alive = false;
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Enemy bullets vs player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = this.enemyBullets[i];
            if (this.collision(bullet, this.player)) {
                this.player.lives--;
                this.enemyBullets.splice(i, 1);
                if (this.player.lives <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // Invaders reach player
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        for (let invader of aliveInvaders) {
            if (invader.y + invader.height >= this.player.y) {
                this.gameOver();
                break;
            }
        }
    }
    
    collision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkGameState() {
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        if (aliveInvaders.length === 0) {
            this.victory();
        }
    }
    
    victory() {
        this.gameRunning = false;
        document.querySelector('.game-over h2').textContent = 'Victory!';
        document.querySelector('.game-over p').textContent = `Final Score: ${this.score}`;
        document.querySelector('.game-over').style.display = 'block';
    }
    
    gameOver() {
        this.gameRunning = false;
        document.querySelector('.game-over h2').textContent = 'Game Over!';
        document.querySelector('.game-over p').textContent = `Final Score: ${this.score}`;
        document.querySelector('.game-over').style.display = 'block';
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000011';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw player bullets
        this.ctx.fillStyle = '#ffff00';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw enemy bullets
        this.ctx.fillStyle = '#ff0000';
        for (let bullet of this.enemyBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw invaders
        this.ctx.fillStyle = '#ffffff';
        for (let invader of this.invaders) {
            if (invader.alive) {
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            }
        }
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.player.lives;
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    restart() {
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5,
            lives: 3
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.invaders = [];
        this.score = 0;
        this.gameRunning = true;
        this.invaderDirection = 1;
        
        this.init();
        document.querySelector('.game-over').style.display = 'none';
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new SpaceInvaders();
});