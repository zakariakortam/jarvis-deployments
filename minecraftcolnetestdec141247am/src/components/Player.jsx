import { useRef, useEffect, useCallback, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import {
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_EYE_HEIGHT,
  GRAVITY,
  JUMP_VELOCITY,
  WALK_SPEED,
  SPRINT_SPEED,
  FLY_SPEED,
  CHUNK_SIZE,
  CHUNK_HEIGHT,
  BLOCK_TYPES,
  BLOCK_PROPERTIES,
} from '../utils/constants';

// Key state tracking
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  sneak: false,
};

export function Player({ onBlockInteraction }) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  // Store state
  const player = useGameStore(state => state.player);
  const updatePlayerPosition = useGameStore(state => state.updatePlayerPosition);
  const updatePlayerVelocity = useGameStore(state => state.updatePlayerVelocity);
  const setPlayerOnGround = useGameStore(state => state.setPlayerOnGround);
  const setPlayerFlying = useGameStore(state => state.setPlayerFlying);
  const setPlayerSprinting = useGameStore(state => state.setPlayerSprinting);
  const setPlayerSneaking = useGameStore(state => state.setPlayerSneaking);
  const chunks = useGameStore(state => state.chunks);
  const modifiedBlocks = useGameStore(state => state.modifiedBlocks);
  const getModifiedBlock = useGameStore(state => state.getModifiedBlock);
  const isPlaying = useGameStore(state => state.isPlaying);
  const isPaused = useGameStore(state => state.isPaused);
  const showInventory = useGameStore(state => state.showInventory);
  const selectSlot = useGameStore(state => state.selectSlot);
  const toggleInventory = useGameStore(state => state.toggleInventory);
  const toggleDebug = useGameStore(state => state.toggleDebug);
  const pauseGame = useGameStore(state => state.pauseGame);

  // Local state
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const lastJumpTime = useRef(0);
  const jumpCount = useRef(0);

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

  // Check if a position is solid
  const isSolid = useCallback((x, y, z) => {
    const block = getBlockAt(x, y, z);
    const props = BLOCK_PROPERTIES[block];
    return props && props.solid;
  }, [getBlockAt]);

  // Collision detection
  const checkCollision = useCallback((pos) => {
    const halfWidth = PLAYER_WIDTH / 2;
    const height = PLAYER_HEIGHT;

    // Check corners of player bounding box
    const corners = [
      [pos.x - halfWidth, pos.y, pos.z - halfWidth],
      [pos.x + halfWidth, pos.y, pos.z - halfWidth],
      [pos.x - halfWidth, pos.y, pos.z + halfWidth],
      [pos.x + halfWidth, pos.y, pos.z + halfWidth],
      [pos.x - halfWidth, pos.y + height, pos.z - halfWidth],
      [pos.x + halfWidth, pos.y + height, pos.z - halfWidth],
      [pos.x - halfWidth, pos.y + height, pos.z + halfWidth],
      [pos.x + halfWidth, pos.y + height, pos.z + halfWidth],
    ];

    for (const [cx, cy, cz] of corners) {
      if (isSolid(cx, cy, cz)) {
        return true;
      }
    }
    return false;
  }, [isSolid]);

  // Check if on ground
  const checkGround = useCallback((pos) => {
    const halfWidth = PLAYER_WIDTH / 2;
    const checkY = pos.y - 0.01;

    return (
      isSolid(pos.x - halfWidth, checkY, pos.z - halfWidth) ||
      isSolid(pos.x + halfWidth, checkY, pos.z - halfWidth) ||
      isSolid(pos.x - halfWidth, checkY, pos.z + halfWidth) ||
      isSolid(pos.x + halfWidth, checkY, pos.z + halfWidth)
    );
  }, [isSolid]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || isPaused || showInventory) return;

      switch (e.code) {
        case 'KeyW': keys.forward = true; break;
        case 'KeyS': keys.backward = true; break;
        case 'KeyA': keys.left = true; break;
        case 'KeyD': keys.right = true; break;
        case 'Space':
          keys.jump = true;
          // Double-tap space for flying
          const now = Date.now();
          if (now - lastJumpTime.current < 300) {
            setPlayerFlying(!player.isFlying);
          }
          lastJumpTime.current = now;
          break;
        case 'ShiftLeft': keys.sprint = true; break;
        case 'ControlLeft': keys.sneak = true; break;
        case 'KeyE': toggleInventory(); break;
        case 'KeyF': setPlayerFlying(!player.isFlying); break;
        case 'F3':
          e.preventDefault();
          toggleDebug();
          break;
        case 'Escape':
          pauseGame();
          break;
        case 'Digit1': selectSlot(0); break;
        case 'Digit2': selectSlot(1); break;
        case 'Digit3': selectSlot(2); break;
        case 'Digit4': selectSlot(3); break;
        case 'Digit5': selectSlot(4); break;
        case 'Digit6': selectSlot(5); break;
        case 'Digit7': selectSlot(6); break;
        case 'Digit8': selectSlot(7); break;
        case 'Digit9': selectSlot(8); break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': keys.forward = false; break;
        case 'KeyS': keys.backward = false; break;
        case 'KeyA': keys.left = false; break;
        case 'KeyD': keys.right = false; break;
        case 'Space': keys.jump = false; break;
        case 'ShiftLeft': keys.sprint = false; break;
        case 'ControlLeft': keys.sneak = false; break;
      }
    };

    const handleWheel = (e) => {
      if (!isPlaying || isPaused || showInventory) return;

      const delta = Math.sign(e.deltaY);
      let newSlot = player.selectedSlot + delta;
      if (newSlot < 0) newSlot = 8;
      if (newSlot > 8) newSlot = 0;
      selectSlot(newSlot);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isPlaying, isPaused, showInventory, player.isFlying, player.selectedSlot]);

  // Mouse click handler
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (!isPlaying || isPaused || showInventory) return;
      if (!controlsRef.current?.isLocked) return;

      if (e.button === 0) {
        // Left click - break block
        onBlockInteraction?.('break');
      } else if (e.button === 2) {
        // Right click - place block
        onBlockInteraction?.('place');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isPlaying, isPaused, showInventory, gl.domElement, onBlockInteraction]);

  // Game loop
  useFrame((state, delta) => {
    if (!isPlaying || isPaused || showInventory) return;
    if (!controlsRef.current?.isLocked) return;

    const dt = Math.min(delta, 0.1); // Cap delta to prevent physics issues

    // Get movement direction from camera
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    // Calculate movement input
    direction.current.set(0, 0, 0);
    if (keys.forward) direction.current.add(cameraDirection);
    if (keys.backward) direction.current.sub(cameraDirection);
    if (keys.left) direction.current.sub(cameraRight);
    if (keys.right) direction.current.add(cameraRight);
    direction.current.normalize();

    // Determine speed
    let speed = WALK_SPEED;
    if (player.isFlying) {
      speed = FLY_SPEED;
    } else if (keys.sprint && keys.forward) {
      speed = SPRINT_SPEED;
      setPlayerSprinting(true);
    } else {
      setPlayerSprinting(false);
    }

    // Apply sneaking speed reduction
    if (keys.sneak) {
      speed *= 0.3;
      setPlayerSneaking(true);
    } else {
      setPlayerSneaking(false);
    }

    // Current position
    const pos = new THREE.Vector3(...player.position);
    const newPos = pos.clone();

    // Flying movement
    if (player.isFlying) {
      newPos.x += direction.current.x * speed * dt;
      newPos.z += direction.current.z * speed * dt;

      if (keys.jump) newPos.y += speed * dt;
      if (keys.sneak) newPos.y -= speed * dt;

      velocity.current.set(0, 0, 0);
    } else {
      // Ground movement with physics
      const isOnGround = checkGround(pos);
      setPlayerOnGround(isOnGround);

      // Horizontal movement
      newPos.x += direction.current.x * speed * dt;
      newPos.z += direction.current.z * speed * dt;

      // Apply gravity
      if (!isOnGround) {
        velocity.current.y -= GRAVITY * dt;
      } else {
        if (velocity.current.y < 0) velocity.current.y = 0;

        // Jump
        if (keys.jump) {
          velocity.current.y = JUMP_VELOCITY;
        }
      }

      // Apply vertical velocity
      newPos.y += velocity.current.y * dt;
    }

    // Collision resolution
    const finalPos = pos.clone();

    // X-axis collision
    const testX = pos.clone();
    testX.x = newPos.x;
    if (!checkCollision(testX)) {
      finalPos.x = newPos.x;
    }

    // Z-axis collision
    const testZ = finalPos.clone();
    testZ.z = newPos.z;
    if (!checkCollision(testZ)) {
      finalPos.z = newPos.z;
    }

    // Y-axis collision
    const testY = finalPos.clone();
    testY.y = newPos.y;
    if (!checkCollision(testY)) {
      finalPos.y = newPos.y;
    } else {
      // Hit ceiling or floor
      if (velocity.current.y > 0) {
        velocity.current.y = 0;
      } else if (velocity.current.y < 0) {
        velocity.current.y = 0;
        // Find ground level
        while (checkCollision(finalPos) && finalPos.y < pos.y + 1) {
          finalPos.y += 0.1;
        }
      }
    }

    // Keep player above bedrock
    if (finalPos.y < 1) finalPos.y = 1;

    // Update camera and store
    camera.position.set(finalPos.x, finalPos.y + PLAYER_EYE_HEIGHT, finalPos.z);
    updatePlayerPosition([finalPos.x, finalPos.y, finalPos.z]);
    updatePlayerVelocity([velocity.current.x, velocity.current.y, velocity.current.z]);
  });

  // Handle pointer lock
  const handleLock = () => {
    if (!isPaused && !showInventory && isPlaying) {
      controlsRef.current?.lock();
    }
  };

  return (
    <>
      <PointerLockControls
        ref={controlsRef}
        args={[camera, gl.domElement]}
        onLock={() => {}}
        onUnlock={() => {}}
      />
      {/* Click to lock pointer */}
      {isPlaying && !isPaused && !showInventory && (
        <mesh visible={false} onClick={handleLock}>
          <planeGeometry args={[1000, 1000]} />
        </mesh>
      )}
    </>
  );
}

export default Player;
