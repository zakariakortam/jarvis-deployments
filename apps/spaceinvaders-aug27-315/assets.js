class AssetManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.loaded = false;
    }

    async loadAssets() {
        // Create pixel art sprites programmatically for incredible graphics
        this.createSprites();
        this.loaded = true;
    }

    createSprites() {
        // Player ship sprite
        this.images.player = this.createPixelArtSprite(32, 24, (ctx) => {
            // Main body
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(14, 20, 4, 4);
            ctx.fillRect(12, 16, 8, 4);
            ctx.fillRect(10, 12, 12, 4);
            ctx.fillRect(8, 8, 16, 4);
            
            // Wings
            ctx.fillStyle = '#00cc66';
            ctx.fillRect(4, 16, 4, 4);
            ctx.fillRect(24, 16, 4, 4);
            ctx.fillRect(0, 12, 8, 4);
            ctx.fillRect(24, 12, 8, 4);
            
            // Engine glow
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(6, 20, 2, 2);
            ctx.fillRect(24, 20, 2, 2);
            ctx.fillRect(14, 22, 4, 2);
            
            // Cockpit
            ctx.fillStyle = '#88ffff';
            ctx.fillRect(14, 8, 4, 4);
        });

        // Invader sprites (3 types)
        this.images.invader1 = this.createPixelArtSprite(24, 16, (ctx) => {
            ctx.fillStyle = '#ff4444';
            // Type 1 - Octopus-like
            ctx.fillRect(6, 2, 12, 2);
            ctx.fillRect(2, 4, 20, 2);
            ctx.fillRect(0, 6, 24, 2);
            ctx.fillRect(2, 8, 2, 2);
            ctx.fillRect(6, 8, 2, 2);
            ctx.fillRect(16, 8, 2, 2);
            ctx.fillRect(20, 8, 2, 2);
            ctx.fillRect(4, 10, 2, 2);
            ctx.fillRect(8, 10, 8, 2);
            ctx.fillRect(18, 10, 2, 2);
            ctx.fillRect(0, 12, 4, 2);
            ctx.fillRect(20, 12, 4, 2);
        });

        this.images.invader2 = this.createPixelArtSprite(24, 16, (ctx) => {
            ctx.fillStyle = '#ffaa00';
            // Type 2 - Crab-like
            ctx.fillRect(4, 0, 2, 2);
            ctx.fillRect(18, 0, 2, 2);
            ctx.fillRect(6, 2, 2, 2);
            ctx.fillRect(16, 2, 2, 2);
            ctx.fillRect(4, 4, 16, 2);
            ctx.fillRect(2, 6, 20, 2);
            ctx.fillRect(0, 8, 24, 2);
            ctx.fillRect(0, 10, 4, 2);
            ctx.fillRect(8, 10, 8, 2);
            ctx.fillRect(20, 10, 4, 2);
            ctx.fillRect(6, 12, 2, 2);
            ctx.fillRect(16, 12, 2, 2);
            ctx.fillRect(2, 14, 2, 2);
            ctx.fillRect(20, 14, 2, 2);
        });

        this.images.invader3 = this.createPixelArtSprite(24, 16, (ctx) => {
            ctx.fillStyle = '#aa44ff';
            // Type 3 - Squid-like
            ctx.fillRect(8, 0, 8, 2);
            ctx.fillRect(6, 2, 12, 2);
            ctx.fillRect(4, 4, 16, 2);
            ctx.fillRect(2, 6, 20, 2);
            ctx.fillRect(0, 8, 24, 2);
            ctx.fillRect(4, 10, 2, 2);
            ctx.fillRect(10, 10, 4, 2);
            ctx.fillRect(18, 10, 2, 2);
            ctx.fillRect(2, 12, 2, 2);
            ctx.fillRect(8, 12, 2, 2);
            ctx.fillRect(14, 12, 2, 2);
            ctx.fillRect(20, 12, 2, 2);
        });

        // Bullet sprites
        this.images.bullet = this.createPixelArtSprite(4, 8, (ctx) => {
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(1, 0, 2, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(1.5, 0, 1, 6);
        });

        this.images.enemyBullet = this.createPixelArtSprite(4, 8, (ctx) => {
            ctx.fillStyle = '#ff0044';
            ctx.fillRect(1, 0, 2, 8);
            ctx.fillStyle = '#ff8888';
            ctx.fillRect(1.5, 0, 1, 6);
        });

        // Explosion frames
        this.images.explosion = [];
        for (let i = 0; i < 6; i++) {
            this.images.explosion[i] = this.createExplosionFrame(32, 32, i);
        }

        // Barrier/shield sprites
        this.images.barrier = this.createPixelArtSprite(48, 32, (ctx) => {
            ctx.fillStyle = '#00ff88';
            // Create barrier shape
            ctx.fillRect(0, 16, 48, 16);
            ctx.fillRect(8, 8, 32, 8);
            ctx.fillRect(16, 0, 16, 8);
            // Create opening
            ctx.clearRect(18, 20, 12, 12);
        });
    }

    createPixelArtSprite(width, height, drawFunction) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFunction(ctx);
        return canvas;
    }

    createExplosionFrame(width, height, frame) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) / 2;
        const currentRadius = (frame + 1) * (maxRadius / 6);
        
        // Create explosion effect
        ctx.fillStyle = `hsl(${60 - frame * 10}, 100%, ${70 - frame * 10}%)`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparks
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sparkX = centerX + Math.cos(angle) * currentRadius;
            const sparkY = centerY + Math.sin(angle) * currentRadius;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
        }
        
        return canvas;
    }

    getSprite(name) {
        return this.images[name];
    }

    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    createBeep(frequency, duration, type = 'sine') {
        const ctx = this.createAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    playSound(name) {
        try {
            switch (name) {
                case 'playerShoot':
                    this.createBeep(800, 0.1, 'square');
                    break;
                case 'invaderShoot':
                    this.createBeep(200, 0.2, 'sawtooth');
                    break;
                case 'invaderDestroy':
                    this.createBeep(150, 0.3, 'square');
                    setTimeout(() => this.createBeep(100, 0.2, 'square'), 100);
                    break;
                case 'playerHit':
                    this.createBeep(100, 0.5, 'sawtooth');
                    setTimeout(() => this.createBeep(80, 0.3, 'sawtooth'), 200);
                    break;
                default:
                    console.log(`Sound not implemented: ${name}`);
            }
        } catch (error) {
            console.log(`Audio error: ${error.message}`);
        }
    }
}

// Create global asset manager
const assetManager = new AssetManager();