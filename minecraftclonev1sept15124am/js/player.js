/**
 * Player Movement and Physics System
 * Handles first-person controls, collision detection, and physics
 */
class Player {
    constructor(world, camera) {
        this.world = world;
        this.camera = camera;
        
        // Player properties
        this.position = new THREE.Vector3(0, 70, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Physics constants
        this.gravity = -0.02;
        this.jumpForce = 0.3;
        this.walkSpeed = 0.1;
        this.runSpeed = 0.2;
        this.friction = 0.8;
        this.airResistance = 0.98;
        
        // Player dimensions
        this.height = 1.8;
        this.width = 0.6;
        this.eyeHeight = 1.6;
        
        // State
        this.onGround = false;
        this.isRunning = false;
        this.isFlying = false;
        this.inWater = false;
        this.health = 100;
        this.hunger = 100;
        
        // Input tracking
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            run: false
        };
        
        this.mouse = {
            sensitivity: 0.002,
            locked: false,
            x: 0,
            y: 0
        };
        
        // Initialize controls
        this.setupControls();
        this.setupPhysics();
        
        // Update camera position
        this.updateCamera();
    }

    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Mouse events
        document.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        
        document.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        // Pointer lock
        document.addEventListener('click', () => {
            if (!this.mouse.locked) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === document.body;
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    handleKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                event.preventDefault();
                break;
            case 'ShiftLeft':
                this.keys.crouch = true;
                break;
            case 'ControlLeft':
                this.keys.run = true;
                break;
            case 'KeyF':
                this.toggleFlying();
                break;
            case 'Escape':
                document.exitPointerLock();
                break;
        }
    }

    handleKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
                this.keys.crouch = false;
                break;
            case 'ControlLeft':
                this.keys.run = false;
                break;
        }
    }

    handleMouseDown(event) {
        if (!this.mouse.locked) return;
        
        event.preventDefault();
        
        if (event.button === 0) { // Left click - break block
            this.breakBlock();
        } else if (event.button === 2) { // Right click - place block
            this.placeBlock();
        }
    }

    handleMouseUp(event) {
        // Handle mouse release if needed
    }

    handleMouseMove(event) {
        if (!this.mouse.locked) return;
        
        const deltaX = event.movementX * this.mouse.sensitivity;
        const deltaY = event.movementY * this.mouse.sensitivity;
        
        // Update rotation
        this.rotation.y -= deltaX;
        this.rotation.x -= deltaY;
        
        // Clamp vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        // Apply rotation to camera
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.x = this.rotation.x;
        this.camera.rotation.y = this.rotation.y;
    }

    setupPhysics() {
        // Physics world setup if needed
        this.boundingBox = new THREE.Box3();
        this.updateBoundingBox();
    }

    updateBoundingBox() {
        const halfWidth = this.width / 2;
        this.boundingBox.setFromCenterAndSize(
            this.position.clone().add(new THREE.Vector3(0, this.height / 2, 0)),
            new THREE.Vector3(this.width, this.height, this.width)
        );
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.applyPhysics(deltaTime);
        this.checkCollisions();
        this.updateEnvironmentalEffects();
        this.updateCamera();
        this.updateBoundingBox();
    }

    handleInput(deltaTime) {
        if (!this.mouse.locked) return;
        
        const moveVector = new THREE.Vector3(0, 0, 0);
        
        // Calculate movement direction
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;
        
        // Normalize movement vector
        if (moveVector.length() > 0) {
            moveVector.normalize();
            
            // Apply rotation to movement
            moveVector.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            
            // Calculate speed
            let speed = this.walkSpeed;
            if (this.keys.run && this.onGround) {
                speed = this.runSpeed;
                this.isRunning = true;
            } else {
                this.isRunning = false;
            }
            
            // Apply movement
            this.velocity.x += moveVector.x * speed;
            this.velocity.z += moveVector.z * speed;
        }
        
        // Jumping
        if (this.keys.jump) {
            if (this.isFlying) {
                this.velocity.y = this.walkSpeed;
            } else if (this.onGround) {
                this.velocity.y = this.jumpForce;
                this.onGround = false;
            }
        }
        
        // Crouching/descending
        if (this.keys.crouch) {
            if (this.isFlying) {
                this.velocity.y = -this.walkSpeed;
            }
        }
    }

    applyPhysics(deltaTime) {
        // Apply gravity
        if (!this.isFlying) {
            this.velocity.y += this.gravity;
        } else {
            this.velocity.y *= this.friction; // Flying friction
        }
        
        // Apply friction
        if (this.onGround) {
            this.velocity.x *= this.friction;
            this.velocity.z *= this.friction;
        } else {
            this.velocity.x *= this.airResistance;
            this.velocity.z *= this.airResistance;
        }
        
        // Apply velocity to position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime * 60));
        
        // Terminal velocity
        this.velocity.y = Math.max(-1, Math.min(1, this.velocity.y));
    }

    checkCollisions() {
        this.onGround = false;
        
        // Check ground collision
        const groundY = Math.floor(this.position.y - this.height / 2);
        const blockBelow = this.world.getBlock(
            Math.floor(this.position.x),
            groundY,
            Math.floor(this.position.z)
        );
        
        if (this.world.blockSystem.isSolid(blockBelow)) {
            const groundLevel = groundY + 1;
            if (this.position.y - this.height / 2 <= groundLevel) {
                this.position.y = groundLevel + this.height / 2;
                this.velocity.y = Math.max(0, this.velocity.y);
                this.onGround = true;
            }
        }
        
        // Check horizontal collisions
        this.checkHorizontalCollisions();
        
        // Check ceiling collision
        this.checkCeilingCollision();
        
        // Prevent falling through world
        if (this.position.y < -10) {
            this.position.y = 100;
            this.velocity.y = 0;
            this.takeDamage(50); // Fall damage
        }
    }

    checkHorizontalCollisions() {
        const positions = [
            { x: this.position.x + this.width/2, z: this.position.z },
            { x: this.position.x - this.width/2, z: this.position.z },
            { x: this.position.x, z: this.position.z + this.width/2 },
            { x: this.position.x, z: this.position.z - this.width/2 }
        ];
        
        for (const pos of positions) {
            const blockX = Math.floor(pos.x);
            const blockZ = Math.floor(pos.z);
            const blockY = Math.floor(this.position.y);
            
            const block = this.world.getBlock(blockX, blockY, blockZ);
            
            if (this.world.blockSystem.isSolid(block)) {
                // Simple collision response
                if (Math.abs(pos.x - this.position.x) > Math.abs(pos.z - this.position.z)) {
                    // X collision
                    this.velocity.x = 0;
                    if (pos.x > this.position.x) {
                        this.position.x = blockX - this.width/2 - 0.01;
                    } else {
                        this.position.x = blockX + 1 + this.width/2 + 0.01;
                    }
                } else {
                    // Z collision
                    this.velocity.z = 0;
                    if (pos.z > this.position.z) {
                        this.position.z = blockZ - this.width/2 - 0.01;
                    } else {
                        this.position.z = blockZ + 1 + this.width/2 + 0.01;
                    }
                }
            }
        }
    }

    checkCeilingCollision() {
        const ceilingY = Math.floor(this.position.y + this.eyeHeight);
        const blockAbove = this.world.getBlock(
            Math.floor(this.position.x),
            ceilingY,
            Math.floor(this.position.z)
        );
        
        if (this.world.blockSystem.isSolid(blockAbove) && this.velocity.y > 0) {
            this.velocity.y = 0;
            this.position.y = ceilingY - this.eyeHeight - 0.01;
        }
    }

    updateEnvironmentalEffects() {
        // Check if in water
        const blockAtEye = this.world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y + this.eyeHeight - 0.5),
            Math.floor(this.position.z)
        );
        
        this.inWater = blockAtEye === 'water';
        
        if (this.inWater) {
            // Slower movement and different physics in water
            this.velocity.multiplyScalar(0.8);
            this.velocity.y += 0.01; // Buoyancy
        }
        
        // Check for damage from lava
        const blockAtFeet = this.world.getBlock(
            Math.floor(this.position.x),
            Math.floor(this.position.y - this.height/2),
            Math.floor(this.position.z)
        );
        
        if (blockAtFeet === 'lava' || blockAtEye === 'lava') {
            this.takeDamage(4); // Lava damage
        }
    }

    updateCamera() {
        // Position camera at eye level
        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight - this.height / 2;
        
        if (this.keys.crouch && this.onGround) {
            this.camera.position.y -= 0.3; // Crouch offset
        }
    }

    breakBlock() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const raycast = this.world.raycast(this.camera.position, direction, 10);
        
        if (raycast.hit) {
            const blockType = this.world.blockSystem.getBlockType(raycast.blockId);
            
            // Check if block is breakable
            if (blockType.hardness >= 0) {
                // Add break animation/sound here
                this.world.setBlock(raycast.position.x, raycast.position.y, raycast.position.z, 'air');
                
                // Add items to inventory (simplified)
                console.log(`Broke ${blockType.name} at ${raycast.position.x}, ${raycast.position.y}, ${raycast.position.z}`);
            }
        }
    }

    placeBlock() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const raycast = this.world.raycast(this.camera.position, direction, 10);
        
        if (raycast.hit) {
            const placePos = this.world.getPlacementPosition(raycast.position, this.camera.position, direction);
            
            if (placePos) {
                // Check if placement position conflicts with player
                const distance = placePos.distanceTo(this.position);
                if (distance > this.width) {
                    // Get selected block type (simplified)
                    const selectedBlock = this.getSelectedBlock();
                    this.world.setBlock(placePos.x, placePos.y, placePos.z, selectedBlock);
                    console.log(`Placed ${selectedBlock} at ${placePos.x}, ${placePos.y}, ${placePos.z}`);
                }
            }
        }
    }

    getSelectedBlock() {
        // Get selected block from inventory (simplified)
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        const selectedSlot = document.querySelector('.inventory-slot.selected');
        return selectedSlot ? selectedSlot.dataset.block : 'grass';
    }

    toggleFlying() {
        this.isFlying = !this.isFlying;
        if (this.isFlying) {
            this.velocity.y = 0; // Stop falling when starting to fly
        }
        console.log(`Flying: ${this.isFlying ? 'ON' : 'OFF'}`);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        console.log(`Health: ${this.health}`);
        
        if (this.health <= 0) {
            this.respawn();
        }
    }

    respawn() {
        this.position.set(0, 100, 0);
        this.velocity.set(0, 0, 0);
        this.health = 100;
        console.log('Respawned!');
    }

    getPosition() {
        return this.position.clone();
    }

    getDebugInfo() {
        return {
            position: {
                x: Math.round(this.position.x * 10) / 10,
                y: Math.round(this.position.y * 10) / 10,
                z: Math.round(this.position.z * 10) / 10
            },
            velocity: {
                x: Math.round(this.velocity.x * 100) / 100,
                y: Math.round(this.velocity.y * 100) / 100,
                z: Math.round(this.velocity.z * 100) / 100
            },
            onGround: this.onGround,
            isFlying: this.isFlying,
            inWater: this.inWater,
            health: this.health
        };
    }
}