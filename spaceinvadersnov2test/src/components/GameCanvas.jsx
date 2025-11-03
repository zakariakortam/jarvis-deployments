import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const {
    gameState,
    player,
    aliens,
    bullets,
    bombs,
    barriers,
    ufo,
    particles,
    updateBullets,
    updateBombs,
    updateAliens,
    updateUFO,
    updateParticles,
    checkCollisions,
  } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let lastTime = 0;
    const gameLoop = (timestamp) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars background
      drawStars(ctx);

      if (gameState === 'playing') {
        // Update game logic
        if (deltaTime < 100) { // Prevent large jumps
          updateBullets();
          updateBombs();
          updateAliens();
          updateUFO();
          updateParticles();
          checkCollisions();
        }
      }

      // Render game entities
      drawPlayer(ctx, player);
      drawAliens(ctx, aliens);
      drawBullets(ctx, bullets);
      drawBombs(ctx, bombs);
      drawBarriers(ctx, barriers);
      if (ufo) drawUFO(ctx, ufo);
      drawParticles(ctx, particles);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, player, aliens, bullets, bombs, barriers, ufo, particles]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas pixelated mx-auto border-4 border-primary/50 rounded-lg shadow-2xl"
      aria-label="Space Invaders game canvas"
    />
  );
}

// Drawing functions
function drawStars(ctx) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 100; i++) {
    const x = (i * 73) % 800;
    const y = (i * 97) % 600;
    const size = (i % 3) * 0.5 + 0.5;
    ctx.fillRect(x, y, size, size);
  }
}

function drawPlayer(ctx, player) {
  ctx.fillStyle = '#00ff00';
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = 10;

  // Draw player ship
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Draw cockpit
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(player.x + player.width / 2 - 5, player.y + 8, 10, 8);

  ctx.shadowBlur = 0;
}

function drawAliens(ctx, aliens) {
  aliens.forEach(alien => {
    ctx.fillStyle = alien.color;
    ctx.shadowColor = alien.color;
    ctx.shadowBlur = 8;

    if (alien.type === 'squid') {
      // Squid alien (top row)
      ctx.fillRect(alien.x + 10, alien.y, 20, 5);
      ctx.fillRect(alien.x + 5, alien.y + 5, 30, 15);
      ctx.fillRect(alien.x, alien.y + 20, 10, 5);
      ctx.fillRect(alien.x + 15, alien.y + 20, 10, 5);
      ctx.fillRect(alien.x + 30, alien.y + 20, 10, 5);
    } else if (alien.type === 'crab') {
      // Crab alien (middle rows)
      ctx.fillRect(alien.x + 5, alien.y, 30, 5);
      ctx.fillRect(alien.x, alien.y + 5, 40, 15);
      ctx.fillRect(alien.x + 5, alien.y + 20, 10, 5);
      ctx.fillRect(alien.x + 25, alien.y + 20, 10, 5);
    } else {
      // Octopus alien (bottom rows)
      ctx.fillRect(alien.x + 10, alien.y, 20, 10);
      ctx.fillRect(alien.x + 5, alien.y + 10, 30, 10);
      ctx.fillRect(alien.x, alien.y + 20, 10, 5);
      ctx.fillRect(alien.x + 15, alien.y + 20, 10, 5);
      ctx.fillRect(alien.x + 30, alien.y + 20, 10, 5);
    }

    ctx.shadowBlur = 0;
  });
}

function drawBullets(ctx, bullets) {
  bullets.forEach(bullet => {
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
  });
}

function drawBombs(ctx, bombs) {
  bombs.forEach(bomb => {
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
    ctx.shadowBlur = 0;
  });
}

function drawBarriers(ctx, barriers) {
  ctx.fillStyle = '#00ff00';
  barriers.forEach(barrier => {
    barrier.blocks.forEach(block => {
      ctx.fillRect(block.x, block.y, block.width, block.height);
    });
  });
}

function drawUFO(ctx, ufo) {
  ctx.fillStyle = '#ff00ff';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 15;

  // UFO body
  ctx.beginPath();
  ctx.ellipse(ufo.x + 25, ufo.y + 12, 25, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // UFO dome
  ctx.beginPath();
  ctx.ellipse(ufo.x + 25, ufo.y + 8, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function drawParticles(ctx, particles) {
  particles.forEach(particle => {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life / 30;
    ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
}
