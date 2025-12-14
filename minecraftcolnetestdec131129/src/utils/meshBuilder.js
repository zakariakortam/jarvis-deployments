import * as THREE from 'three';
import { BLOCK_TYPES, BLOCK_PROPERTIES, CHUNK_SIZE, CHUNK_HEIGHT } from './constants';
import { getBlockUV, ATLAS_SIZE } from './textureGenerator';

// Face definitions for cube geometry
// Each face has 4 corners that form a quad
// For THREE.js FrontSide rendering with CCW winding:
// - Triangle indices 0,1,2 and 2,3,0 form two CCW triangles when viewed from outside
// - Corners are ordered: bottom-left, bottom-right, top-right, top-left (when facing the face)
// UV coordinates map to texture atlas positions
const FACES = {
  // TOP face (normal +Y) - viewed from above
  TOP: {
    dir: [0, 1, 0],
    corners: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
    uvCorners: [[0, 0], [0, 1], [1, 1], [1, 0]],
    name: 'top'
  },
  // BOTTOM face (normal -Y) - viewed from below
  BOTTOM: {
    dir: [0, -1, 0],
    corners: [[0, 0, 1], [0, 0, 0], [1, 0, 0], [1, 0, 1]],
    uvCorners: [[0, 1], [0, 0], [1, 0], [1, 1]],
    name: 'bottom'
  },
  // FRONT face (normal +Z) - viewed from front
  FRONT: {
    dir: [0, 0, 1],
    corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    uvCorners: [[0, 1], [1, 1], [1, 0], [0, 0]],
    name: 'front'
  },
  // BACK face (normal -Z) - viewed from back
  BACK: {
    dir: [0, 0, -1],
    corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
    uvCorners: [[0, 1], [1, 1], [1, 0], [0, 0]],
    name: 'back'
  },
  // RIGHT face (normal +X) - viewed from right
  RIGHT: {
    dir: [1, 0, 0],
    corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    uvCorners: [[0, 1], [1, 1], [1, 0], [0, 0]],
    name: 'right'
  },
  // LEFT face (normal -X) - viewed from left
  LEFT: {
    dir: [-1, 0, 0],
    corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    uvCorners: [[0, 1], [1, 1], [1, 0], [0, 0]],
    name: 'left'
  },
};

// Convert hex color to RGB array
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [1, 1, 1];
}

// Get color for a block face (used for vertex colors/tinting)
function getBlockFaceColor(blockType, faceName) {
  // For textured blocks, we use white to show true texture colors
  // But we can add subtle tinting for biome effects later
  return [1, 1, 1];
}

export class ChunkMeshBuilder {
  constructor(textureMap = null) {
    this.textureMap = textureMap;
    this.positions = [];
    this.normals = [];
    this.uvs = [];
    this.colors = [];
    this.indices = [];
    this.transparentPositions = [];
    this.transparentNormals = [];
    this.transparentUvs = [];
    this.transparentColors = [];
    this.transparentIndices = [];
  }

  setTextureMap(textureMap) {
    this.textureMap = textureMap;
  }

  // Build mesh for a chunk
  buildChunkMesh(chunk, getNeighborBlock) {
    this.positions = [];
    this.normals = [];
    this.uvs = [];
    this.colors = [];
    this.indices = [];
    this.transparentPositions = [];
    this.transparentNormals = [];
    this.transparentUvs = [];
    this.transparentColors = [];
    this.transparentIndices = [];

    const { blocks, chunkX, chunkZ } = chunk;

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
          const blockType = blocks[y * CHUNK_SIZE * CHUNK_SIZE + z * CHUNK_SIZE + x];

          if (blockType === BLOCK_TYPES.AIR) continue;

          const props = BLOCK_PROPERTIES[blockType];
          if (!props) continue;

          // Use LOCAL coordinates for mesh vertices (chunk is positioned by the Chunk component)
          // World coordinates only for neighbor lookups
          const worldX = chunkX * CHUNK_SIZE + x;
          const worldZ = chunkZ * CHUNK_SIZE + z;

          // Check each face
          for (const [faceName, face] of Object.entries(FACES)) {
            const neighborX = x + face.dir[0];
            const neighborY = y + face.dir[1];
            const neighborZ = z + face.dir[2];

            let neighborBlock;
            if (neighborX < 0 || neighborX >= CHUNK_SIZE || neighborZ < 0 || neighborZ >= CHUNK_SIZE) {
              // Get from neighbor chunk using WORLD coordinates
              neighborBlock = getNeighborBlock(
                worldX + face.dir[0],
                neighborY,
                worldZ + face.dir[2]
              );
            } else if (neighborY < 0 || neighborY >= CHUNK_HEIGHT) {
              neighborBlock = BLOCK_TYPES.AIR;
            } else {
              neighborBlock = blocks[neighborY * CHUNK_SIZE * CHUNK_SIZE + neighborZ * CHUNK_SIZE + neighborX];
            }

            const neighborProps = BLOCK_PROPERTIES[neighborBlock];
            const neighborTransparent = neighborProps ? neighborProps.transparent : true;

            // Skip face if neighbor is solid and opaque
            if (!neighborTransparent && neighborBlock !== BLOCK_TYPES.AIR) continue;

            // For transparent blocks, only render face if neighbor is different
            if (props.transparent && neighborBlock === blockType) continue;

            // Add face using LOCAL coordinates (x, z) - NOT world coordinates!
            // The Chunk component positions the mesh group at chunk world position
            this.addFace(
              x, y, z,  // LOCAL coordinates within chunk
              face,
              blockType,
              props.transparent
            );
          }
        }
      }
    }

    return this.createGeometries();
  }

  // Add a face to the mesh data
  addFace(x, y, z, face, blockType, isTransparent) {
    const positions = isTransparent ? this.transparentPositions : this.positions;
    const normals = isTransparent ? this.transparentNormals : this.normals;
    const uvs = isTransparent ? this.transparentUvs : this.uvs;
    const colors = isTransparent ? this.transparentColors : this.colors;
    const indices = isTransparent ? this.transparentIndices : this.indices;

    const baseIndex = positions.length / 3;

    // Get UV coordinates from texture atlas
    let uv;
    if (this.textureMap) {
      uv = getBlockUV(this.textureMap, blockType, face.name, ATLAS_SIZE);
    } else {
      // Fallback UV mapping
      uv = { u0: 0, v0: 0, u1: 1, v1: 1 };
    }

    // Apply face-based lighting for depth perception
    let lightFactor = 1.0;
    switch (face.name) {
      case 'top': lightFactor = 1.0; break;
      case 'bottom': lightFactor = 0.5; break;
      case 'front':
      case 'back': lightFactor = 0.8; break;
      case 'left':
      case 'right': lightFactor = 0.7; break;
    }

    // Add vertices
    for (let i = 0; i < face.corners.length; i++) {
      const corner = face.corners[i];
      const uvCorner = face.uvCorners[i];

      positions.push(x + corner[0], y + corner[1], z + corner[2]);
      normals.push(face.dir[0], face.dir[1], face.dir[2]);

      // Calculate UV from atlas position
      const u = uv.u0 + uvCorner[0] * (uv.u1 - uv.u0);
      const v = uv.v0 + uvCorner[1] * (uv.v1 - uv.v0);
      uvs.push(u, v);

      // Vertex colors for lighting (white with light factor)
      colors.push(lightFactor, lightFactor, lightFactor);
    }

    // Add indices (two triangles per face)
    // CCW winding: 0-1-2 and 0-2-3 when corners are ordered BL, BR, TR, TL
    indices.push(
      baseIndex, baseIndex + 1, baseIndex + 2,
      baseIndex, baseIndex + 2, baseIndex + 3
    );
  }

  // Create Three.js geometries from mesh data
  createGeometries() {
    const solidGeometry = new THREE.BufferGeometry();
    const transparentGeometry = new THREE.BufferGeometry();

    // Solid geometry
    if (this.positions.length > 0) {
      solidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
      solidGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
      solidGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.uvs, 2));
      solidGeometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
      solidGeometry.setIndex(this.indices);
      solidGeometry.computeBoundingSphere();
    }

    // Transparent geometry
    if (this.transparentPositions.length > 0) {
      transparentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(this.transparentPositions, 3));
      transparentGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(this.transparentNormals, 3));
      transparentGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(this.transparentUvs, 2));
      transparentGeometry.setAttribute('color', new THREE.Float32BufferAttribute(this.transparentColors, 3));
      transparentGeometry.setIndex(this.transparentIndices);
      transparentGeometry.computeBoundingSphere();
    }

    return {
      solid: solidGeometry,
      transparent: transparentGeometry,
      triangleCount: (this.indices.length + this.transparentIndices.length) / 3
    };
  }
}

// Create materials for chunk rendering
export function createChunkMaterials(atlasTexture = null) {
  const materialOptions = {
    vertexColors: true,
    side: THREE.FrontSide,
  };

  if (atlasTexture) {
    materialOptions.map = atlasTexture;
  }

  const solidMaterial = new THREE.MeshLambertMaterial(materialOptions);

  const transparentMaterialOptions = {
    ...materialOptions,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
    alphaTest: 0.1,
  };

  const transparentMaterial = new THREE.MeshLambertMaterial(transparentMaterialOptions);

  const waterMaterial = new THREE.MeshLambertMaterial({
    map: atlasTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  return { solidMaterial, transparentMaterial, waterMaterial };
}

export default ChunkMeshBuilder;
