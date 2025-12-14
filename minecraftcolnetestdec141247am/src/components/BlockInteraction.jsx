import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import {
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  BLOCK_TYPES,
  BLOCK_PROPERTIES,
} from '../utils/constants';

// Max reach distance for block interaction
const REACH_DISTANCE = 5;
const BREAK_STEP = 0.1; // Progress per frame when holding mouse

export function BlockInteraction() {
  const { camera } = useThree();

  // Store state
  const chunks = useGameStore(state => state.chunks);
  const modifiedBlocks = useGameStore(state => state.modifiedBlocks);
  const getModifiedBlock = useGameStore(state => state.getModifiedBlock);
  const setModifiedBlock = useGameStore(state => state.setModifiedBlock);
  const setHoveredBlock = useGameStore(state => state.setHoveredBlock);
  const breakingBlock = useGameStore(state => state.breakingBlock);
  const breakProgress = useGameStore(state => state.breakProgress);
  const setBreakingBlock = useGameStore(state => state.setBreakingBlock);
  const isPlaying = useGameStore(state => state.isPlaying);
  const isPaused = useGameStore(state => state.isPaused);
  const showInventory = useGameStore(state => state.showInventory);
  const inventory = useGameStore(state => state.inventory);
  const selectedSlot = useGameStore(state => state.player.selectedSlot);
  const addToInventory = useGameStore(state => state.addToInventory);
  const removeFromInventory = useGameStore(state => state.removeFromInventory);

  // Refs
  const highlightRef = useRef();
  const breakOverlayRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const isBreaking = useRef(false);
  const isPlacing = useRef(false);
  const lastTargetBlock = useRef(null);
  const chunksRef = useRef(chunks);
  const modifiedBlocksRef = useRef(modifiedBlocks);

  // Keep refs updated
  chunksRef.current = chunks;
  modifiedBlocksRef.current = modifiedBlocks;

  // Get block at world position
  const getBlockAt = useCallback((x, y, z) => {
    const bx = Math.floor(x);
    const by = Math.floor(y);
    const bz = Math.floor(z);

    // Check modified blocks first
    const key = `${bx},${by},${bz}`;
    const modified = modifiedBlocksRef.current.get(key);
    if (modified !== undefined) return modified;

    // Get from chunk
    const chunkX = Math.floor(bx / CHUNK_SIZE);
    const chunkZ = Math.floor(bz / CHUNK_SIZE);
    const chunkKey = `${chunkX},${chunkZ}`;
    const chunk = chunksRef.current.get(chunkKey);

    if (!chunk || !chunk.blocks) return BLOCK_TYPES.AIR;

    const localX = ((bx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((bz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (by < 0 || by >= CHUNK_HEIGHT) return BLOCK_TYPES.AIR;

    return chunk.blocks[by * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX];
  }, []);

  // Raycast to find target block
  const raycastBlocks = useCallback(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    raycaster.current.set(camera.position, direction);

    // Step-based raycast for voxel precision
    const step = 0.1;
    const maxSteps = Math.ceil(REACH_DISTANCE / step);
    const pos = camera.position.clone();

    let lastAirPos = null;

    for (let i = 0; i < maxSteps; i++) {
      pos.addScaledVector(direction, step);

      const bx = Math.floor(pos.x);
      const by = Math.floor(pos.y);
      const bz = Math.floor(pos.z);

      const block = getBlockAt(bx, by, bz);

      if (block !== BLOCK_TYPES.AIR) {
        const props = BLOCK_PROPERTIES[block];
        if (props && props.solid) {
          return {
            position: [bx, by, bz],
            blockType: block,
            adjacentPosition: lastAirPos || [bx, by + 1, bz], // Position to place new block
          };
        }
      }

      lastAirPos = [bx, by, bz];
    }

    return null;
  }, [camera, getBlockAt]);

  // Break block
  const breakBlock = useCallback((x, y, z) => {
    const blockType = getBlockAt(x, y, z);
    if (blockType === BLOCK_TYPES.AIR) return false;

    const props = BLOCK_PROPERTIES[blockType];
    if (!props || props.indestructible) return false;

    // Set block to air
    setModifiedBlock(x, y, z, BLOCK_TYPES.AIR);

    // Add dropped item to inventory
    const dropType = props.drops !== undefined ? props.drops : blockType;
    if (dropType !== null && dropType !== BLOCK_TYPES.AIR) {
      addToInventory(dropType, 1);
    }

    // Trigger chunk rebuild by incrementing version
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    triggerChunkRebuild(chunkX, chunkZ);

    // Also rebuild adjacent chunks if on border
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (localX === 0) triggerChunkRebuild(chunkX - 1, chunkZ);
    if (localX === CHUNK_SIZE - 1) triggerChunkRebuild(chunkX + 1, chunkZ);
    if (localZ === 0) triggerChunkRebuild(chunkX, chunkZ - 1);
    if (localZ === CHUNK_SIZE - 1) triggerChunkRebuild(chunkX, chunkZ + 1);

    return true;
  }, [getBlockAt, setModifiedBlock, addToInventory]);

  // Place block
  const placeBlock = useCallback((x, y, z) => {
    // Check if position is valid
    if (y < 0 || y >= CHUNK_HEIGHT) return false;

    // Check if position is empty
    const existingBlock = getBlockAt(x, y, z);
    if (existingBlock !== BLOCK_TYPES.AIR) return false;

    // Get selected block from inventory
    const selectedItem = inventory[selectedSlot];
    if (!selectedItem || selectedItem.count <= 0) return false;

    // Check if player is not in the way
    const playerPos = useGameStore.getState().player.position;
    const playerMinY = playerPos[1];
    const playerMaxY = playerPos[1] + 1.8;
    const playerMinX = playerPos[0] - 0.3;
    const playerMaxX = playerPos[0] + 0.3;
    const playerMinZ = playerPos[2] - 0.3;
    const playerMaxZ = playerPos[2] + 0.3;

    if (
      x + 1 > playerMinX && x < playerMaxX + 1 &&
      y + 1 > playerMinY && y < playerMaxY + 1 &&
      z + 1 > playerMinZ && z < playerMaxZ + 1
    ) {
      return false; // Would place block inside player
    }

    // Place the block
    setModifiedBlock(x, y, z, selectedItem.type);

    // Remove from inventory
    removeFromInventory(selectedSlot, 1);

    // Trigger chunk rebuild
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    triggerChunkRebuild(chunkX, chunkZ);

    // Also rebuild adjacent chunks if on border
    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (localX === 0) triggerChunkRebuild(chunkX - 1, chunkZ);
    if (localX === CHUNK_SIZE - 1) triggerChunkRebuild(chunkX + 1, chunkZ);
    if (localZ === 0) triggerChunkRebuild(chunkX, chunkZ - 1);
    if (localZ === CHUNK_SIZE - 1) triggerChunkRebuild(chunkX, chunkZ + 1);

    return true;
  }, [getBlockAt, inventory, selectedSlot, setModifiedBlock, removeFromInventory]);

  // Trigger chunk rebuild by updating version
  const triggerChunkRebuild = (chunkX, chunkZ) => {
    const key = `${chunkX},${chunkZ}`;
    const chunk = useGameStore.getState().chunks.get(key);
    if (chunk) {
      useGameStore.getState().setChunk(key, {
        ...chunk,
        version: (chunk.version || 0) + 1,
      });
    }
  };

  // Mouse handlers
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!isPlaying || isPaused || showInventory) return;

      if (e.button === 0) {
        isBreaking.current = true;
      } else if (e.button === 2) {
        isPlacing.current = true;
        // Immediate place on right click
        const target = raycastBlocks();
        if (target) {
          placeBlock(...target.adjacentPosition);
        }
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 0) {
        isBreaking.current = false;
        setBreakingBlock(null, 0);
      } else if (e.button === 2) {
        isPlacing.current = false;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, isPaused, showInventory, raycastBlocks, placeBlock, setBreakingBlock]);

  // Game loop
  useFrame((state, delta) => {
    if (!isPlaying || isPaused || showInventory) {
      if (highlightRef.current) highlightRef.current.visible = false;
      if (breakOverlayRef.current) breakOverlayRef.current.visible = false;
      return;
    }

    // Raycast to find target block
    const target = raycastBlocks();

    if (target) {
      const [bx, by, bz] = target.position;

      // Update highlight position
      if (highlightRef.current) {
        highlightRef.current.position.set(bx + 0.5, by + 0.5, bz + 0.5);
        highlightRef.current.visible = true;
      }

      // Update hovered block in store
      setHoveredBlock({
        position: target.position,
        type: target.blockType,
      });

      // Handle breaking
      if (isBreaking.current) {
        const currentKey = `${bx},${by},${bz}`;

        if (lastTargetBlock.current !== currentKey) {
          // Started breaking a new block
          lastTargetBlock.current = currentKey;
          setBreakingBlock(target.position, 0);
        } else {
          // Continue breaking
          const props = BLOCK_PROPERTIES[target.blockType];
          const breakTime = props?.breakTime || 1;

          // Calculate progress increment (instant break if breakTime is very low)
          const progressIncrement = breakTime > 0 ? delta / breakTime : 1;
          const newProgress = breakProgress + progressIncrement;

          if (newProgress >= 1) {
            // Block broken!
            breakBlock(bx, by, bz);
            setBreakingBlock(null, 0);
            lastTargetBlock.current = null;
          } else {
            setBreakingBlock(target.position, newProgress);
          }
        }

        // Update break overlay
        if (breakOverlayRef.current && breakingBlock) {
          breakOverlayRef.current.position.set(bx + 0.5, by + 0.5, bz + 0.5);
          breakOverlayRef.current.visible = true;
          // Scale overlay based on progress for visual feedback
          const scale = 1.01 + breakProgress * 0.02;
          breakOverlayRef.current.scale.setScalar(scale);
        }
      } else {
        lastTargetBlock.current = null;
        if (breakOverlayRef.current) {
          breakOverlayRef.current.visible = false;
        }
      }
    } else {
      // No target block
      if (highlightRef.current) highlightRef.current.visible = false;
      if (breakOverlayRef.current) breakOverlayRef.current.visible = false;
      setHoveredBlock(null);
      lastTargetBlock.current = null;

      if (isBreaking.current) {
        setBreakingBlock(null, 0);
      }
    }
  });

  // Create break stage texture (cracks)
  const breakStages = 10;
  const breakTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');

    // Create crack pattern based on break progress
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 16, 16);

    const stage = Math.floor(breakProgress * breakStages);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;

    // Draw cracks based on stage
    for (let i = 0; i <= stage; i++) {
      const x1 = Math.random() * 16;
      const y1 = Math.random() * 16;
      const x2 = x1 + (Math.random() - 0.5) * 10;
      const y2 = y1 + (Math.random() - 0.5) * 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
  }, [breakProgress]);

  return (
    <>
      {/* Block selection highlight */}
      <mesh ref={highlightRef} visible={false}>
        <boxGeometry args={[1.01, 1.01, 1.01]} />
        <meshBasicMaterial
          color={0x000000}
          transparent
          opacity={0.2}
          wireframe
          wireframeLinewidth={2}
        />
      </mesh>

      {/* Block outline */}
      <lineSegments ref={highlightRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.005, 1.005, 1.005)]} />
        <lineBasicMaterial color={0x000000} linewidth={2} />
      </lineSegments>

      {/* Breaking overlay */}
      <mesh ref={breakOverlayRef} visible={false}>
        <boxGeometry args={[1.01, 1.01, 1.01]} />
        <meshBasicMaterial
          color={0x000000}
          transparent
          opacity={breakProgress * 0.5}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default BlockInteraction;
