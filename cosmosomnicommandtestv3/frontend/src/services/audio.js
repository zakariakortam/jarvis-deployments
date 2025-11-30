import { Howl, Howler } from 'howler';

class AudioService {
  constructor() {
    this.sounds = {};
    this.ambientTrack = null;
    this.enabled = true;
    this.masterVolume = 0.5;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Create synthesized sounds using Web Audio API instead of loading files
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.initialized = true;
    console.log('Audio service initialized');
  }

  // Generate a beep sound
  createBeep(frequency = 800, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // UI interaction sounds
  playClick() {
    this.createBeep(1200, 0.05, 'square');
  }

  playHover() {
    this.createBeep(800, 0.03, 'sine');
  }

  playSelect() {
    this.createBeep(1000, 0.08, 'triangle');
    setTimeout(() => this.createBeep(1200, 0.06, 'triangle'), 50);
  }

  playOpen() {
    this.createBeep(400, 0.1, 'sine');
    setTimeout(() => this.createBeep(600, 0.1, 'sine'), 50);
    setTimeout(() => this.createBeep(800, 0.1, 'sine'), 100);
  }

  playClose() {
    this.createBeep(800, 0.1, 'sine');
    setTimeout(() => this.createBeep(600, 0.1, 'sine'), 50);
    setTimeout(() => this.createBeep(400, 0.1, 'sine'), 100);
  }

  // Alert sounds
  playAlert(severity = 'warning') {
    if (!this.enabled || !this.audioContext) return;

    const frequencies = {
      info: [600, 800],
      warning: [800, 600, 800],
      caution: [700, 500, 700],
      alert: [1000, 800, 1000, 800],
      critical: [1200, 400, 1200, 400, 1200]
    };

    const freqs = frequencies[severity] || frequencies.warning;
    freqs.forEach((freq, i) => {
      setTimeout(() => this.createBeep(freq, 0.15, 'square'), i * 150);
    });
  }

  // Command terminal sounds
  playKeypress() {
    this.createBeep(1500, 0.02, 'square');
  }

  playCommandExecute() {
    this.createBeep(500, 0.1, 'sawtooth');
    setTimeout(() => this.createBeep(700, 0.1, 'sawtooth'), 100);
  }

  playCommandSuccess() {
    this.createBeep(600, 0.1, 'sine');
    setTimeout(() => this.createBeep(900, 0.15, 'sine'), 100);
  }

  playCommandError() {
    this.createBeep(300, 0.2, 'square');
    setTimeout(() => this.createBeep(200, 0.3, 'square'), 150);
  }

  // Data transmission sounds
  playDataReceive() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createBeep(1000 + Math.random() * 1000, 0.02, 'square');
      }, i * 30);
    }
  }

  // Notification sounds
  playNotification() {
    this.createBeep(880, 0.1, 'sine');
    setTimeout(() => this.createBeep(1100, 0.1, 'sine'), 100);
    setTimeout(() => this.createBeep(880, 0.15, 'sine'), 200);
  }

  // Ambient background (creates subtle noise)
  startAmbient() {
    if (!this.enabled || !this.audioContext || this.ambientTrack) return;

    // Create low-frequency ambient hum
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(30, this.audioContext.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.02, this.audioContext.currentTime);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start();

    this.ambientTrack = { oscillator, gainNode };
  }

  stopAmbient() {
    if (this.ambientTrack) {
      this.ambientTrack.oscillator.stop();
      this.ambientTrack = null;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAmbient();
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);

    if (this.ambientTrack) {
      this.ambientTrack.gainNode.gain.setValueAtTime(
        this.masterVolume * 0.02,
        this.audioContext.currentTime
      );
    }
  }

  // Resume audio context (needed after user interaction)
  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

const audioService = new AudioService();

export default audioService;
