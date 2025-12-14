import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import { WorldGenerator } from '../utils/worldGenerator';
import { ChunkManager } from './Chunk';
import { BlockHighlight, BreakingOverlay } from './Block';
import {
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  RENDER_DISTANCE,
  BLOCK_TYPES,
  BLOCK_PROPERTIES,
} from '../utils/constants';

export function World() {
  const { camera } = useThree();

  // Store state
  const worldSeed = useGameStore(state => state.worldSeed);
  const player = useGameStore(state => state.player);
  const chunks = useGameStore(state => state.chunks);
  const setChunk = useGameStore(state => state.setChunk);
  const removeChunk = useGameStore(state => state.removeChunk);
  const modifiedBlocks = useGameStore(state => state.modifiedBlocks);
  const setModifiedBlock = useGameStore(state => state.setModifiedBlock);
  const getModifiedBlock = useGameStore(state => state.getModifiedBlock);
  const isPlaying = useGameStore(state => state.isPlaying);
  const isLoading = useGameStore(state => state.isLoading);
  const finishLoading = useGameStore(state => state.finishLoading);
  const setHoveredBlock = useGameStore(state => state.setHoveredBlock);
  const hoveredBlock = useGameStore(state => state.hoveredBlock);
  const breakingBlock = useGameStore(state => state.breakingBlock);
  const breakProgress = useGameStore(state => state.breakProgress);
  const setBreakingBlock = useGameStore(state => state.setBreakingBlock);
  const inventory = useGameStore(state => state.inventory);
  const selectedSlot = useGameStore(state => state.player.selectedSlot);
  const addToInventory = useGameStore(state => state.addToInventory);
  const removeFromInventory = useGameStore(state => state.removeFromInventory);
  const settings = useGameStore(state => state.settings);

  // World generator
  const worldGenerator = useRef(null);
  const loadedChunks = useRef(new Set());
  const chunkLoadQueue = useRef([]);
  const isBreaking = useRef(false);
  const breakStartTime = useRef(0);

  // Track if world generator is ready
  const [generatorReady, setGeneratorReady] = useState(false);

  // Track if initial loading has been done (moved here to be near other refs)
  const initialLoadDone = useRef(false);

  // Initialize world generator
  useEffect(() => {
    worldGenerator.current = new WorldGenerator(worldSeed);
    // Reset initial load flag when seed changes (new game)
    initialLoadDone.current = false;
    loadedChunks.current.clear();
    setGeneratorReady(true);
  }, [worldSeed]);

  // Get block at world position
  const getBlockAt = useCallback((x, y, z) => {
    const bx = Math.floor(x);
    const by = Math.floor(y);
    const bz = Math.floor(z);

    // Check modified blocks first
    const modified = getModifiedBlock(bx, by, bz);
    if (modified !== undefined) return modified;

    // Get from chunk
    const chunkX = Math.floor(bx / CHUNK_SIZE);
    const chunkZ = Math.floor(bz / CHUNK_SIZE);
    const key = `${chunkX},${chunkZ}`;
    const chunk = chunks.get(key);

    if (!chunk || !chunk.blocks) return BLOCK_TYPES.AIR;

    const localX = ((bx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((bz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (by < 0 || by >= CHUNK_HEIGHT) return BLOCK_TYPES.AIR;

    return chunk.blocks[by * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX];
  }, [chunks, getModifiedBlock]);

  // Raycast to find target block
  const raycastBlock = useCallback(() => {
    if (!camera) return null;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction;
    const maxDistance = 5;
    const step = 0.1;

    let lastAir = null;

    for (let d = 0; d < maxDistance; d += step) {
      const x = Math.floor(origin.x + direction.x * d);
      const y = Math.floor(origin.y + direction.y * d);
      const z = Math.floor(origin.z + direction.z * d);

      const block = getBlockAt(x, y, z);

      if (block !== BLOCK_TYPES.AIR) {
        const props = BLOCK_PROPERTIES[block];
        if (props && props.solid) {
          return {
            position: [x, y, z],
            blockType: block,
            normal: lastAir ? [lastAir[0] - x, lastAir[1] - y, lastAir[2] - z] : [0, 1, 0],
            placePosition: lastAir || [x, y + 1, z],
          };
        }
      } else {
        lastAir = [x, y, z];
      }
    }

    return null;
  }, [camera, getBlockAt]);

  // Load chunk
  const loadChunk = useCallback((chunkX, chunkZ) => {
    const key = `${chunkX},${chunkZ}`;
    if (loadedChunks.current.has(key) || chunks.has(key)) return;

    loadedChunks.current.add(key);

    // Generate chunk
    if (worldGenerator.current) {
      const chunkData = worldGenerator.current.generateChunk(chunkX, chunkZ);
      setChunk(key, chunkData);
    }
  }, [chunks, setChunk]);

  // Unload distant chunks
  const unloadDistantChunks = useCallback((playerChunkX, playerChunkZ) => {
    const maxDistance = settings.renderDistance + 2;

    chunks.forEach((chunk, key) => {
      const [cx, cz] = key.split(',').map(Number);
      const dx = cx - playerChunkX;
      const dz = cz - playerChunkZ;

      if (dx * dx + dz * dz > maxDistance * maxDistance) {
        removeChunk(key);
        loadedChunks.current.delete(key);
      }
    });
  }, [chunks, removeChunk, settings.renderDistance]);

  // Update chunks around player
  useFrame(() => {
    if (!isPlaying || !worldGenerator.current) return;

    const playerChunkX = Math.floor(player.position[0] / CHUNK_SIZE);
    const playerChunkZ = Math.floor(player.position[2] / CHUNK_SIZE);

    // Load chunks in spiral pattern
    const renderDist = settings.renderDistance || RENDER_DISTANCE;

    for (let r = 0; r <= renderDist; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) === r || Math.abs(dz) === r) {
            if (dx * dx + dz * dz <= renderDist * renderDist) {
              loadChunk(playerChunkX + dx, playerChunkZ + dz);
            }
          }
        }
      }
    }

    // Unload distant chunks
    unloadDistantChunks(playerChunkX, playerChunkZ);
  });

  // Update hovered block
  useFrame(() => {
    if (!isPlaying) return;

    const target = raycastBlock();
    setHoveredBlock(target);
  });

  // Initial chunk loading - runs once during the loading phase
  useEffect(() => {
    // Only run once when we're in the loading state and generator is ready
    if (!isLoading || !generatorReady || !worldGenerator.current || initialLoadDone.current) return;

    // Mark as done immediately to prevent re-runs
    initialLoadDone.current = true;

    // Get initial player position from store directly to avoid dependency
    const initialPosition = useGameStore.getState().player.position;
    const playerChunkX = Math.floor(initialPosition[0] / CHUNK_SIZE);
    const playerChunkZ = Math.floor(initialPosition[2] / CHUNK_SIZE);

    // Load initial chunks synchronously
    const loadRadius = 3;
    const chunksToLoad = [];
    for (let dx = -loadRadius; dx <= loadRadius; dx++) {
      for (let dz = -loadRadius; dz <= loadRadius; dz++) {
        chunksToLoad.push([playerChunkX + dx, playerChunkZ + dz]);
      }
    }

    // Load all chunks
    chunksToLoad.forEach(([cx, cz]) => {
      const key = `${cx},${cz}`;
      if (!loadedChunks.current.has(key)) {
        loadedChunks.current.add(key);
        if (worldGenerator.current) {
          const chunkData = worldGenerator.current.generateChunk(cx, cz);
          useGameStore.getState().setChunk(key, chunkData);
        }
      }
    });

    // Find spawn height after chunks are loaded
    const spawnX = initialPosition[0];
    const spawnZ = initialPosition[2];
    let spawnY = CHUNK_HEIGHT - 1;

    // Get block at position using store state directly
    const findBlockAt = (x, y, z) => {
      const bx = Math.floor(x);
      const by = Math.floor(y);
      const bz = Math.floor(z);
      const chunkX = Math.floor(bx / CHUNK_SIZE);
      const chunkZ = Math.floor(bz / CHUNK_SIZE);
      const key = `${chunkX},${chunkZ}`;
      const chunk = useGameStore.getState().chunks.get(key);
      if (!chunk || !chunk.blocks) return BLOCK_TYPES.AIR;
      const localX = ((bx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const localZ = ((bz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      if (by < 0 || by >= CHUNK_HEIGHT) return BLOCK_TYPES.AIR;
      return chunk.blocks[by * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX];
    };

    for (let y = CHUNK_HEIGHT - 1; y >= 0; y--) {
      const block = findBlockAt(spawnX, y, spawnZ);
      if (block !== BLOCK_TYPES.AIR) {
        spawnY = y + 2;
        break;
      }
    }

    useGameStore.getState().updatePlayerPosition([spawnX, spawnY, spawnZ]);

    // Finish loading after a short delay to allow chunks to render
    setTimeout(() => {
      useGameStore.getState().finishLoading();
    }, 500);
  }, [isLoading, generatorReady]);

  // Block interaction handler
  const handleBlockInteraction = useCallback((action) => {
    if (!hoveredBlock) return;

    if (action === 'break') {
      const { position, blockType } = hoveredBlock;
      const props = BLOCK_PROPERTIES[blockType];

      if (!props || props.indestructible) return;

      // Break block instantly for now (could add mining time)
      setModifiedBlock(position[0], position[1], position[2], BLOCK_TYPES.AIR);

      // Add to inventory
      const dropType = props.drops !== undefined ? props.drops : blockType;
      if (dropType !== null) {
        addToInventory(dropType, 1);
      }

      // Force chunk update
      const chunkX = Math.floor(position[0] / CHUNK_SIZE);
      const chunkZ = Math.floor(position[2] / CHUNK_SIZE);
      const key = `${chunkX},${chunkZ}`;
      const chunk = chunks.get(key);
      if (chunk) {
        // Trigger re-render by updating chunk
        setChunk(key, { ...chunk, version: (chunk.version || 0) + 1 });
      }
    } else if (action === 'place') {
      const selectedItem = inventory[selectedSlot];
      if (!selectedItem) return;

      const { placePosition } = hoveredBlock;

      // Check if placement position is valid
      const existingBlock = getBlockAt(placePosition[0], placePosition[1], placePosition[2]);
      if (existingBlock !== BLOCK_TYPES.AIR) return;

      // Check player isn't placing in themselves
      const px = player.position[0];
      const py = player.position[1];
      const pz = player.position[2];
      const bx = placePosition[0];
      const by = placePosition[1];
      const bz = placePosition[2];

      if (
        bx >= px - 0.3 && bx <= px + 0.3 &&
        bz >= pz - 0.3 && bz <= pz + 0.3 &&
        by >= py && by <= py + 1.8
      ) {
        return; // Would place in player
      }

      // Place block
      setModifiedBlock(placePosition[0], placePosition[1], placePosition[2], selectedItem.type);
      removeFromInventory(selectedSlot, 1);

      // Force chunk update
      const chunkX = Math.floor(placePosition[0] / CHUNK_SIZE);
      const chunkZ = Math.floor(placePosition[2] / CHUNK_SIZE);
      const key = `${chunkX},${chunkZ}`;
      const chunk = chunks.get(key);
      if (chunk) {
        setChunk(key, { ...chunk, version: (chunk.version || 0) + 1 });
      }
    }
  }, [hoveredBlock, inventory, selectedSlot, player.position, getBlockAt, setModifiedBlock, addToInventory, removeFromInventory, chunks, setChunk]);

  // Expose interaction handler
  useEffect(() => {
    window.handleBlockInteraction = handleBlockInteraction;
    return () => {
      delete window.handleBlockInteraction;
    };
  }, [handleBlockInteraction]);

  return (
    <>
      {/* Chunk renderer */}
      <ChunkManager renderDistance={settings.renderDistance || RENDER_DISTANCE} />

      {/* Block highlight */}
      {hoveredBlock && (
        <BlockHighlight position={hoveredBlock.position} visible={true} />
      )}

      {/* Breaking overlay */}
      {breakingBlock && (
        <BreakingOverlay
          position={breakingBlock.position}
          progress={breakProgress}
          visible={true}
        />
      )}
    </>
  );
}

export default World;
