 class Bullet {
    constructor(x, y, vx, vy, owner = 'player', damage = 1) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.damage = damage;
        this.width = 4;
        this.height = 8;
        this.active = true;
        this.trail = [];
        this.trailLength = 8;
    }     

    update(deltaTime) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        // Remove if off screen
        if (this.y < -10 || this.y > 610 || this.x < -10 || this.x > 810) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active) return;

        // Render trail
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i + 1) / this.trail.length * 0.5;
            ctx.globalAlpha = alpha;
            
            const trailColor = this.owner === 'player' ? '#00ffff' : '#ff0044';
            ctx.fillStyle = trailColor;
            
            const point = this.trail[i];
            const size = (i + 1) / this.trail.length * 2;
            ctx.fillRect(point.x - size/2, point.y - size/2, size, size);
        }
        ctx.restore();

        // Render bullet
        ctx.save();
        
        if (this.owner === 'player') {
            // Player bullet - bright cyan with glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00ffff';
        } else {
            // Enemy bullet - red with glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff0044';
            ctx.fillStyle = '#ff0044';
        }

        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Add bright core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 1, this.y - this.height/2, 2, this.height);
        
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

    checkCollision(target) {
        if (!this.active || !target.active) return false;

        const bulletBounds = this.getBounds();
        const targetBounds = target.getBounds();

        return bulletBounds.left < targetBounds.right &&
               bulletBounds.right > targetBounds.left &&
               bulletBounds.top < targetBounds.bottom &&
               bulletBounds.bottom > targetBounds.top;
    }
}

class BulletManager {
    constructor() {
        this.bullets = [];
        this.maxBullets = 100;
    }

    createBullet(x, y, vx, vy, owner = 'player', damage = 1) {
        if (this.bullets.length < this.maxBullets) {
            this.bullets.push(new Bullet(x, y, vx, vy, owner, damage));
        }
    }

    update(deltaTime) {
        // Update all bullets
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        
        // Remove inactive bullets
        this.bullets = this.bullets.filter(bullet => bullet.active);
    }

    render(ctx) {
        this.bullets.forEach(bullet => bullet.render(ctx));
    }

    getPlayerBullets() {
        return this.bullets.filter(bullet => bullet.owner === 'player' && bullet.active);
    }

    getEnemyBullets() {
        return this.bullets.filter(bullet => bullet.owner === 'enemy' && bullet.active);
    }

    clear() {
        this.bullets = [];
    }

    getBulletCount() {
        return this.bullets.length;
    }
}