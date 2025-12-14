import { useRef, useEffect, useMemo, useState, memo, useCallback, createContext, useContext } from 'react';
import * as THREE from 'three';
import { ChunkMeshBuilder, createChunkMaterials } from '../utils/meshBuilder';
import { createTextureAtlas } from '../utils/textureGenerator';
import { CHUNK_SIZE, CHUNK_HEIGHT } from '../utils/constants';
import useGameStore from '../store/gameStore';

// Texture context for sharing atlas and materials across chunks
const TextureContext = createContext(null);

// Texture provider component - creates and shares texture atlas and materials
export function TextureProvider({ children }) {
  const [textureData, setTextureData] = useState(null);

  useEffect(() => {
    // Generate texture atlas on mount
    const atlas = createTextureAtlas();

    // Create shared materials with the texture
    const materials = createChunkMaterials(atlas.texture);

    setTextureData({
      ...atlas,
      materials
    });

    return () => {
      // Cleanup texture and materials
      if (atlas?.texture) {
        atlas.texture.dispose();
      }
      if (materials) {
        materials.solidMaterial?.dispose();
        materials.transparentMaterial?.dispose();
        materials.waterMaterial?.dispose();
      }
    };
  }, []);

  return (
    <TextureContext.Provider value={textureData}>
      {children}
    </TextureContext.Provider>
  );
}

// Hook to use texture context
export function useTextures() {
  return useContext(TextureContext);
}

// Fallback materials for when texture isn't ready
let fallbackMaterials = null;
function getFallbackMaterials() {
  if (!fallbackMaterials) {
    fallbackMaterials = createChunkMaterials(null);
  }
  return fallbackMaterials;
}

// Individual chunk component - memoized to prevent unnecessary re-renders
const Chunk = memo(function Chunk({ chunkX, chunkZ, chunkData, getNeighborBlock, onMeshBuilt, textureData }) {
  const solidMeshRef = useRef();
  const transparentMeshRef = useRef();
  const geometryRef = useRef({ solid: null, transparent: null });

  // Build mesh when chunk data changes
  const chunkVersion = chunkData?.version || 0;
  const blocksRef = useRef(chunkData?.blocks);

  useEffect(() => {
    if (!chunkData || !chunkData.blocks) return;

    blocksRef.current = chunkData.blocks;

    // Dispose old geometry
    if (geometryRef.current.solid) {
      geometryRef.current.solid.dispose();
    }
    if (geometryRef.current.transparent) {
      geometryRef.current.transparent.dispose();
    }

    // Create builder with texture map
    const builder = new ChunkMeshBuilder(textureData?.textureMap || null);
    const { solid, transparent, triangleCount } = builder.buildChunkMesh(
      chunkData,
      getNeighborBlock
    );

    geometryRef.current = { solid, transparent };

    // Update mesh refs directly instead of using state
    if (solidMeshRef.current) {
      solidMeshRef.current.geometry = solid;
    }
    if (transparentMeshRef.current) {
      transparentMeshRef.current.geometry = transparent;
    }

    if (onMeshBuilt) {
      onMeshBuilt(triangleCount);
    }

    // Cleanup on unmount
    return () => {
      if (geometryRef.current.solid) {
        geometryRef.current.solid.dispose();
      }
      if (geometryRef.current.transparent) {
        geometryRef.current.transparent.dispose();
      }
    };
  }, [chunkData?.blocks, chunkVersion, chunkX, chunkZ, textureData]);

  const position = useMemo(() => [chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE], [chunkX, chunkZ]);

  // Initial geometry (empty)
  const emptyGeometry = useMemo(() => new THREE.BufferGeometry(), []);

  // Use shared materials from context or fallback
  const materials = textureData?.materials || getFallbackMaterials();

  return (
    <group position={position}>
      {/* Solid blocks */}
      <mesh
        ref={solidMeshRef}
        geometry={geometryRef.current.solid || emptyGeometry}
        material={materials.solidMaterial}
        frustumCulled={true}
      />
      {/* Transparent blocks (leaves, glass, water) */}
      <mesh
        ref={transparentMeshRef}
        geometry={geometryRef.current.transparent || emptyGeometry}
        material={materials.transparentMaterial}
        frustumCulled={true}
      />
    </group>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if chunk data version changed
  return prevProps.chunkX === nextProps.chunkX &&
    prevProps.chunkZ === nextProps.chunkZ &&
    prevProps.chunkData?.version === nextProps.chunkData?.version &&
    prevProps.chunkData?.blocks === nextProps.chunkData?.blocks &&
    prevProps.textureData === nextProps.textureData;
});

// Chunk manager handles loading/unloading chunks around player
export function ChunkManager({ renderDistance = 4 }) {
  const playerPosition = useGameStore(state => state.player.position);
  const chunks = useGameStore(state => state.chunks);
  const getModifiedBlock = useGameStore(state => state.getModifiedBlock);
  const setTriangleCount = useGameStore(state => state.setTriangleCount);
  const isPlaying = useGameStore(state => state.isPlaying);
  const modifiedBlocks = useGameStore(state => state.modifiedBlocks);

  // Get texture data from context
  const textureData = useTextures();

  const triangleCounts = useRef(new Map());
  const lastPlayerChunk = useRef({ x: null, z: null });

  // Only recalculate visible chunks when player moves to a new chunk
  const playerChunkX = Math.floor(playerPosition[0] / CHUNK_SIZE);
  const playerChunkZ = Math.floor(playerPosition[2] / CHUNK_SIZE);

  // Memoize visible chunk keys - only changes when player chunk changes
  const visibleChunkKeys = useMemo(() => {
    if (!isPlaying) return [];

    const keys = [];
    for (let x = -renderDistance; x <= renderDistance; x++) {
      for (let z = -renderDistance; z <= renderDistance; z++) {
        // Circular render distance
        if (x * x + z * z <= renderDistance * renderDistance) {
          keys.push(`${playerChunkX + x},${playerChunkZ + z}`);
        }
      }
    }
    return keys;
  }, [playerChunkX, playerChunkZ, renderDistance, isPlaying]);

  // Stable getBlockAt function using refs to access current state
  const chunksRef = useRef(chunks);
  const modifiedBlocksRef = useRef(modifiedBlocks);
  chunksRef.current = chunks;
  modifiedBlocksRef.current = modifiedBlocks;

  const getBlockAt = useCallback((x, y, z) => {
    // Check modified blocks first using store directly
    const modified = useGameStore.getState().getModifiedBlock(x, y, z);
    if (modified !== undefined) return modified;

    // Get from chunk
    const chunkX = Math.floor(x / CHUNK_SIZE);
    const chunkZ = Math.floor(z / CHUNK_SIZE);
    const key = `${chunkX},${chunkZ}`;
    const chunk = chunksRef.current.get(key);

    if (!chunk || !chunk.blocks) return 0; // AIR

    const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    if (y < 0 || y >= CHUNK_HEIGHT) return 0;

    return chunk.blocks[y * CHUNK_SIZE * CHUNK_SIZE + localZ * CHUNK_SIZE + localX];
  }, []);

  // Stable mesh built callback
  const handleMeshBuilt = useCallback((chunkKey, triangleCount) => {
    triangleCounts.current.set(chunkKey, triangleCount);

    let total = 0;
    triangleCounts.current.forEach(count => total += count);
    setTriangleCount(total);
  }, [setTriangleCount]);

  // Render chunks - memoized
  const chunkElements = useMemo(() => {
    return visibleChunkKeys.map(key => {
      const chunk = chunks.get(key);
      if (!chunk) return null;

      const [x, z] = key.split(',').map(Number);

      return (
        <Chunk
          key={key}
          chunkX={x}
          chunkZ={z}
          chunkData={chunk}
          getNeighborBlock={getBlockAt}
          onMeshBuilt={(count) => handleMeshBuilt(key, count)}
          textureData={textureData}
        />
      );
    });
  }, [visibleChunkKeys, chunks, getBlockAt, handleMeshBuilt, textureData]);

  return <>{chunkElements}</>;
}

export default Chunk;
