class Particle {
    constructor(x, y, vx, vy, life, color, size = 2) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.gravity = 0.1;
        this.alpha = 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        this.life -= deltaTime;
        this.alpha = this.life / this.maxLife;
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.effects = [];
    }

    createExplosion(x, y, color = '#ff6600', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.5 + Math.random() * 0.5;
            const size = 2 + Math.random() * 3;
            
            this.particles.push(new Particle(x, y, vx, vy, life, color, size));
        }

        // Add some sparkles
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 60;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.3 + Math.random() * 0.4;
            
            this.particles.push(new Particle(x, y, vx, vy, life, '#ffffff', 1));
        }
    }

    createEngineTrail(x, y) {
        if (Math.random() < 0.7) {
            const vx = -10 + Math.random() * 20;
            const vy = 50 + Math.random() * 30;
            const life = 0.2 + Math.random() * 0.3;
            const colors = ['#0088ff', '#00aaff', '#00ccff'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(x, y, vx, vy, life, color, 1.5));
        }
    }

    createHitEffect(x, y, color = '#ffffff') {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.2 + Math.random() * 0.2;
            
            this.particles.push(new Particle(x, y, vx, vy, life, color, 2));
        }
    }

    createStarField() {
        // Create background stars
        for (let i = 0; i < 3; i++) {
            const x = Math.random() * 800;
            const y = -5;
            const vx = 0;
            const vy = 20 + Math.random() * 30;
            const life = 15; // Long-lived stars
            const colors = ['#ffffff', '#aaaaff', '#ffffaa'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push(new Particle(x, y, vx, vy, life, color, 1));
        }
    }

    update(deltaTime) {
        // Update all particles
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
        
        // Create continuous star field
        if (Math.random() < 0.1) {
            this.createStarField();
        }
    }

    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }

    clear() {
        this.particles = [];
    }
}

class ShockwaveEffect {
    constructor(x, y, maxRadius = 50, duration = 0.5) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.duration = duration;
        this.time = 0;
        this.active = true;
    }

    update(deltaTime) {
        this.time += deltaTime;
        if (this.time >= this.duration) {
            this.active = false;
        }
        return this.active;
    }

    render(ctx) {
        if (!this.active) return;
        
        const progress = this.time / this.duration;
        const currentRadius = this.maxRadius * progress;
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff88';
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}