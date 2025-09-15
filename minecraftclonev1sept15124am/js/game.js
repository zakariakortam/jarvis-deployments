/**
 * Main Minecraft Clone Game Engine
 * Orchestrates all systems and manages game state
 */
class MinecraftClone {
    constructor() {
        // Core systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.player = null;
        this.blockSystem = null;
        this.audioSystem = null;
        this.particleSystem = null;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameMode = 'creative'; // creative, survival, adventure
        this.difficulty = 'normal';
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 60;
        this.lastTime = 0;
        
        // UI elements
        this.loadingScreen = null;
        this.inventory = null;
        this.selectedBlockIndex = 0;
        
        // Settings
        this.settings = {
            renderDistance: 4,
            graphics: 'high',
            shadows: true,
            particles: true,
            music: true,
            sounds: true,
            fov: 75,
            mouseSensitivity: 0.5
        };
        
        // Input handling
        this.keys = new Set();
        this.setupEventListeners();
    }

    async init() {
        try {
            console.log('Initializing Minecraft Clone...');
            this.updateLoadingProgress(10, 'Initializing graphics...');
            
            // Initialize Three.js
            await this.initThreeJS();
            this.updateLoadingProgress(20, 'Setting up world...');
            
            // Initialize game systems
            this.blockSystem = new BlockSystem();
            this.updateLoadingProgress(30, 'Creating world...');
            
            this.world = new World(this.blockSystem);
            this.world.init(this.scene);
            this.updateLoadingProgress(50, 'Initializing audio...');
            
            this.audioSystem = new AudioSystem();
            this.updateLoadingProgress(60, 'Setting up particles...');
            
            this.particleSystem = new ParticleSystem(this.scene);
            this.updateLoadingProgress(70, 'Creating player...');
            
            // Initialize player
            this.player = new Player(this.world, this.camera);
            this.updateLoadingProgress(80, 'Loading world chunks...');
            
            // Generate initial world around spawn
            await this.generateSpawnArea();
            this.updateLoadingProgress(90, 'Finalizing...');
            
            // Setup lighting
            this.setupLighting();
            this.updateLoadingProgress(95, 'Starting game...');
            
            // Setup UI
            this.setupUI();
            this.updateLoadingProgress(100, 'Ready!');
            
            // Hide loading screen and start game loop
            setTimeout(() => {
                this.hideLoadingScreen();
                this.startGameLoop();
            }, 500);
            
            console.log('Minecraft Clone initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh and try again.');
        }
    }

    async initThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            this.settings.fov,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.settings.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = this.settings.shadows;
        
        if (this.settings.shadows) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            directionalLight.shadow.camera.left = -100;
            directionalLight.shadow.camera.right = 100;
            directionalLight.shadow.camera.top = 100;
            directionalLight.shadow.camera.bottom = -100;
        }
        
        this.scene.add(directionalLight);
        
        // Fog for atmospheric effect
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    async generateSpawnArea() {
        const spawnPos = { x: 0, z: 0 };
        const renderDistance = 3; // Smaller initial area for faster loading
        
        for (let dx = -renderDistance; dx <= renderDistance; dx++) {
            for (let dz = -renderDistance; dz <= renderDistance; dz++) {
                this.world.generateChunk(dx, dz);
            }
            // Allow UI to update during generation
            await this.sleep(10);
        }
        
        // Find a good spawn position
        const spawnHeight = this.world.noiseGenerator.getHeight(0, 0) + 2;
        this.player.position.set(0, spawnHeight, 0);
    }

    setupUI() {
        // Setup inventory selection
        this.setupInventory();
        
        // Setup info display
        this.setupInfoDisplay();
        
        // Start background music
        if (this.settings.music) {
            setTimeout(() => {
                this.audioSystem.playMusic('creative');
            }, 2000);
        }
    }

    setupInventory() {
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        
        inventorySlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectInventorySlot(index);
            });
        });
        
        // Keyboard shortcuts for inventory
        document.addEventListener('keydown', (event) => {
            if (event.code.startsWith('Digit') && !event.repeat) {
                const digit = parseInt(event.code.replace('Digit', ''));
                if (digit >= 1 && digit <= 9) {
                    this.selectInventorySlot(digit - 1);
                }
            }
        });
    }

    selectInventorySlot(index) {
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        
        // Remove previous selection
        inventorySlots.forEach(slot => slot.classList.remove('selected'));
        
        // Add selection to new slot
        if (index >= 0 && index < inventorySlots.length) {
            inventorySlots[index].classList.add('selected');
            this.selectedBlockIndex = index;
        }
    }

    setupInfoDisplay() {
        this.infoElements = {
            position: document.getElementById('position'),
            fps: document.getElementById('fps'),
            blockCount: document.getElementById('blockCount')
        };
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.keys.add(event.code);
            
            switch (event.code) {
                case 'KeyF':
                    if (event.target === document.body) {
                        this.toggleFullscreen();
                        event.preventDefault();
                    }
                    break;
                case 'KeyM':
                    this.toggleMusic();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
                case 'F3':
                    this.toggleDebugInfo();
                    event.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
        });
        
        // Mouse wheel for inventory selection
        document.addEventListener('wheel', (event) => {
            if (document.pointerLockElement) {
                event.preventDefault();
                const direction = event.deltaY > 0 ? 1 : -1;
                const newIndex = (this.selectedBlockIndex + direction + 9) % 9;
                this.selectInventorySlot(newIndex);
            }
        });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        this.updateFPS();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // Update player
        this.player.update(deltaTime);
        
        // Update world around player
        this.world.updateAroundPlayer(this.player.getPosition());
        
        // Update particle system
        if (this.settings.particles) {
            this.particleSystem.update(deltaTime);
        }
        
        // Update audio listener
        this.audioSystem.updateListener(
            this.player.getPosition(),
            this.player.rotation
        );
        
        // Update environmental effects
        this.updateEnvironmentalEffects();
        
        // Cleanup distant chunks periodically
        if (this.frameCount % 300 === 0) {
            this.world.cleanup(this.player.getPosition());
        }
        
        this.frameCount++;
    }

    updateEnvironmentalEffects() {
        const playerPos = this.player.getPosition();
        
        // Get current biome
        const biome = this.world.noiseGenerator.getBiome(playerPos.x, playerPos.z);
        
        // Create environmental particle effects
        if (this.settings.particles && Math.random() > 0.99) {
            this.particleSystem.createEnvironmentalEffects(playerPos, biome);
        }
        
        // Handle block-specific effects
        const blockBelow = this.world.getBlock(
            Math.floor(playerPos.x),
            Math.floor(playerPos.y - 1),
            Math.floor(playerPos.z)
        );
        
        if (blockBelow === 'lava' && Math.random() > 0.95) {
            this.particleSystem.createLavaEffect(
                new THREE.Vector3(playerPos.x, playerPos.y - 1, playerPos.z),
                0.5
            );
        }
    }

    render() {
        // Render particles
        if (this.settings.particles) {
            this.particleSystem.render();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    updateFPS() {
        const currentTime = performance.now();
        
        if (currentTime >= this.lastFpsUpdate + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            
            // Update UI
            this.updateUI();
        }
    }

    updateUI() {
        if (!this.infoElements) return;
        
        const playerPos = this.player.getPosition();
        const debugInfo = this.player.getDebugInfo();
        
        // Update position display
        this.infoElements.position.textContent = 
            `${debugInfo.position.x}, ${debugInfo.position.y}, ${debugInfo.position.z}`;
        
        // Update FPS
        this.infoElements.fps.textContent = this.fps;
        
        // Update block count
        this.infoElements.blockCount.textContent = this.world.getBlockCount();
    }

    updateLoadingProgress(percent, message = '') {
        const progressBar = document.getElementById('loadingProgress');
        const loadingScreen = document.getElementById('loadingScreen');
        
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
        
        if (message && loadingScreen) {
            let messageElement = loadingScreen.querySelector('p:last-child');
            if (messageElement) {
                messageElement.textContent = message;
            }
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <h1 style="color: #ff6b6b;">⚠️ Error</h1>
                <p style="color: white; font-size: 18px;">${message}</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                ">Retry</button>
            `;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleMusic() {
        this.settings.music = !this.settings.music;
        
        if (this.settings.music) {
            this.audioSystem.playMusic('creative');
            console.log('Music: ON');
        } else {
            this.audioSystem.setMusicVolume(0);
            console.log('Music: OFF');
        }
    }

    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }

    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        console.log('Game resumed');
    }

    toggleDebugInfo() {
        const infoPanel = document.getElementById('info');
        if (infoPanel) {
            infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Utility function for async delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Game mode switching
    setGameMode(mode) {
        const validModes = ['creative', 'survival', 'adventure'];
        if (validModes.includes(mode)) {
            this.gameMode = mode;
            console.log(`Game mode set to: ${mode}`);
            
            // Switch music based on game mode
            if (this.settings.music) {
                switch (mode) {
                    case 'creative':
                        this.audioSystem.playMusic('creative');
                        break;
                    case 'survival':
                        this.audioSystem.playMusic('exploration');
                        break;
                    case 'adventure':
                        this.audioSystem.playMusic('exploration');
                        break;
                }
            }
        }
    }

    // Settings management
    updateSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.applySettings();
        }
    }

    applySettings() {
        // Apply graphics settings
        if (this.renderer) {
            this.renderer.shadowMap.enabled = this.settings.shadows;
        }
        
        // Apply audio settings
        if (this.audioSystem) {
            if (!this.settings.music) {
                this.audioSystem.setMusicVolume(0);
            } else {
                this.audioSystem.setMusicVolume(0.5);
            }
            
            if (!this.settings.sounds) {
                this.audioSystem.setEffectsVolume(0);
            } else {
                this.audioSystem.setEffectsVolume(0.8);
            }
        }
        
        // Apply camera settings
        if (this.camera) {
            this.camera.fov = this.settings.fov;
            this.camera.updateProjectionMatrix();
        }
        
        // Apply player settings
        if (this.player) {
            this.player.mouse.sensitivity = this.settings.mouseSensitivity * 0.002;
        }
    }

    // Performance monitoring
    getPerformanceStats() {
        return {
            fps: this.fps,
            blockCount: this.world ? this.world.getBlockCount() : 0,
            particleCount: this.particleSystem ? this.particleSystem.getParticleCount() : 0,
            loadedChunks: this.world ? this.world.loadedChunks.size : 0,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576)
            } : null
        };
    }

    // Cleanup
    destroy() {
        this.isRunning = false;
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up particle systems
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        // Clean up audio
        if (this.audioSystem && this.audioSystem.context) {
            this.audioSystem.context.close();
        }
        
        console.log('Game cleanup complete');
    }
}