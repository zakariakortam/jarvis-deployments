import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_STATE = {
  score: 0,
  highScore: 0,
  lives: 3,
  level: 1,
  gameState: 'menu', // 'menu', 'playing', 'paused', 'gameOver'
  difficulty: 'normal', // 'easy', 'normal', 'hard'
  soundEnabled: true,
  musicEnabled: true,
  darkMode: true,
  player: {
    x: 400,
    y: 550,
    width: 40,
    height: 30,
    speed: 5,
  },
  aliens: [],
  bullets: [],
  bombs: [],
  barriers: [],
  ufo: null,
  particles: [],
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Game state actions
      startGame: () => set((state) => ({
        gameState: 'playing',
        score: 0,
        lives: 3,
        level: 1,
        aliens: generateAliens(1),
        barriers: generateBarriers(),
        bullets: [],
        bombs: [],
        ufo: null,
        particles: [],
        player: { ...INITIAL_STATE.player },
      })),

      pauseGame: () => set({ gameState: 'paused' }),

      resumeGame: () => set({ gameState: 'playing' }),

      gameOver: () => set((state) => ({
        gameState: 'gameOver',
        highScore: Math.max(state.score, state.highScore),
      })),

      returnToMenu: () => set({
        gameState: 'menu',
        score: 0,
        lives: 3,
        level: 1,
      }),

      nextLevel: () => set((state) => ({
        level: state.level + 1,
        aliens: generateAliens(state.level + 1),
        barriers: generateBarriers(),
        bullets: [],
        bombs: [],
        ufo: null,
        player: { ...INITIAL_STATE.player },
      })),

      // Player actions
      movePlayer: (direction) => set((state) => {
        const newX = state.player.x + (direction * state.player.speed);
        const clampedX = Math.max(10, Math.min(790 - state.player.width, newX));
        return {
          player: { ...state.player, x: clampedX }
        };
      }),

      fireBullet: () => set((state) => {
        if (state.gameState !== 'playing') return state;
        if (state.bullets.some(b => b.isPlayer)) return state; // Only one player bullet at a time

        return {
          bullets: [...state.bullets, {
            x: state.player.x + state.player.width / 2 - 2,
            y: state.player.y - 10,
            width: 4,
            height: 15,
            speed: 7,
            isPlayer: true,
          }]
        };
      }),

      // Update game entities
      updateBullets: () => set((state) => {
        const updatedBullets = state.bullets
          .map(bullet => ({
            ...bullet,
            y: bullet.y - bullet.speed
          }))
          .filter(bullet => bullet.y > -20);

        return { bullets: updatedBullets };
      }),

      updateBombs: () => set((state) => {
        const updatedBombs = state.bombs
          .map(bomb => ({
            ...bomb,
            y: bomb.y + bomb.speed
          }))
          .filter(bomb => bomb.y < 600);

        return { bombs: updatedBombs };
      }),

      updateAliens: () => set((state) => {
        if (state.aliens.length === 0) return state;

        const speed = 1 + (state.level * 0.3);
        const shouldMoveDown = state.aliens.some(
          alien => alien.x <= 10 || alien.x >= 740
        );

        const direction = state.alienDirection || 1;

        const updatedAliens = state.aliens.map(alien => ({
          ...alien,
          x: shouldMoveDown ? alien.x : alien.x + (direction * speed),
          y: shouldMoveDown ? alien.y + 20 : alien.y,
        }));

        // Random alien shooting
        if (Math.random() < 0.02 * state.level) {
          const shootingAlien = updatedAliens[Math.floor(Math.random() * updatedAliens.length)];
          if (shootingAlien) {
            return {
              aliens: updatedAliens,
              alienDirection: shouldMoveDown ? -direction : direction,
              bombs: [...state.bombs, {
                x: shootingAlien.x + shootingAlien.width / 2 - 2,
                y: shootingAlien.y + shootingAlien.height,
                width: 4,
                height: 12,
                speed: 3 + state.level * 0.5,
              }]
            };
          }
        }

        return {
          aliens: updatedAliens,
          alienDirection: shouldMoveDown ? -direction : direction,
        };
      }),

      updateUFO: () => set((state) => {
        // Spawn UFO randomly
        if (!state.ufo && Math.random() < 0.001) {
          return {
            ufo: {
              x: -60,
              y: 50,
              width: 50,
              height: 25,
              speed: 2,
              points: [50, 100, 150, 200][Math.floor(Math.random() * 4)],
            }
          };
        }

        if (state.ufo) {
          const newX = state.ufo.x + state.ufo.speed;
          if (newX > 800) {
            return { ufo: null };
          }
          return {
            ufo: { ...state.ufo, x: newX }
          };
        }

        return state;
      }),

      updateParticles: () => set((state) => {
        const updatedParticles = state.particles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
          }))
          .filter(particle => particle.life > 0);

        return { particles: updatedParticles };
      }),

      // Collision detection
      checkCollisions: () => set((state) => {
        let newState = { ...state };
        let scoreIncrease = 0;
        let aliensDestroyed = [];
        let bulletsToRemove = [];
        let barriersToUpdate = [...state.barriers];

        // Bullet vs Aliens
        state.bullets.forEach((bullet, bulletIndex) => {
          if (!bullet.isPlayer) return;

          state.aliens.forEach((alien, alienIndex) => {
            if (checkCollision(bullet, alien)) {
              aliensDestroyed.push(alienIndex);
              bulletsToRemove.push(bulletIndex);
              scoreIncrease += alien.points;
              newState.particles = [...newState.particles, ...createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, '#00ff00')];
            }
          });

          // Bullet vs UFO
          if (state.ufo && checkCollision(bullet, state.ufo)) {
            bulletsToRemove.push(bulletIndex);
            scoreIncrease += state.ufo.points;
            newState.ufo = null;
            newState.particles = [...newState.particles, ...createExplosion(state.ufo.x + 25, state.ufo.y + 12, '#ff00ff')];
          }

          // Bullet vs Barriers
          barriersToUpdate.forEach(barrier => {
            barrier.blocks = barrier.blocks.filter(block => {
              if (checkCollision(bullet, block)) {
                bulletsToRemove.push(bulletIndex);
                return false;
              }
              return true;
            });
          });
        });

        // Bombs vs Player
        state.bombs.forEach((bomb, bombIndex) => {
          if (checkCollision(bomb, state.player)) {
            newState.lives = state.lives - 1;
            newState.bombs = state.bombs.filter((_, i) => i !== bombIndex);
            newState.particles = [...newState.particles, ...createExplosion(state.player.x + 20, state.player.y + 15, '#ff0000')];

            if (newState.lives <= 0) {
              newState.gameState = 'gameOver';
              newState.highScore = Math.max(state.score + scoreIncrease, state.highScore);
            }
          }

          // Bombs vs Barriers
          barriersToUpdate.forEach(barrier => {
            barrier.blocks = barrier.blocks.filter(block => {
              if (checkCollision(bomb, block)) {
                newState.bombs = state.bombs.filter((_, i) => i !== bombIndex);
                return false;
              }
              return true;
            });
          });
        });

        // Aliens reaching bottom
        if (state.aliens.some(alien => alien.y >= 520)) {
          newState.gameState = 'gameOver';
          newState.highScore = Math.max(state.score + scoreIncrease, state.highScore);
        }

        // Remove destroyed entities
        newState.aliens = state.aliens.filter((_, i) => !aliensDestroyed.includes(i));
        newState.bullets = state.bullets.filter((_, i) => !bulletsToRemove.includes(i));
        newState.barriers = barriersToUpdate.filter(b => b.blocks.length > 0);
        newState.score = state.score + scoreIncrease;

        // Check for level complete
        if (newState.aliens.length === 0 && newState.gameState === 'playing') {
          setTimeout(() => get().nextLevel(), 1000);
        }

        return newState;
      }),

      // Settings
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: 'space-invaders-storage',
      partialize: (state) => ({
        highScore: state.highScore,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        darkMode: state.darkMode,
        difficulty: state.difficulty,
      }),
    }
  )
);

// Helper functions
function generateAliens(level) {
  const aliens = [];
  const types = [
    { points: 30, color: '#ff00ff', rows: 1 },
    { points: 20, color: '#00ffff', rows: 2 },
    { points: 10, color: '#00ff00', rows: 2 },
  ];

  let yOffset = 80;
  types.forEach(type => {
    for (let row = 0; row < type.rows; row++) {
      for (let col = 0; col < 11; col++) {
        aliens.push({
          x: 50 + col * 60,
          y: yOffset + row * 50,
          width: 40,
          height: 30,
          color: type.color,
          points: type.points,
          type: type.points === 30 ? 'squid' : type.points === 20 ? 'crab' : 'octopus',
        });
      }
    }
    yOffset += type.rows * 50;
  });

  return aliens;
}

function generateBarriers() {
  const barriers = [];
  const barrierPositions = [100, 250, 400, 550];

  barrierPositions.forEach(x => {
    const blocks = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        // Create barrier shape (rounded top)
        if (row === 0 && (col < 2 || col > 7)) continue;
        if (row === 3 && col >= 4 && col <= 5) continue; // Bottom gap

        blocks.push({
          x: x + col * 6,
          y: 480 + row * 6,
          width: 6,
          height: 6,
        });
      }
    }
    barriers.push({ blocks });
  });

  return barriers;
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function createExplosion(x, y, color) {
  const particles = [];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * 3,
      vy: Math.sin(angle) * 3,
      life: 30,
      color,
      size: 3,
    });
  }
  return particles;
}
