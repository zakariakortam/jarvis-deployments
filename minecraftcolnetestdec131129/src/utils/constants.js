// Block types enumeration
export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLESTONE: 4,
  WOOD: 5,
  LEAVES: 6,
  SAND: 7,
  WATER: 8,
  GLASS: 9,
  BRICK: 10,
  PLANKS: 11,
  LOG: 12,
  SNOW: 13,
  ICE: 14,
  CLAY: 15,
  GRAVEL: 16,
  COAL_ORE: 17,
  IRON_ORE: 18,
  GOLD_ORE: 19,
  DIAMOND_ORE: 20,
  BEDROCK: 21,
  LAVA: 22,
  CACTUS: 23,
  CRAFTING_TABLE: 24,
  FURNACE: 25,
  CHEST: 26,
  TNT: 27,
  OBSIDIAN: 28,
  GLOWSTONE: 29,
};

// Block properties
export const BLOCK_PROPERTIES = {
  [BLOCK_TYPES.AIR]: {
    name: 'Air',
    transparent: true,
    solid: false,
    breakTime: 0,
    tool: null,
    drops: null
  },
  [BLOCK_TYPES.GRASS]: {
    name: 'Grass Block',
    transparent: false,
    solid: true,
    breakTime: 0.6,
    tool: 'shovel',
    drops: BLOCK_TYPES.DIRT,
    color: '#5a8c32',
    topColor: '#7ab648',
    sideColor: '#8b6914'
  },
  [BLOCK_TYPES.DIRT]: {
    name: 'Dirt',
    transparent: false,
    solid: true,
    breakTime: 0.5,
    tool: 'shovel',
    color: '#8b6914'
  },
  [BLOCK_TYPES.STONE]: {
    name: 'Stone',
    transparent: false,
    solid: true,
    breakTime: 1.5,
    tool: 'pickaxe',
    drops: BLOCK_TYPES.COBBLESTONE,
    color: '#7f7f7f'
  },
  [BLOCK_TYPES.COBBLESTONE]: {
    name: 'Cobblestone',
    transparent: false,
    solid: true,
    breakTime: 2.0,
    tool: 'pickaxe',
    color: '#6f6f6f'
  },
  [BLOCK_TYPES.WOOD]: {
    name: 'Oak Wood',
    transparent: false,
    solid: true,
    breakTime: 2.0,
    tool: 'axe',
    color: '#6b5344',
    sideColor: '#4a3728'
  },
  [BLOCK_TYPES.LEAVES]: {
    name: 'Oak Leaves',
    transparent: true,
    solid: true,
    breakTime: 0.2,
    tool: 'shears',
    color: '#2d5a27'
  },
  [BLOCK_TYPES.SAND]: {
    name: 'Sand',
    transparent: false,
    solid: true,
    breakTime: 0.5,
    tool: 'shovel',
    color: '#e8d4a8',
    gravity: true
  },
  [BLOCK_TYPES.WATER]: {
    name: 'Water',
    transparent: true,
    solid: false,
    breakTime: 0,
    tool: null,
    color: '#3366cc',
    liquid: true,
    flowable: true
  },
  [BLOCK_TYPES.GLASS]: {
    name: 'Glass',
    transparent: true,
    solid: true,
    breakTime: 0.3,
    tool: null,
    drops: null,
    color: '#c0e0ff'
  },
  [BLOCK_TYPES.BRICK]: {
    name: 'Bricks',
    transparent: false,
    solid: true,
    breakTime: 2.0,
    tool: 'pickaxe',
    color: '#8b4532'
  },
  [BLOCK_TYPES.PLANKS]: {
    name: 'Oak Planks',
    transparent: false,
    solid: true,
    breakTime: 2.0,
    tool: 'axe',
    color: '#bc9862'
  },
  [BLOCK_TYPES.LOG]: {
    name: 'Oak Log',
    transparent: false,
    solid: true,
    breakTime: 2.0,
    tool: 'axe',
    color: '#6b5344',
    topColor: '#bc9862',
    sideColor: '#4a3728'
  },
  [BLOCK_TYPES.SNOW]: {
    name: 'Snow',
    transparent: false,
    solid: true,
    breakTime: 0.5,
    tool: 'shovel',
    color: '#f0f0f0'
  },
  [BLOCK_TYPES.ICE]: {
    name: 'Ice',
    transparent: true,
    solid: true,
    breakTime: 0.5,
    tool: 'pickaxe',
    drops: null,
    color: '#a0d0ff',
    slippery: true
  },
  [BLOCK_TYPES.CLAY]: {
    name: 'Clay',
    transparent: false,
    solid: true,
    breakTime: 0.6,
    tool: 'shovel',
    color: '#9ea4b0'
  },
  [BLOCK_TYPES.GRAVEL]: {
    name: 'Gravel',
    transparent: false,
    solid: true,
    breakTime: 0.6,
    tool: 'shovel',
    color: '#8a7a7a',
    gravity: true
  },
  [BLOCK_TYPES.COAL_ORE]: {
    name: 'Coal Ore',
    transparent: false,
    solid: true,
    breakTime: 3.0,
    tool: 'pickaxe',
    color: '#4a4a4a'
  },
  [BLOCK_TYPES.IRON_ORE]: {
    name: 'Iron Ore',
    transparent: false,
    solid: true,
    breakTime: 3.0,
    tool: 'pickaxe',
    color: '#8a7560'
  },
  [BLOCK_TYPES.GOLD_ORE]: {
    name: 'Gold Ore',
    transparent: false,
    solid: true,
    breakTime: 3.0,
    tool: 'pickaxe',
    color: '#fcdb4e'
  },
  [BLOCK_TYPES.DIAMOND_ORE]: {
    name: 'Diamond Ore',
    transparent: false,
    solid: true,
    breakTime: 3.0,
    tool: 'pickaxe',
    color: '#5cd6e8'
  },
  [BLOCK_TYPES.BEDROCK]: {
    name: 'Bedrock',
    transparent: false,
    solid: true,
    breakTime: -1,
    tool: null,
    color: '#333333',
    indestructible: true
  },
  [BLOCK_TYPES.LAVA]: {
    name: 'Lava',
    transparent: true,
    solid: false,
    breakTime: 0,
    tool: null,
    color: '#ff6600',
    liquid: true,
    flowable: true,
    damage: 4,
    light: 15
  },
  [BLOCK_TYPES.CACTUS]: {
    name: 'Cactus',
    transparent: false,
    solid: true,
    breakTime: 0.4,
    tool: null,
    color: '#1a5c1a',
    damage: 1
  },
  [BLOCK_TYPES.CRAFTING_TABLE]: {
    name: 'Crafting Table',
    transparent: false,
    solid: true,
    breakTime: 2.5,
    tool: 'axe',
    color: '#bc9862',
    interactive: true
  },
  [BLOCK_TYPES.FURNACE]: {
    name: 'Furnace',
    transparent: false,
    solid: true,
    breakTime: 3.5,
    tool: 'pickaxe',
    color: '#7f7f7f',
    interactive: true
  },
  [BLOCK_TYPES.CHEST]: {
    name: 'Chest',
    transparent: false,
    solid: true,
    breakTime: 2.5,
    tool: 'axe',
    color: '#8b6914',
    interactive: true
  },
  [BLOCK_TYPES.TNT]: {
    name: 'TNT',
    transparent: false,
    solid: true,
    breakTime: 0,
    tool: null,
    color: '#ff0000',
    explosive: true
  },
  [BLOCK_TYPES.OBSIDIAN]: {
    name: 'Obsidian',
    transparent: false,
    solid: true,
    breakTime: 50.0,
    tool: 'diamond_pickaxe',
    color: '#1a0a2e'
  },
  [BLOCK_TYPES.GLOWSTONE]: {
    name: 'Glowstone',
    transparent: false,
    solid: true,
    breakTime: 0.3,
    tool: null,
    color: '#ffcc66',
    light: 15
  },
};

// World generation constants
export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 128;
export const RENDER_DISTANCE = 4;
export const WATER_LEVEL = 62;
export const SEA_LEVEL = 64;

// Biome types
export const BIOME_TYPES = {
  PLAINS: 'plains',
  FOREST: 'forest',
  DESERT: 'desert',
  SNOW: 'snow',
  MOUNTAINS: 'mountains',
  OCEAN: 'ocean',
  BEACH: 'beach',
  SWAMP: 'swamp',
};

// Biome properties
export const BIOME_PROPERTIES = {
  [BIOME_TYPES.PLAINS]: {
    name: 'Plains',
    surfaceBlock: BLOCK_TYPES.GRASS,
    subsurfaceBlock: BLOCK_TYPES.DIRT,
    treeFrequency: 0.002,
    heightVariation: 4,
    baseHeight: 64,
    grassColor: '#7ab648',
  },
  [BIOME_TYPES.FOREST]: {
    name: 'Forest',
    surfaceBlock: BLOCK_TYPES.GRASS,
    subsurfaceBlock: BLOCK_TYPES.DIRT,
    treeFrequency: 0.05,
    heightVariation: 6,
    baseHeight: 66,
    grassColor: '#5a8c32',
  },
  [BIOME_TYPES.DESERT]: {
    name: 'Desert',
    surfaceBlock: BLOCK_TYPES.SAND,
    subsurfaceBlock: BLOCK_TYPES.SAND,
    treeFrequency: 0.001,
    heightVariation: 3,
    baseHeight: 64,
    hasRain: false,
  },
  [BIOME_TYPES.SNOW]: {
    name: 'Snowy Tundra',
    surfaceBlock: BLOCK_TYPES.SNOW,
    subsurfaceBlock: BLOCK_TYPES.DIRT,
    treeFrequency: 0.01,
    heightVariation: 4,
    baseHeight: 64,
    snowfall: true,
  },
  [BIOME_TYPES.MOUNTAINS]: {
    name: 'Mountains',
    surfaceBlock: BLOCK_TYPES.STONE,
    subsurfaceBlock: BLOCK_TYPES.STONE,
    treeFrequency: 0.005,
    heightVariation: 30,
    baseHeight: 80,
  },
  [BIOME_TYPES.OCEAN]: {
    name: 'Ocean',
    surfaceBlock: BLOCK_TYPES.SAND,
    subsurfaceBlock: BLOCK_TYPES.SAND,
    treeFrequency: 0,
    heightVariation: 2,
    baseHeight: 40,
  },
  [BIOME_TYPES.BEACH]: {
    name: 'Beach',
    surfaceBlock: BLOCK_TYPES.SAND,
    subsurfaceBlock: BLOCK_TYPES.SAND,
    treeFrequency: 0,
    heightVariation: 1,
    baseHeight: 63,
  },
  [BIOME_TYPES.SWAMP]: {
    name: 'Swamp',
    surfaceBlock: BLOCK_TYPES.GRASS,
    subsurfaceBlock: BLOCK_TYPES.DIRT,
    treeFrequency: 0.02,
    heightVariation: 2,
    baseHeight: 62,
    grassColor: '#4a6c32',
  },
};

// Player constants
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_WIDTH = 0.6;
export const PLAYER_EYE_HEIGHT = 1.62;
export const GRAVITY = 20;           // Reduced from 32 for smoother movement
export const JUMP_VELOCITY = 7;      // Reduced from 9 for less choppy jumps
export const WALK_SPEED = 4.3;
export const SPRINT_SPEED = 5.6;
export const SWIM_SPEED = 2.0;
export const FLY_SPEED = 10.0;
export const TERMINAL_VELOCITY = 50; // Reduced from 78

// Game settings
export const DEFAULT_SETTINGS = {
  renderDistance: 4,
  fov: 70,
  sensitivity: 0.002,
  volume: 1.0,
  musicVolume: 0.5,
  showDebug: false,
  invertY: false,
  viewBobbing: true,
  smoothLighting: true,
  particles: true,
  clouds: true,
  fullscreen: false,
};

// Crafting recipes
export const CRAFTING_RECIPES = [
  {
    id: 'planks',
    input: [[BLOCK_TYPES.LOG, null, null], [null, null, null], [null, null, null]],
    output: { type: BLOCK_TYPES.PLANKS, count: 4 },
    shapeless: true,
  },
  {
    id: 'crafting_table',
    input: [
      [BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, null],
      [BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, null],
      [null, null, null]
    ],
    output: { type: BLOCK_TYPES.CRAFTING_TABLE, count: 1 },
  },
  {
    id: 'furnace',
    input: [
      [BLOCK_TYPES.COBBLESTONE, BLOCK_TYPES.COBBLESTONE, BLOCK_TYPES.COBBLESTONE],
      [BLOCK_TYPES.COBBLESTONE, null, BLOCK_TYPES.COBBLESTONE],
      [BLOCK_TYPES.COBBLESTONE, BLOCK_TYPES.COBBLESTONE, BLOCK_TYPES.COBBLESTONE]
    ],
    output: { type: BLOCK_TYPES.FURNACE, count: 1 },
  },
  {
    id: 'chest',
    input: [
      [BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS],
      [BLOCK_TYPES.PLANKS, null, BLOCK_TYPES.PLANKS],
      [BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS, BLOCK_TYPES.PLANKS]
    ],
    output: { type: BLOCK_TYPES.CHEST, count: 1 },
  },
  {
    id: 'glass',
    input: [[BLOCK_TYPES.SAND, null, null], [null, null, null], [null, null, null]],
    output: { type: BLOCK_TYPES.GLASS, count: 1 },
    smelting: true,
  },
  {
    id: 'brick',
    input: [
      [BLOCK_TYPES.CLAY, BLOCK_TYPES.CLAY, null],
      [BLOCK_TYPES.CLAY, BLOCK_TYPES.CLAY, null],
      [null, null, null]
    ],
    output: { type: BLOCK_TYPES.BRICK, count: 1 },
  },
];

// Day/night cycle
export const DAY_LENGTH = 1200; // seconds for full day cycle (20 minutes like real Minecraft)
export const SUNRISE_START = 0;
export const DAY_START = 0.1;
export const SUNSET_START = 0.5;
export const NIGHT_START = 0.6;
export const NIGHT_END = 0.9;

// Sound types
export const SOUND_TYPES = {
  BLOCK_BREAK: 'block_break',
  BLOCK_PLACE: 'block_place',
  FOOTSTEP_GRASS: 'footstep_grass',
  FOOTSTEP_STONE: 'footstep_stone',
  FOOTSTEP_SAND: 'footstep_sand',
  FOOTSTEP_WOOD: 'footstep_wood',
  JUMP: 'jump',
  SPLASH: 'splash',
  HURT: 'hurt',
  EAT: 'eat',
  AMBIENT_CAVE: 'ambient_cave',
  AMBIENT_RAIN: 'ambient_rain',
  MUSIC: 'music',
};

// Tool types and their effectiveness
export const TOOL_TYPES = {
  HAND: { speed: 1, durability: 0 },
  WOODEN_PICKAXE: { speed: 2, durability: 60, effective: ['stone', 'ore'] },
  STONE_PICKAXE: { speed: 4, durability: 132, effective: ['stone', 'ore'] },
  IRON_PICKAXE: { speed: 6, durability: 251, effective: ['stone', 'ore'] },
  DIAMOND_PICKAXE: { speed: 8, durability: 1562, effective: ['stone', 'ore'] },
  WOODEN_AXE: { speed: 2, durability: 60, effective: ['wood'] },
  STONE_AXE: { speed: 4, durability: 132, effective: ['wood'] },
  IRON_AXE: { speed: 6, durability: 251, effective: ['wood'] },
  DIAMOND_AXE: { speed: 8, durability: 1562, effective: ['wood'] },
  WOODEN_SHOVEL: { speed: 2, durability: 60, effective: ['dirt', 'sand'] },
  STONE_SHOVEL: { speed: 4, durability: 132, effective: ['dirt', 'sand'] },
  IRON_SHOVEL: { speed: 6, durability: 251, effective: ['dirt', 'sand'] },
  DIAMOND_SHOVEL: { speed: 8, durability: 1562, effective: ['dirt', 'sand'] },
};

// Direction vectors for block faces
export const FACE_DIRECTIONS = {
  TOP: [0, 1, 0],
  BOTTOM: [0, -1, 0],
  FRONT: [0, 0, 1],
  BACK: [0, 0, -1],
  RIGHT: [1, 0, 0],
  LEFT: [-1, 0, 0],
};
