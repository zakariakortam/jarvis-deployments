import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { BLOCK_TYPES, BLOCK_PROPERTIES, DEFAULT_SETTINGS, CHUNK_SIZE, CHUNK_HEIGHT } from '../utils/constants';

const STORAGE_KEY = 'webcraft_save';

// Initial inventory items
const createInitialInventory = () => {
  const inventory = new Array(36).fill(null);
  // Give player some starting blocks
  inventory[0] = { type: BLOCK_TYPES.DIRT, count: 64 };
  inventory[1] = { type: BLOCK_TYPES.STONE, count: 64 };
  inventory[2] = { type: BLOCK_TYPES.GRASS, count: 64 };
  inventory[3] = { type: BLOCK_TYPES.WOOD, count: 64 };
  inventory[4] = { type: BLOCK_TYPES.PLANKS, count: 64 };
  inventory[5] = { type: BLOCK_TYPES.COBBLESTONE, count: 64 };
  inventory[6] = { type: BLOCK_TYPES.SAND, count: 64 };
  inventory[7] = { type: BLOCK_TYPES.GLASS, count: 64 };
  inventory[8] = { type: BLOCK_TYPES.LOG, count: 64 };
  return inventory;
};

// Game state store
const useGameStore = create(
  subscribeWithSelector((set, get) => ({
    // Game state
    gameState: 'menu', // 'menu', 'playing', 'paused', 'inventory', 'crafting', 'loading'
    isPlaying: false,
    isPaused: false,
    isLoading: true,

    // World data
    worldSeed: Date.now(),
    worldName: 'New World',
    chunks: new Map(),
    modifiedBlocks: new Map(), // Track player modifications

    // Player state
    player: {
      position: [0, 80, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0],
      health: 20,
      maxHealth: 20,
      hunger: 20,
      maxHunger: 20,
      experience: 0,
      level: 0,
      isFlying: false,
      isSwimming: false,
      isSprinting: false,
      isSneaking: false,
      isOnGround: false,
      selectedSlot: 0,
    },

    // Inventory
    inventory: createInitialInventory(),
    craftingGrid: new Array(9).fill(null),
    craftingResult: null,

    // Settings
    settings: { ...DEFAULT_SETTINGS },

    // Time and weather
    time: 0, // 0-1 represents full day cycle
    dayCount: 1,
    weather: 'clear', // 'clear', 'rain', 'thunder'

    // UI state
    showDebug: false,
    showInventory: false,
    showCrafting: false,
    hoveredBlock: null,
    selectedBlock: null,
    breakingBlock: null,
    breakProgress: 0,

    // Performance metrics
    fps: 60,
    chunksLoaded: 0,
    triangleCount: 0,

    // Actions
    setGameState: (state) => set({ gameState: state, isPlaying: state === 'playing' }),

    startGame: (worldName, seed) => {
      set({
        gameState: 'loading',
        isLoading: true,
        worldName: worldName || 'New World',
        worldSeed: seed || Date.now(),
        chunks: new Map(),
        modifiedBlocks: new Map(),
        player: {
          ...get().player,
          position: [0, 80, 0],
          health: 20,
          hunger: 20,
        },
        inventory: createInitialInventory(),
        time: 0.25, // Start at morning
        dayCount: 1,
      });
    },

    finishLoading: () => set({ isLoading: false, gameState: 'playing', isPlaying: true }),

    pauseGame: () => set({ gameState: 'paused', isPaused: true }),

    resumeGame: () => set({ gameState: 'playing', isPaused: false }),

    exitToMenu: () => {
      get().saveGame();
      set({
        gameState: 'menu',
        isPlaying: false,
        isPaused: false,
        chunks: new Map(),
      });
    },

    // Player actions
    updatePlayerPosition: (position) =>
      set((state) => ({
        player: { ...state.player, position },
      })),

    updatePlayerVelocity: (velocity) =>
      set((state) => ({
        player: { ...state.player, velocity },
      })),

    updatePlayerRotation: (rotation) =>
      set((state) => ({
        player: { ...state.player, rotation },
      })),

    setPlayerOnGround: (isOnGround) =>
      set((state) => ({
        player: { ...state.player, isOnGround },
      })),

    setPlayerFlying: (isFlying) =>
      set((state) => ({
        player: { ...state.player, isFlying },
      })),

    setPlayerSprinting: (isSprinting) =>
      set((state) => ({
        player: { ...state.player, isSprinting },
      })),

    setPlayerSneaking: (isSneaking) =>
      set((state) => ({
        player: { ...state.player, isSneaking },
      })),

    setPlayerSwimming: (isSwimming) =>
      set((state) => ({
        player: { ...state.player, isSwimming },
      })),

    damagePlayer: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          health: Math.max(0, state.player.health - amount),
        },
      })),

    healPlayer: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          health: Math.min(state.player.maxHealth, state.player.health + amount),
        },
      })),

    updateHunger: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          hunger: Math.max(0, Math.min(state.player.maxHunger, state.player.hunger + amount)),
        },
      })),

    // Inventory actions
    selectSlot: (slot) =>
      set((state) => ({
        player: { ...state.player, selectedSlot: slot },
      })),

    setInventorySlot: (index, item) =>
      set((state) => {
        const inventory = [...state.inventory];
        inventory[index] = item;
        return { inventory };
      }),

    addToInventory: (blockType, count = 1) => {
      const state = get();
      const inventory = [...state.inventory];

      // Try to stack with existing items first
      for (let i = 0; i < inventory.length; i++) {
        if (inventory[i] && inventory[i].type === blockType && inventory[i].count < 64) {
          const spaceLeft = 64 - inventory[i].count;
          const toAdd = Math.min(spaceLeft, count);
          inventory[i] = { type: blockType, count: inventory[i].count + toAdd };
          count -= toAdd;
          if (count <= 0) {
            set({ inventory });
            return true;
          }
        }
      }

      // Find empty slot for remaining items
      for (let i = 0; i < inventory.length; i++) {
        if (!inventory[i]) {
          const toAdd = Math.min(64, count);
          inventory[i] = { type: blockType, count: toAdd };
          count -= toAdd;
          if (count <= 0) {
            set({ inventory });
            return true;
          }
        }
      }

      set({ inventory });
      return count <= 0;
    },

    removeFromInventory: (index, count = 1) =>
      set((state) => {
        const inventory = [...state.inventory];
        if (inventory[index]) {
          inventory[index].count -= count;
          if (inventory[index].count <= 0) {
            inventory[index] = null;
          }
        }
        return { inventory };
      }),

    getSelectedItem: () => {
      const state = get();
      return state.inventory[state.player.selectedSlot];
    },

    // Crafting actions
    setCraftingGrid: (grid) => set({ craftingGrid: grid }),

    setCraftingSlot: (index, item) =>
      set((state) => {
        const craftingGrid = [...state.craftingGrid];
        craftingGrid[index] = item;
        return { craftingGrid };
      }),

    setCraftingResult: (result) => set({ craftingResult: result }),

    clearCrafting: () =>
      set({
        craftingGrid: new Array(9).fill(null),
        craftingResult: null,
      }),

    // World/chunk actions
    setChunk: (key, chunk) =>
      set((state) => {
        const chunks = new Map(state.chunks);
        chunks.set(key, chunk);
        return { chunks, chunksLoaded: chunks.size };
      }),

    getChunk: (key) => get().chunks.get(key),

    removeChunk: (key) =>
      set((state) => {
        const chunks = new Map(state.chunks);
        chunks.delete(key);
        return { chunks, chunksLoaded: chunks.size };
      }),

    // Block modification tracking
    setModifiedBlock: (x, y, z, blockType) => {
      const key = `${x},${y},${z}`;
      set((state) => {
        const modifiedBlocks = new Map(state.modifiedBlocks);
        modifiedBlocks.set(key, blockType);
        return { modifiedBlocks };
      });
    },

    getModifiedBlock: (x, y, z) => {
      const key = `${x},${y},${z}`;
      return get().modifiedBlocks.get(key);
    },

    // Block interaction
    setHoveredBlock: (block) => set({ hoveredBlock: block }),

    setSelectedBlock: (block) => set({ selectedBlock: block }),

    setBreakingBlock: (block, progress) =>
      set({ breakingBlock: block, breakProgress: progress }),

    // Time actions
    updateTime: (delta) =>
      set((state) => {
        let newTime = state.time + delta / 1200; // 1200 seconds per day
        let newDayCount = state.dayCount;
        if (newTime >= 1) {
          newTime -= 1;
          newDayCount += 1;
        }
        return { time: newTime, dayCount: newDayCount };
      }),

    setTime: (time) => set({ time: time % 1 }),

    setWeather: (weather) => set({ weather }),

    // Settings actions
    updateSettings: (newSettings) =>
      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),

    toggleDebug: () =>
      set((state) => ({ showDebug: !state.showDebug })),

    // UI actions
    toggleInventory: () =>
      set((state) => ({
        showInventory: !state.showInventory,
        showCrafting: false,
        gameState: state.showInventory ? 'playing' : 'inventory',
      })),

    toggleCrafting: () =>
      set((state) => ({
        showCrafting: !state.showCrafting,
        showInventory: false,
        gameState: state.showCrafting ? 'playing' : 'crafting',
      })),

    closeAllMenus: () =>
      set({
        showInventory: false,
        showCrafting: false,
        gameState: 'playing',
      }),

    // Performance tracking
    setFPS: (fps) => set({ fps }),

    setTriangleCount: (count) => set({ triangleCount: count }),

    // Save/Load
    saveGame: () => {
      const state = get();
      const saveData = {
        worldName: state.worldName,
        worldSeed: state.worldSeed,
        player: state.player,
        inventory: state.inventory,
        modifiedBlocks: Array.from(state.modifiedBlocks.entries()),
        time: state.time,
        dayCount: state.dayCount,
        settings: state.settings,
        savedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('Game saved successfully');
      } catch (e) {
        console.error('Failed to save game:', e);
      }
    },

    loadGame: () => {
      try {
        const saveData = localStorage.getItem(STORAGE_KEY);
        if (saveData) {
          const data = JSON.parse(saveData);
          set({
            worldName: data.worldName,
            worldSeed: data.worldSeed,
            player: data.player,
            inventory: data.inventory,
            modifiedBlocks: new Map(data.modifiedBlocks),
            time: data.time,
            dayCount: data.dayCount,
            settings: { ...DEFAULT_SETTINGS, ...data.settings },
          });
          return true;
        }
      } catch (e) {
        console.error('Failed to load game:', e);
      }
      return false;
    },

    hasSavedGame: () => {
      return localStorage.getItem(STORAGE_KEY) !== null;
    },

    deleteSave: () => {
      localStorage.removeItem(STORAGE_KEY);
    },
  }))
);

export default useGameStore;
