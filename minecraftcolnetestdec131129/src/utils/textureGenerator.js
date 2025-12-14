import * as THREE from 'three';
import { BLOCK_TYPES } from './constants';

// Texture size (16x16 pixels like classic Minecraft)
const TEXTURE_SIZE = 16;
const ATLAS_SIZE = 8; // 8x8 grid of textures = 64 texture slots

// Seeded random number generator for consistent textures
class SeededRandom {
  constructor(seed = 12345) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min, max) {
    return this.next() * (max - min) + min;
  }

  reset(seed) {
    this.seed = seed;
  }
}

const rng = new SeededRandom(42);

// Color utilities
function hexToRgba(hex, alpha = 255) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, alpha];
}

function blendColors(c1, c2, factor) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * factor),
    Math.round(c1[1] + (c2[1] - c1[1]) * factor),
    Math.round(c1[2] + (c2[2] - c1[2]) * factor),
    Math.round(c1[3] + (c2[3] - c1[3]) * factor)
  ];
}

function varyColor(color, variance) {
  return [
    Math.max(0, Math.min(255, color[0] + rng.nextInt(-variance, variance))),
    Math.max(0, Math.min(255, color[1] + rng.nextInt(-variance, variance))),
    Math.max(0, Math.min(255, color[2] + rng.nextInt(-variance, variance))),
    color[3]
  ];
}

function darkenColor(color, factor) {
  return [
    Math.round(color[0] * factor),
    Math.round(color[1] * factor),
    Math.round(color[2] * factor),
    color[3]
  ];
}

function lightenColor(color, factor) {
  return [
    Math.min(255, Math.round(color[0] * factor)),
    Math.min(255, Math.round(color[1] * factor)),
    Math.min(255, Math.round(color[2] * factor)),
    color[3]
  ];
}

// Set pixel in image data
function setPixel(data, x, y, color, size = TEXTURE_SIZE) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  data[i] = color[0];
  data[i + 1] = color[1];
  data[i + 2] = color[2];
  data[i + 3] = color[3];
}

// Get pixel from image data
function getPixel(data, x, y, size = TEXTURE_SIZE) {
  if (x < 0 || x >= size || y < 0 || y >= size) return [0, 0, 0, 0];
  const i = (y * size + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

// Fill rectangle
function fillRect(data, x, y, w, h, color, size = TEXTURE_SIZE) {
  for (let py = y; py < y + h && py < size; py++) {
    for (let px = x; px < x + w && px < size; px++) {
      if (px >= 0 && py >= 0) {
        setPixel(data, px, py, color, size);
      }
    }
  }
}

// Generate noise pattern
function generateNoise(data, baseColor, variance, size = TEXTURE_SIZE) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(data, x, y, varyColor(baseColor, variance), size);
    }
  }
}

// Perlin-like noise for better texture patterns
function noise2D(x, y, scale = 1) {
  const xi = Math.floor(x * scale);
  const yi = Math.floor(y * scale);
  const xf = (x * scale) - xi;
  const yf = (y * scale) - yi;

  // Simple hash function
  const hash = (x, y) => {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) / 4294967296 + 0.5;
  };

  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

// Generate grass top texture - lush and detailed
function generateGrassTop(data) {
  const colors = {
    darkGreen: [67, 124, 42, 255],
    baseGreen: [89, 148, 56, 255],
    lightGreen: [118, 172, 78, 255],
    highlight: [142, 189, 102, 255],
    shadow: [52, 98, 32, 255]
  };

  // Base layer with noise
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.3);
      let color;
      if (n < 0.25) {
        color = colors.shadow;
      } else if (n < 0.45) {
        color = colors.darkGreen;
      } else if (n < 0.7) {
        color = colors.baseGreen;
      } else if (n < 0.9) {
        color = colors.lightGreen;
      } else {
        color = colors.highlight;
      }
      setPixel(data, x, y, varyColor(color, 6));
    }
  }

  // Add grass blade details
  for (let i = 0; i < 20; i++) {
    const x = rng.nextInt(0, 15);
    const y = rng.nextInt(0, 15);
    const isLight = rng.next() > 0.4;
    setPixel(data, x, y, isLight ? colors.highlight : colors.shadow);
  }

  // Small flower/clover details
  for (let i = 0; i < 3; i++) {
    const x = rng.nextInt(1, 14);
    const y = rng.nextInt(1, 14);
    if (rng.next() > 0.5) {
      setPixel(data, x, y, [145, 190, 90, 255]); // Yellow-green clover
    }
  }
}

// Generate grass side texture - grass on top, dirt below
function generateGrassSide(data) {
  const grassColors = {
    darkGreen: [67, 124, 42, 255],
    baseGreen: [89, 148, 56, 255],
    lightGreen: [118, 172, 78, 255]
  };

  const dirtColors = {
    dark: [96, 68, 47, 255],
    base: [121, 85, 58, 255],
    light: [145, 105, 75, 255],
    stone: [85, 75, 65, 255]
  };

  // Dirt base first
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.4);
      let color;
      if (n < 0.2) {
        color = dirtColors.stone;
      } else if (n < 0.4) {
        color = dirtColors.dark;
      } else if (n < 0.75) {
        color = dirtColors.base;
      } else {
        color = dirtColors.light;
      }
      setPixel(data, x, y, varyColor(color, 10));
    }
  }

  // Add pebbles
  for (let i = 0; i < 6; i++) {
    const x = rng.nextInt(0, 15);
    const y = rng.nextInt(4, 15);
    setPixel(data, x, y, varyColor(dirtColors.stone, 8));
  }

  // Grass top edge - irregular hanging grass (y=0 is TOP of texture)
  // The grass should be at y=0,1,2,3 (top of the side face)
  for (let x = 0; x < TEXTURE_SIZE; x++) {
    // Random grass depth at each column
    const grassDepth = rng.nextInt(2, 5);

    for (let y = 0; y < grassDepth; y++) {
      const n = rng.next();
      let color;
      if (n < 0.3) {
        color = grassColors.darkGreen;
      } else if (n < 0.7) {
        color = grassColors.baseGreen;
      } else {
        color = grassColors.lightGreen;
      }
      setPixel(data, x, y, varyColor(color, 8));
    }

    // Hanging grass blades below the main grass layer
    if (rng.next() > 0.4) {
      const hangY = grassDepth;
      if (hangY < 8) {
        setPixel(data, x, hangY, varyColor(grassColors.darkGreen, 10));
        if (rng.next() > 0.6 && hangY + 1 < 10) {
          setPixel(data, x, hangY + 1, varyColor(grassColors.darkGreen, 12));
        }
      }
    }
  }
}

// Generate dirt texture
function generateDirt(data) {
  const colors = {
    dark: [96, 68, 47, 255],
    base: [121, 85, 58, 255],
    light: [145, 105, 75, 255],
    stone: [85, 75, 65, 255],
    root: [75, 55, 40, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.35);
      let color;
      if (n < 0.15) {
        color = colors.stone;
      } else if (n < 0.35) {
        color = colors.dark;
      } else if (n < 0.7) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 12));
    }
  }

  // Add small pebbles and roots
  for (let i = 0; i < 8; i++) {
    const x = rng.nextInt(0, 15);
    const y = rng.nextInt(0, 15);
    const isPebble = rng.next() > 0.4;
    setPixel(data, x, y, isPebble ? varyColor(colors.stone, 10) : varyColor(colors.root, 8));
  }
}

// Generate stone texture
function generateStone(data) {
  const colors = {
    dark: [90, 90, 90, 255],
    base: [118, 118, 118, 255],
    light: [142, 142, 142, 255],
    highlight: [160, 160, 160, 255],
    crack: [65, 65, 65, 255]
  };

  // Base stone noise
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.3);
      const n2 = noise2D(x + 100, y + 100, 0.5);
      const combined = (n + n2) / 2;

      let color;
      if (combined < 0.25) {
        color = colors.dark;
      } else if (combined < 0.5) {
        color = colors.base;
      } else if (combined < 0.8) {
        color = colors.light;
      } else {
        color = colors.highlight;
      }
      setPixel(data, x, y, varyColor(color, 10));
    }
  }

  // Add crack details
  for (let i = 0; i < 5; i++) {
    let x = rng.nextInt(0, 15);
    let y = rng.nextInt(0, 15);
    const length = rng.nextInt(3, 7);
    for (let j = 0; j < length; j++) {
      setPixel(data, x, y, varyColor(colors.crack, 8));
      x += rng.nextInt(-1, 1);
      y += rng.nextInt(0, 1);
      if (x < 0 || x > 15 || y < 0 || y > 15) break;
    }
  }
}

// Generate cobblestone texture
function generateCobblestone(data) {
  const colors = {
    dark: [75, 75, 75, 255],
    base: [105, 105, 105, 255],
    light: [135, 135, 135, 255],
    mortar: [60, 60, 60, 255]
  };

  // Fill with mortar color
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      setPixel(data, x, y, varyColor(colors.mortar, 8));
    }
  }

  // Draw irregular stones
  const stones = [
    { x: 0, y: 0, w: 5, h: 4 },
    { x: 6, y: 0, w: 6, h: 5 },
    { x: 13, y: 0, w: 3, h: 4 },
    { x: 0, y: 5, w: 4, h: 5 },
    { x: 5, y: 4, w: 7, h: 5 },
    { x: 13, y: 5, w: 3, h: 5 },
    { x: 0, y: 11, w: 6, h: 5 },
    { x: 7, y: 10, w: 5, h: 6 },
    { x: 13, y: 11, w: 3, h: 5 },
  ];

  for (const stone of stones) {
    const stoneColor = rng.next() > 0.5 ? colors.light : colors.base;
    for (let py = stone.y; py < stone.y + stone.h - 1 && py < 16; py++) {
      for (let px = stone.x; px < stone.x + stone.w - 1 && px < 16; px++) {
        setPixel(data, px, py, varyColor(stoneColor, 15));
      }
    }
    // Add highlight to top-left
    if (stone.x < 15 && stone.y < 15) {
      setPixel(data, stone.x, stone.y, varyColor(colors.light, 8));
    }
    // Add shadow to bottom-right
    for (let px = stone.x; px < stone.x + stone.w && px < 16; px++) {
      const sy = stone.y + stone.h - 1;
      if (sy < 16) setPixel(data, px, sy, varyColor(colors.dark, 10));
    }
    for (let py = stone.y; py < stone.y + stone.h && py < 16; py++) {
      const sx = stone.x + stone.w - 1;
      if (sx < 16) setPixel(data, sx, py, varyColor(colors.dark, 10));
    }
  }
}

// Generate sand texture
function generateSand(data) {
  const colors = {
    dark: [194, 178, 128, 255],
    base: [219, 205, 155, 255],
    light: [238, 226, 180, 255],
    speck: [168, 152, 108, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.5);
      let color;
      if (n < 0.2) {
        color = colors.speck;
      } else if (n < 0.4) {
        color = colors.dark;
      } else if (n < 0.8) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 8));
    }
  }

  // Add darker specks
  for (let i = 0; i < 12; i++) {
    const x = rng.nextInt(0, 15);
    const y = rng.nextInt(0, 15);
    setPixel(data, x, y, varyColor(colors.speck, 10));
  }
}

// Generate wood log side texture
function generateLogSide(data) {
  const colors = {
    dark: [58, 42, 28, 255],
    base: [78, 58, 38, 255],
    light: [98, 75, 52, 255],
    highlight: [115, 90, 65, 255]
  };

  // Vertical bark pattern
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      // Create vertical ridges
      const ridge = Math.sin(x * 0.9) * 0.5 + 0.5;
      const n = noise2D(x, y, 0.2);
      const combined = ridge * 0.7 + n * 0.3;

      let color;
      if (combined < 0.25) {
        color = colors.dark;
      } else if (combined < 0.5) {
        color = colors.base;
      } else if (combined < 0.75) {
        color = colors.light;
      } else {
        color = colors.highlight;
      }
      setPixel(data, x, y, varyColor(color, 8));
    }
  }

  // Add horizontal crack details
  for (let i = 0; i < 4; i++) {
    const y = rng.nextInt(1, 14);
    const startX = rng.nextInt(0, 5);
    const length = rng.nextInt(6, 12);
    for (let x = startX; x < startX + length && x < 16; x++) {
      if (rng.next() > 0.2) {
        setPixel(data, x, y, varyColor(colors.dark, 10));
      }
    }
  }
}

// Generate wood log top texture (rings)
function generateLogTop(data) {
  const colors = {
    bark: [58, 42, 28, 255],
    darkRing: [142, 108, 68, 255],
    lightRing: [178, 142, 95, 255],
    center: [195, 162, 115, 255]
  };

  const centerX = 7.5;
  const centerY = 7.5;

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Bark edge
      if (dist > 6.8) {
        setPixel(data, x, y, varyColor(colors.bark, 10));
        continue;
      }

      // Wood rings with noise
      const ringValue = (dist * 1.8 + noise2D(x, y, 0.3) * 2) % 3;
      let color;
      if (dist < 1.2) {
        color = colors.center;
      } else if (ringValue < 1.5) {
        color = colors.lightRing;
      } else {
        color = colors.darkRing;
      }

      setPixel(data, x, y, varyColor(color, 6));
    }
  }
}

// Generate planks texture
function generatePlanks(data) {
  const colors = {
    dark: [148, 115, 68, 255],
    base: [175, 140, 90, 255],
    light: [198, 165, 115, 255],
    grain: [135, 102, 58, 255]
  };

  // Draw 4 horizontal planks
  for (let plank = 0; plank < 4; plank++) {
    const py = plank * 4;
    const plankTone = rng.next() > 0.5 ? 0.1 : -0.1;

    for (let y = py; y < py + 4; y++) {
      for (let x = 0; x < TEXTURE_SIZE; x++) {
        // Wood grain
        const grain = Math.sin(x * 0.5 + plank * 2) * 0.15;
        const n = noise2D(x, y, 0.3) * 0.15;
        const factor = 0.5 + grain + n + plankTone;

        let color;
        if (factor < 0.35) {
          color = colors.dark;
        } else if (factor < 0.55) {
          color = colors.base;
        } else {
          color = colors.light;
        }
        setPixel(data, x, y, varyColor(color, 6));
      }
    }

    // Gap between planks
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      if (py + 3 < 16) {
        setPixel(data, x, py + 3, varyColor(colors.grain, 8));
      }
    }

    // Nail hole
    const nailX = rng.nextInt(2, 6) + plank * 4;
    if (nailX < 16 && py + 1 < 16) {
      setPixel(data, nailX, py + 1, darkenColor(colors.dark, 0.6));
    }
  }
}

// Generate leaves texture
function generateLeaves(data) {
  const colors = {
    dark: [35, 78, 28, 255],
    base: [52, 108, 42, 255],
    light: [72, 135, 58, 255],
    highlight: [95, 158, 78, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.4);

      // Create leaf gaps (transparent)
      if (n < 0.12) {
        setPixel(data, x, y, [0, 0, 0, 0]);
        continue;
      }

      let color;
      if (n < 0.3) {
        color = colors.dark;
      } else if (n < 0.55) {
        color = colors.base;
      } else if (n < 0.8) {
        color = colors.light;
      } else {
        color = colors.highlight;
      }
      setPixel(data, x, y, varyColor(color, 10));
    }
  }
}

// Generate brick texture
function generateBrick(data) {
  const colors = {
    brick: [156, 82, 66, 255],
    brickDark: [128, 62, 48, 255],
    brickLight: [182, 105, 85, 255],
    mortar: [175, 168, 158, 255]
  };

  // Fill with mortar
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      setPixel(data, x, y, varyColor(colors.mortar, 8));
    }
  }

  // Draw bricks (staggered pattern)
  const brickPatterns = [
    // Row 1 (offset)
    { x: -3, y: 0, w: 7, h: 3 },
    { x: 5, y: 0, w: 7, h: 3 },
    { x: 13, y: 0, w: 7, h: 3 },
    // Row 2
    { x: 0, y: 4, w: 7, h: 3 },
    { x: 8, y: 4, w: 7, h: 3 },
    // Row 3 (offset)
    { x: -3, y: 8, w: 7, h: 3 },
    { x: 5, y: 8, w: 7, h: 3 },
    { x: 13, y: 8, w: 7, h: 3 },
    // Row 4
    { x: 0, y: 12, w: 7, h: 3 },
    { x: 8, y: 12, w: 7, h: 3 },
  ];

  for (const brick of brickPatterns) {
    const n = rng.next();
    const brickColor = n < 0.25 ? colors.brickDark : (n < 0.8 ? colors.brick : colors.brickLight);

    for (let y = brick.y; y < brick.y + brick.h && y < 16; y++) {
      for (let x = Math.max(0, brick.x); x < brick.x + brick.w && x < 16; x++) {
        setPixel(data, x, y, varyColor(brickColor, 10));
      }
    }

    // Add texture variation
    const cx = Math.max(0, brick.x + 2);
    const cy = brick.y + 1;
    if (cx < 16 && cy < 16) {
      setPixel(data, cx, cy, varyColor(colors.brickLight, 8));
    }
  }
}

// Generate water texture - much improved with wave patterns
function generateWater(data) {
  const colors = {
    deep: [22, 58, 128, 160],
    base: [38, 85, 168, 150],
    light: [58, 115, 192, 140],
    highlight: [95, 155, 215, 130],
    foam: [175, 205, 235, 180],
    sparkle: [220, 240, 255, 200]
  };

  // Multi-layered wave pattern
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      // Multiple wave layers for depth
      const wave1 = Math.sin(x * 0.4 + y * 0.2) * 0.3;
      const wave2 = Math.sin(x * 0.2 - y * 0.35) * 0.25;
      const wave3 = Math.sin((x + y) * 0.3) * 0.2;
      const n = noise2D(x, y, 0.25) * 0.25;

      const combined = 0.5 + wave1 + wave2 + wave3 + n;

      let color;
      if (combined < 0.35) {
        color = colors.deep;
      } else if (combined < 0.5) {
        color = colors.base;
      } else if (combined < 0.7) {
        color = colors.light;
      } else if (combined < 0.85) {
        color = colors.highlight;
      } else {
        color = colors.foam;
      }
      setPixel(data, x, y, varyColor(color, 5));
    }
  }

  // Add sparkles/light reflections
  for (let i = 0; i < 6; i++) {
    const x = rng.nextInt(0, 15);
    const y = rng.nextInt(0, 15);
    setPixel(data, x, y, colors.sparkle);
  }
}

// Generate glass texture
function generateGlass(data) {
  const colors = {
    base: [195, 220, 240, 85],
    edge: [145, 180, 210, 140],
    highlight: [255, 255, 255, 160],
    reflection: [220, 235, 250, 100]
  };

  // Fill with transparent glass
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      // Subtle gradient for depth
      const grad = (x + y) / 32 * 0.3;
      const color = blendColors(colors.base, colors.reflection, grad);
      setPixel(data, x, y, color);
    }
  }

  // Add frame/edge
  for (let i = 0; i < TEXTURE_SIZE; i++) {
    setPixel(data, i, 0, colors.edge);
    setPixel(data, i, 15, colors.edge);
    setPixel(data, 0, i, colors.edge);
    setPixel(data, 15, i, colors.edge);
  }

  // Highlight reflection streak
  for (let i = 1; i < 5; i++) {
    setPixel(data, i, 1, colors.highlight);
    setPixel(data, i + 1, 2, blendColors(colors.highlight, colors.base, 0.5));
  }

  // Secondary reflection
  setPixel(data, 12, 3, blendColors(colors.highlight, colors.base, 0.3));
  setPixel(data, 13, 4, blendColors(colors.highlight, colors.base, 0.5));
}

// Generate ore texture (stone with ore spots)
function generateOre(data, oreColor, spotCount = 8, brightness = 1) {
  // Start with stone base
  generateStone(data);

  const darkOre = darkenColor(oreColor, 0.7);
  const lightOre = lightenColor(oreColor, brightness);

  // Add ore spots in clusters
  for (let i = 0; i < spotCount; i++) {
    const cx = rng.nextInt(2, 13);
    const cy = rng.nextInt(2, 13);
    const size = rng.nextInt(1, 2);

    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < 16 && y >= 0 && y < 16) {
          if (Math.abs(dx) + Math.abs(dy) <= size + (rng.next() > 0.5 ? 1 : 0)) {
            const isEdge = Math.abs(dx) === size || Math.abs(dy) === size;
            const color = isEdge ? darkOre : (rng.next() > 0.3 ? oreColor : lightOre);
            setPixel(data, x, y, varyColor(color, 12));
          }
        }
      }
    }
  }
}

// Generate snow texture
function generateSnow(data) {
  const colors = {
    shadow: [210, 225, 235, 255],
    base: [235, 245, 250, 255],
    bright: [250, 252, 255, 255],
    sparkle: [255, 255, 255, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.3);
      let color;
      if (n < 0.2) {
        color = colors.shadow;
      } else if (n < 0.7) {
        color = colors.base;
      } else if (n < 0.95) {
        color = colors.bright;
      } else {
        color = colors.sparkle;
      }
      setPixel(data, x, y, varyColor(color, 3));
    }
  }
}

// Generate ice texture
function generateIce(data) {
  const colors = {
    dark: [125, 175, 220, 210],
    base: [155, 200, 240, 200],
    light: [185, 220, 250, 190],
    crack: [255, 255, 255, 220]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.35);
      let color;
      if (n < 0.3) {
        color = colors.dark;
      } else if (n < 0.7) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 6));
    }
  }

  // Add cracks
  for (let i = 0; i < 4; i++) {
    let x = rng.nextInt(0, 15);
    let y = rng.nextInt(0, 15);
    for (let j = 0; j < 6; j++) {
      setPixel(data, x, y, colors.crack);
      x += rng.nextInt(-1, 1);
      y += rng.nextInt(-1, 1);
      if (x < 0 || x > 15 || y < 0 || y > 15) break;
    }
  }
}

// Generate bedrock texture
function generateBedrock(data) {
  const colors = {
    dark: [22, 22, 22, 255],
    base: [48, 48, 48, 255],
    light: [72, 72, 72, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.4);
      const n2 = noise2D(x + 50, y + 50, 0.6);
      const combined = (n + n2) / 2;

      let color;
      if (combined < 0.35) {
        color = colors.dark;
      } else if (combined < 0.7) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 12));
    }
  }
}

// Generate lava texture
function generateLava(data) {
  const colors = {
    crust: [85, 25, 5, 255],
    dark: [185, 55, 0, 255],
    base: [235, 95, 15, 255],
    bright: [255, 165, 45, 255],
    hot: [255, 225, 125, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const flow1 = Math.sin(x * 0.35 + y * 0.25) * 0.3;
      const flow2 = Math.sin(x * 0.2 - y * 0.4) * 0.2;
      const n = noise2D(x, y, 0.3) * 0.3;
      const combined = 0.5 + flow1 + flow2 + n;

      let color;
      if (combined < 0.25) {
        color = colors.crust;
      } else if (combined < 0.4) {
        color = colors.dark;
      } else if (combined < 0.65) {
        color = colors.base;
      } else if (combined < 0.85) {
        color = colors.bright;
      } else {
        color = colors.hot;
      }
      setPixel(data, x, y, varyColor(color, 12));
    }
  }
}

// Generate glowstone texture
function generateGlowstone(data) {
  const colors = {
    dark: [185, 145, 65, 255],
    base: [225, 185, 95, 255],
    bright: [255, 218, 135, 255],
    hot: [255, 245, 195, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.35);
      let color;
      if (n < 0.2) {
        color = colors.dark;
      } else if (n < 0.55) {
        color = colors.base;
      } else if (n < 0.85) {
        color = colors.bright;
      } else {
        color = colors.hot;
      }
      setPixel(data, x, y, varyColor(color, 10));
    }
  }

  // Add crack pattern
  for (let i = 0; i < 5; i++) {
    let x = rng.nextInt(0, 15);
    let y = rng.nextInt(0, 15);
    for (let j = 0; j < 4; j++) {
      setPixel(data, x, y, varyColor(colors.dark, 10));
      x += rng.nextInt(-1, 1);
      y += rng.nextInt(-1, 1);
      if (x < 0 || x > 15 || y < 0 || y > 15) break;
    }
  }
}

// Generate TNT texture
function generateTNT(data) {
  const colors = {
    red: [215, 55, 45, 255],
    darkRed: [165, 35, 28, 255],
    white: [245, 242, 238, 255],
    black: [25, 25, 25, 255]
  };

  // Red stripes base
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const stripe = Math.floor(y / 4) % 2 === 0;
      const color = stripe ? colors.red : colors.darkRed;
      setPixel(data, x, y, varyColor(color, 8));
    }
  }

  // White band in middle
  for (let y = 5; y < 11; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      setPixel(data, x, y, varyColor(colors.white, 4));
    }
  }

  // TNT letters
  const tntPattern = [
    // T
    [2, 6], [3, 6], [4, 6], [3, 7], [3, 8], [3, 9],
    // N
    [6, 6], [6, 7], [6, 8], [6, 9], [7, 7], [8, 8], [9, 6], [9, 7], [9, 8], [9, 9],
    // T
    [11, 6], [12, 6], [13, 6], [12, 7], [12, 8], [12, 9],
  ];

  for (const [x, y] of tntPattern) {
    if (x < 16 && y < 16) {
      setPixel(data, x, y, colors.black);
    }
  }
}

// Generate obsidian texture
function generateObsidian(data) {
  const colors = {
    dark: [12, 5, 22, 255],
    base: [28, 12, 48, 255],
    purple: [48, 22, 75, 255],
    highlight: [65, 35, 95, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.4);
      let color;
      if (n < 0.3) {
        color = colors.dark;
      } else if (n < 0.6) {
        color = colors.base;
      } else if (n < 0.9) {
        color = colors.purple;
      } else {
        color = colors.highlight;
      }
      setPixel(data, x, y, varyColor(color, 6));
    }
  }
}

// Generate gravel texture
function generateGravel(data) {
  const colors = {
    dark: [95, 85, 82, 255],
    base: [128, 118, 115, 255],
    light: [155, 145, 142, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.5);
      let color;
      if (n < 0.3) {
        color = colors.dark;
      } else if (n < 0.7) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 15));
    }
  }

  // Add pebble shapes
  for (let i = 0; i < 10; i++) {
    const cx = rng.nextInt(1, 14);
    const cy = rng.nextInt(1, 14);
    const pebbleColor = rng.next() > 0.5 ? colors.dark : colors.light;
    setPixel(data, cx, cy, varyColor(pebbleColor, 12));
    if (rng.next() > 0.5) {
      setPixel(data, cx + 1, cy, varyColor(pebbleColor, 12));
    }
  }
}

// Generate clay texture
function generateClay(data) {
  const colors = {
    dark: [138, 144, 155, 255],
    base: [158, 165, 178, 255],
    light: [175, 182, 195, 255]
  };

  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const n = noise2D(x, y, 0.35);
      let color;
      if (n < 0.3) {
        color = colors.dark;
      } else if (n < 0.75) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 6));
    }
  }
}

// Generate cactus side texture
function generateCactusSide(data) {
  const colors = {
    dark: [18, 75, 22, 255],
    base: [32, 105, 38, 255],
    light: [48, 128, 55, 255],
    spine: [195, 195, 175, 255]
  };

  // Base green with vertical stripes
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const stripe = Math.sin(x * 0.8) * 0.3 + 0.5;
      let color;
      if (stripe < 0.35) {
        color = colors.dark;
      } else if (stripe < 0.65) {
        color = colors.base;
      } else {
        color = colors.light;
      }
      setPixel(data, x, y, varyColor(color, 6));
    }
  }

  // Add spines
  const spinePositions = [
    [3, 2], [12, 3], [6, 6], [10, 8], [2, 10], [14, 11], [7, 13], [4, 15]
  ];

  for (const [x, y] of spinePositions) {
    if (x < 16 && y < 16) {
      setPixel(data, x, y, colors.spine);
      // Spine shadow
      if (x + 1 < 16) setPixel(data, x + 1, y, varyColor(colors.dark, 8));
    }
  }
}

// Generate crafting table top texture
function generateCraftingTableTop(data) {
  const colors = {
    wood: [175, 140, 90, 255],
    woodDark: [145, 112, 68, 255],
    grid: [72, 55, 38, 255]
  };

  // Wood base
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const grain = Math.sin(x * 0.6 + y * 0.15) * 0.2;
      const color = blendColors(colors.wood, colors.woodDark, grain + 0.3);
      setPixel(data, x, y, varyColor(color, 8));
    }
  }

  // Draw 3x3 grid
  for (let i = 0; i < TEXTURE_SIZE; i++) {
    setPixel(data, 5, i, colors.grid);
    setPixel(data, 10, i, colors.grid);
    setPixel(data, i, 5, colors.grid);
    setPixel(data, i, 10, colors.grid);
  }

  // Border
  for (let i = 0; i < TEXTURE_SIZE; i++) {
    setPixel(data, i, 0, colors.grid);
    setPixel(data, i, 15, colors.grid);
    setPixel(data, 0, i, colors.grid);
    setPixel(data, 15, i, colors.grid);
  }
}

// Generate furnace front texture
function generateFurnaceFront(data) {
  const colors = {
    stone: [118, 118, 118, 255],
    stoneDark: [88, 88, 88, 255],
    black: [22, 22, 22, 255],
    fire: [255, 145, 45, 255],
    fireHot: [255, 225, 125, 255]
  };

  // Stone base
  generateStone(data);

  // Furnace opening
  for (let y = 4; y < 12; y++) {
    for (let x = 4; x < 12; x++) {
      setPixel(data, x, y, colors.black);
    }
  }

  // Grate bars
  for (let x = 5; x < 11; x += 2) {
    for (let y = 4; y < 12; y++) {
      setPixel(data, x, y, colors.stoneDark);
    }
  }

  // Fire glow
  for (let y = 7; y < 12; y++) {
    for (let x = 5; x < 11; x++) {
      if ((x + y) % 2 === 0) {
        const isHot = rng.next() > 0.5;
        setPixel(data, x, y, isHot ? colors.fireHot : colors.fire);
      }
    }
  }

  // Frame
  for (let x = 3; x < 13; x++) {
    setPixel(data, x, 3, colors.stoneDark);
    setPixel(data, x, 12, colors.stoneDark);
  }
  for (let y = 3; y < 13; y++) {
    setPixel(data, 3, y, colors.stoneDark);
    setPixel(data, 12, y, colors.stoneDark);
  }
}

// Generate chest front texture
function generateChestFront(data) {
  const colors = {
    wood: [135, 95, 38, 255],
    woodDark: [105, 72, 28, 255],
    woodLight: [165, 125, 58, 255],
    metal: [75, 75, 85, 255],
    metalBright: [115, 115, 125, 255]
  };

  // Wood base with grain
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    for (let x = 0; x < TEXTURE_SIZE; x++) {
      const grain = Math.sin(y * 0.25) * 0.2;
      const color = blendColors(colors.wood, colors.woodDark, grain + 0.25);
      setPixel(data, x, y, varyColor(color, 6));
    }
  }

  // Top rim
  for (let x = 0; x < TEXTURE_SIZE; x++) {
    setPixel(data, x, 0, colors.woodLight);
    setPixel(data, x, 1, colors.woodDark);
  }

  // Metal latch
  for (let y = 5; y < 10; y++) {
    for (let x = 6; x < 10; x++) {
      setPixel(data, x, y, colors.metal);
    }
  }
  setPixel(data, 7, 7, colors.metalBright);
  setPixel(data, 8, 7, colors.metalBright);

  // Bottom edge
  for (let x = 0; x < TEXTURE_SIZE; x++) {
    setPixel(data, x, 15, colors.woodDark);
  }

  // Side edges
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    setPixel(data, 0, y, colors.woodDark);
    setPixel(data, 15, y, colors.woodDark);
  }
}

// Texture generation mapping
const textureGenerators = {
  [BLOCK_TYPES.GRASS]: {
    top: generateGrassTop,
    side: generateGrassSide,
    bottom: generateDirt
  },
  [BLOCK_TYPES.DIRT]: { all: generateDirt },
  [BLOCK_TYPES.STONE]: { all: generateStone },
  [BLOCK_TYPES.COBBLESTONE]: { all: generateCobblestone },
  [BLOCK_TYPES.SAND]: { all: generateSand },
  [BLOCK_TYPES.LOG]: {
    top: generateLogTop,
    side: generateLogSide,
    bottom: generateLogTop
  },
  [BLOCK_TYPES.WOOD]: {
    top: generateLogTop,
    side: generateLogSide,
    bottom: generateLogTop
  },
  [BLOCK_TYPES.PLANKS]: { all: generatePlanks },
  [BLOCK_TYPES.LEAVES]: { all: generateLeaves },
  [BLOCK_TYPES.BRICK]: { all: generateBrick },
  [BLOCK_TYPES.WATER]: { all: generateWater },
  [BLOCK_TYPES.GLASS]: { all: generateGlass },
  [BLOCK_TYPES.SNOW]: { all: generateSnow },
  [BLOCK_TYPES.ICE]: { all: generateIce },
  [BLOCK_TYPES.BEDROCK]: { all: generateBedrock },
  [BLOCK_TYPES.LAVA]: { all: generateLava },
  [BLOCK_TYPES.GLOWSTONE]: { all: generateGlowstone },
  [BLOCK_TYPES.TNT]: { all: generateTNT },
  [BLOCK_TYPES.OBSIDIAN]: { all: generateObsidian },
  [BLOCK_TYPES.GRAVEL]: { all: generateGravel },
  [BLOCK_TYPES.CLAY]: { all: generateClay },
  [BLOCK_TYPES.CACTUS]: { all: generateCactusSide },
  [BLOCK_TYPES.COAL_ORE]: {
    all: (data) => generateOre(data, [38, 38, 38, 255], 10, 1.2)
  },
  [BLOCK_TYPES.IRON_ORE]: {
    all: (data) => generateOre(data, [205, 175, 155, 255], 8, 1.1)
  },
  [BLOCK_TYPES.GOLD_ORE]: {
    all: (data) => generateOre(data, [245, 225, 75, 255], 7, 1.15)
  },
  [BLOCK_TYPES.DIAMOND_ORE]: {
    all: (data) => generateOre(data, [85, 215, 210, 255], 6, 1.2)
  },
  [BLOCK_TYPES.CRAFTING_TABLE]: {
    top: generateCraftingTableTop,
    side: generatePlanks,
    bottom: generatePlanks
  },
  [BLOCK_TYPES.FURNACE]: {
    top: generateStone,
    front: generateFurnaceFront,
    side: generateStone,
    bottom: generateStone
  },
  [BLOCK_TYPES.CHEST]: {
    top: generatePlanks,
    front: generateChestFront,
    side: (data) => {
      const baseWood = [135, 95, 38, 255];
      generateNoise(data, baseWood, 12);
    },
    bottom: generatePlanks
  }
};

// Create a single texture
function createTexture(generator) {
  const canvas = document.createElement('canvas');
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);

  rng.reset(42); // Reset for consistent textures
  generator(imageData.data);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Create texture atlas
export function createTextureAtlas() {
  const atlasSize = ATLAS_SIZE * TEXTURE_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = atlasSize;
  canvas.height = atlasSize;
  const ctx = canvas.getContext('2d');

  // Fill with magenta (debug color for missing textures)
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(0, 0, atlasSize, atlasSize);

  const textureMap = new Map(); // Maps block type + face to UV coordinates
  let textureIndex = 0;

  // Generate all textures
  for (const [blockTypeStr, generators] of Object.entries(textureGenerators)) {
    const blockType = parseInt(blockTypeStr);

    if (generators.all) {
      // Single texture for all faces
      const texture = createTexture(generators.all);
      const x = (textureIndex % ATLAS_SIZE) * TEXTURE_SIZE;
      const y = Math.floor(textureIndex / ATLAS_SIZE) * TEXTURE_SIZE;
      ctx.drawImage(texture, x, y);

      const uv = {
        u: textureIndex % ATLAS_SIZE,
        v: Math.floor(textureIndex / ATLAS_SIZE)
      };
      textureMap.set(`${blockType}_top`, uv);
      textureMap.set(`${blockType}_bottom`, uv);
      textureMap.set(`${blockType}_front`, uv);
      textureMap.set(`${blockType}_back`, uv);
      textureMap.set(`${blockType}_left`, uv);
      textureMap.set(`${blockType}_right`, uv);
      textureIndex++;
    } else {
      // Multiple textures for different faces
      const faces = ['top', 'bottom', 'front', 'back', 'left', 'right'];
      const faceTextures = {};

      for (const face of faces) {
        let generator = generators[face];
        if (!generator) {
          if (face === 'front' || face === 'back' || face === 'left' || face === 'right') {
            generator = generators.side;
          }
        }
        if (!generator) {
          generator = generators.top || generators.side || Object.values(generators)[0];
        }

        // Check if we already generated this texture
        const genKey = generator.toString();
        if (!faceTextures[genKey]) {
          const texture = createTexture(generator);
          const x = (textureIndex % ATLAS_SIZE) * TEXTURE_SIZE;
          const y = Math.floor(textureIndex / ATLAS_SIZE) * TEXTURE_SIZE;
          ctx.drawImage(texture, x, y);

          faceTextures[genKey] = {
            u: textureIndex % ATLAS_SIZE,
            v: Math.floor(textureIndex / ATLAS_SIZE)
          };
          textureIndex++;
        }

        textureMap.set(`${blockType}_${face}`, faceTextures[genKey]);
      }
    }
  }

  // Flip the canvas vertically for WebGL (UV origin is bottom-left)
  const flippedCanvas = document.createElement('canvas');
  flippedCanvas.width = atlasSize;
  flippedCanvas.height = atlasSize;
  const flippedCtx = flippedCanvas.getContext('2d');
  flippedCtx.translate(0, atlasSize);
  flippedCtx.scale(1, -1);
  flippedCtx.drawImage(canvas, 0, 0);

  // Create Three.js texture
  const texture = new THREE.CanvasTexture(flippedCanvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false; // Already flipped

  return {
    texture,
    textureMap,
    atlasSize: ATLAS_SIZE
  };
}

// Get UV coordinates for a block face
export function getBlockUV(textureMap, blockType, face, atlasSize) {
  const key = `${blockType}_${face}`;
  const uv = textureMap.get(key);

  if (!uv) {
    // Default UV for unknown blocks (first tile)
    const tileSize = 1 / atlasSize;
    return {
      u0: 0,
      v0: 1 - tileSize,
      u1: tileSize,
      v1: 1
    };
  }

  const tileSize = 1 / atlasSize;
  // UV v is inverted because we flipped the texture
  // Row 0 in atlas (top) becomes v near 1, row N becomes v near 0
  const flippedV = (atlasSize - 1 - uv.v);
  return {
    u0: uv.u * tileSize,
    v0: flippedV * tileSize,
    u1: (uv.u + 1) * tileSize,
    v1: (flippedV + 1) * tileSize
  };
}

export { TEXTURE_SIZE, ATLAS_SIZE };
