/**
 * Advanced 3D Audio System
 * Handles spatial audio, music, sound effects, and ambient sounds
 */
class AudioSystem {
    constructor() {
        // Audio context
        this.context = null;
        this.listener = null;
        this.sounds = new Map();
        this.music = new Map();
        this.ambientSounds = new Map();
        
        // Volume controls
        this.masterVolume = 0.7;
        this.musicVolume = 0.5;
        this.effectsVolume = 0.8;
        this.ambientVolume = 0.3;
        
        // State
        this.isInitialized = false;
        this.currentMusic = null;
        this.musicFading = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.context.listener;
            
            // Create master gain node
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.context.destination);
            
            // Create category gain nodes
            this.musicGain = this.context.createGain();
            this.effectsGain = this.context.createGain();
            this.ambientGain = this.context.createGain();
            
            this.musicGain.gain.value = this.musicVolume;
            this.effectsGain.gain.value = this.effectsVolume;
            this.ambientGain.gain.value = this.ambientVolume;
            
            this.musicGain.connect(this.masterGain);
            this.effectsGain.connect(this.masterGain);
            this.ambientGain.connect(this.masterGain);
            
            // Initialize sound libraries
            await this.loadSounds();
            
            this.isInitialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio system initialization failed:', error);
        }
    }

    async loadSounds() {
        // Generate procedural sounds since we can't load external files
        this.generateBlockSounds();
        this.generateAmbientSounds();
        this.generateMusic();
    }

    generateBlockSounds() {
        // Generate different block breaking sounds
        const blockSounds = {
            stone: { frequency: 200, duration: 0.3, type: 'noise' },
            wood: { frequency: 150, duration: 0.4, type: 'tap' },
            dirt: { frequency: 100, duration: 0.2, type: 'soft' },
            grass: { frequency: 120, duration: 0.25, type: 'rustle' },
            sand: { frequency: 80, duration: 0.15, type: 'sand' },
            glass: { frequency: 800, duration: 0.1, type: 'shatter' },
            metal: { frequency: 300, duration: 0.2, type: 'clang' },
            water: { frequency: 200, duration: 0.3, type: 'splash' },
            lava: { frequency: 150, duration: 0.5, type: 'bubble' }
        };

        for (const [blockType, params] of Object.entries(blockSounds)) {
            this.sounds.set(`break_${blockType}`, this.generateSound(params));
            this.sounds.set(`place_${blockType}`, this.generateSound({
                ...params,
                duration: params.duration * 0.7,
                pitch: 1.2
            }));
        }

        // Generate footstep sounds
        this.sounds.set('footstep_grass', this.generateFootstepSound('soft'));
        this.sounds.set('footstep_stone', this.generateFootstepSound('hard'));
        this.sounds.set('footstep_sand', this.generateFootstepSound('sand'));
        this.sounds.set('footstep_water', this.generateFootstepSound('splash'));
    }

    generateAmbientSounds() {
        // Generate ambient sounds
        this.ambientSounds.set('wind', this.generateWindSound());
        this.ambientSounds.set('cave', this.generateCaveAmbient());
        this.ambientSounds.set('underwater', this.generateUnderwaterAmbient());
        this.ambientSounds.set('forest', this.generateForestAmbient());
    }

    generateMusic() {
        // Generate simple ambient music tracks
        this.music.set('creative', this.generateAmbientMusic('peaceful'));
        this.music.set('exploration', this.generateAmbientMusic('adventure'));
        this.music.set('underground', this.generateAmbientMusic('mysterious'));
    }

    generateSound(params) {
        const buffer = this.context.createBuffer(1, this.context.sampleRate * params.duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        switch (params.type) {
            case 'noise':
                this.generateNoiseSound(data, params);
                break;
            case 'tap':
                this.generateTapSound(data, params);
                break;
            case 'soft':
                this.generateSoftSound(data, params);
                break;
            case 'rustle':
                this.generateRustleSound(data, params);
                break;
            case 'sand':
                this.generateSandSound(data, params);
                break;
            case 'shatter':
                this.generateShatterSound(data, params);
                break;
            case 'clang':
                this.generateClangSound(data, params);
                break;
            case 'splash':
                this.generateSplashSound(data, params);
                break;
            case 'bubble':
                this.generateBubbleSound(data, params);
                break;
        }

        return buffer;
    }

    generateNoiseSound(data, params) {
        const freq = params.frequency || 200;
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8); // Exponential decay
            data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
        }
    }

    generateTapSound(data, params) {
        const freq = params.frequency || 150;
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 12);
            const sine = Math.sin(2 * Math.PI * freq * t);
            data[i] = sine * envelope * 0.4;
        }
    }

    generateSoftSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 6);
            const noise = (Math.random() * 2 - 1) * 0.1;
            data[i] = noise * envelope;
        }
    }

    generateRustleSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 10);
            const highFreq = Math.sin(2 * Math.PI * 2000 * t) * Math.random() * 0.1;
            const noise = (Math.random() * 2 - 1) * 0.05;
            data[i] = (highFreq + noise) * envelope;
        }
    }

    generateSandSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 15);
            const noise = (Math.random() * 2 - 1) * 0.2;
            const filter = Math.sin(2 * Math.PI * 500 * t) * 0.1;
            data[i] = (noise + filter) * envelope;
        }
    }

    generateShatterSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            const highFreq = Math.sin(2 * Math.PI * (800 + Math.random() * 400) * t);
            data[i] = highFreq * envelope * 0.3;
        }
    }

    generateClangSound(data, params) {
        const freq = params.frequency || 300;
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 8);
            const fundamental = Math.sin(2 * Math.PI * freq * t);
            const harmonic = Math.sin(2 * Math.PI * freq * 2.5 * t) * 0.3;
            data[i] = (fundamental + harmonic) * envelope * 0.4;
        }
    }

    generateSplashSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5);
            const bubble = Math.sin(2 * Math.PI * (100 + Math.random() * 100) * t);
            const splash = (Math.random() * 2 - 1) * 0.1;
            data[i] = (bubble * 0.2 + splash) * envelope;
        }
    }

    generateBubbleSound(data, params) {
        const sampleRate = this.context.sampleRate;
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3);
            const bubble = Math.sin(2 * Math.PI * (50 + Math.random() * 200) * t);
            const pop = Math.random() > 0.98 ? (Math.random() * 2 - 1) * 0.5 : 0;
            data[i] = (bubble * 0.15 + pop) * envelope;
        }
    }

    generateFootstepSound(type) {
        const duration = 0.1;
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 20);
            
            switch (type) {
                case 'soft':
                    data[i] = (Math.random() * 2 - 1) * 0.1 * envelope;
                    break;
                case 'hard':
                    const tap = Math.sin(2 * Math.PI * 200 * t);
                    data[i] = tap * envelope * 0.2;
                    break;
                case 'sand':
                    const crunch = (Math.random() * 2 - 1) * 0.15;
                    data[i] = crunch * envelope;
                    break;
                case 'splash':
                    const splash = Math.sin(2 * Math.PI * 150 * t) + (Math.random() * 2 - 1) * 0.1;
                    data[i] = splash * envelope * 0.1;
                    break;
            }
        }

        return buffer;
    }

    generateWindSound() {
        const duration = 10; // Loop length
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const lowFreq = Math.sin(2 * Math.PI * 0.1 * t) * 0.05;
            const midFreq = Math.sin(2 * Math.PI * 0.3 * t) * 0.03;
            const noise = (Math.random() * 2 - 1) * 0.02;
            data[i] = lowFreq + midFreq + noise;
        }

        return buffer;
    }

    generateCaveAmbient() {
        const duration = 15;
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const drip = Math.random() > 0.999 ? Math.sin(2 * Math.PI * 800 * t) * 0.1 : 0;
            const echo = Math.sin(2 * Math.PI * 0.05 * t) * 0.02;
            const rumble = Math.sin(2 * Math.PI * 20 * t) * 0.01;
            data[i] = drip + echo + rumble;
        }

        return buffer;
    }

    generateUnderwaterAmbient() {
        const duration = 12;
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const bubble = Math.random() > 0.99 ? Math.sin(2 * Math.PI * (100 + Math.random() * 200) * t) * 0.05 : 0;
            const current = Math.sin(2 * Math.PI * 0.2 * t) * 0.03;
            const muffled = Math.sin(2 * Math.PI * 50 * t) * 0.01;
            data[i] = bubble + current + muffled;
        }

        return buffer;
    }

    generateForestAmbient() {
        const duration = 20;
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const bird = Math.random() > 0.998 ? Math.sin(2 * Math.PI * (800 + Math.random() * 400) * t) * 0.1 : 0;
            const leaves = Math.sin(2 * Math.PI * 0.1 * t) * 0.02;
            const wind = Math.sin(2 * Math.PI * 0.05 * t) * 0.01;
            data[i] = bird + leaves + wind;
        }

        return buffer;
    }

    generateAmbientMusic(mood) {
        const duration = 60; // 1 minute loop
        const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        const sampleRate = this.context.sampleRate;

        // Define scales for different moods
        const scales = {
            peaceful: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C major
            adventure: [261.63, 277.18, 311.13, 349.23, 369.99, 415.30, 466.16], // C minor
            mysterious: [261.63, 277.18, 329.63, 349.23, 369.99, 440.00, 493.88] // C dorian
        };

        const scale = scales[mood] || scales.peaceful;

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            let value = 0;

            // Add multiple harmonic layers
            for (let j = 0; j < 3; j++) {
                const freq = scale[Math.floor(t * 0.1 + j) % scale.length];
                const phase = 2 * Math.PI * freq * t * (1 + j * 0.01);
                const envelope = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.01 * t);
                value += Math.sin(phase) * envelope * (0.1 / (j + 1));
            }

            data[i] = value * 0.1;
        }

        return buffer;
    }

    playSound(soundName, position = null, volume = 1, pitch = 1) {
        if (!this.isInitialized || !this.sounds.has(soundName)) return null;

        const source = this.context.createBufferSource();
        source.buffer = this.sounds.get(soundName);

        let gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        if (position && this.listener) {
            // Create 3D positioned audio
            const panner = this.context.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'exponential';
            panner.refDistance = 1;
            panner.maxDistance = 50;
            panner.rolloffFactor = 1;

            panner.setPosition(position.x, position.y, position.z);
            
            source.connect(gainNode);
            gainNode.connect(panner);
            panner.connect(this.effectsGain);
        } else {
            source.connect(gainNode);
            gainNode.connect(this.effectsGain);
        }

        if (pitch !== 1) {
            source.playbackRate.value = pitch;
        }

        source.start();
        return source;
    }

    playBlockSound(blockType, action, position) {
        const soundName = `${action}_${blockType}`;
        const volume = action === 'break' ? 0.7 : 0.5;
        this.playSound(soundName, position, volume);
    }

    playFootstep(blockType, position) {
        let footstepType = 'soft';
        
        if (['stone', 'diamond', 'iron', 'gold'].includes(blockType)) {
            footstepType = 'hard';
        } else if (blockType === 'sand') {
            footstepType = 'sand';
        } else if (blockType === 'water') {
            footstepType = 'splash';
        }

        this.playSound(`footstep_${footstepType}`, position, 0.3);
    }

    startAmbientSound(soundName) {
        if (!this.isInitialized || !this.ambientSounds.has(soundName)) return;

        const source = this.context.createBufferSource();
        source.buffer = this.ambientSounds.get(soundName);
        source.loop = true;

        const gainNode = this.context.createGain();
        gainNode.gain.value = 0.5;

        source.connect(gainNode);
        gainNode.connect(this.ambientGain);

        source.start();
        return source;
    }

    playMusic(trackName) {
        if (!this.isInitialized || !this.music.has(trackName)) return;

        // Fade out current music
        if (this.currentMusic) {
            this.fadeOutMusic(this.currentMusic);
        }

        // Start new music
        const source = this.context.createBufferSource();
        source.buffer = this.music.get(trackName);
        source.loop = true;

        const gainNode = this.context.createGain();
        gainNode.gain.value = 0;

        source.connect(gainNode);
        gainNode.connect(this.musicGain);

        source.start();

        // Fade in new music
        gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 2);

        this.currentMusic = { source, gainNode };
    }

    fadeOutMusic(musicObj) {
        if (!musicObj) return;

        const { source, gainNode } = musicObj;
        gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
        
        setTimeout(() => {
            source.stop();
        }, 1000);
    }

    updateListener(position, rotation) {
        if (!this.listener || !this.isInitialized) return;

        // Update listener position
        this.listener.setPosition(position.x, position.y, position.z);

        // Update listener orientation
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(rotation);
        const up = new THREE.Vector3(0, 1, 0).applyEuler(rotation);
        
        this.listener.setOrientation(
            forward.x, forward.y, forward.z,
            up.x, up.y, up.z
        );
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        if (this.effectsGain) {
            this.effectsGain.gain.value = this.effectsVolume;
        }
    }
}