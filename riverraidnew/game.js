// River Raid Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
const game = {
    score: 0,
    fuel: 100,
    lives: 3,
    paused: false,
    over: false,
    scrollSpeed: 2,
    frameCount: 0
};

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 30,
    height: 40,
    speed: 5,
    bullets: []
};

// River boundaries
let riverSections = [];
const RIVER_MIN_WIDTH = 150;
const RIVER_MAX_WIDTH = 400;

// Enemies
let enemies = [];

// Fuel tanks
let fuelTanks = [];

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'p' || e.key === 'P') {
        game.paused = !game.paused;
    }
    if (e.key === 'Enter' && game.over) {
        resetGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize river
function initRiver() {
    riverSections = [];
    for (let y = -100; y <= canvas.height; y += 20) {
        const width = RIVER_MIN_WIDTH + Math.random() * (RIVER_MAX_WIDTH - RIVER_MIN_WIDTH);
        const centerX = canvas.width / 2 + (Math.random() - 0.5) * 100;
        riverSections.push({
            y: y,
            left: centerX - width / 2,
            right: centerX + width / 2
        });
    }
}

// Update river
function updateRiver() {
    // Move sections down
    riverSections.forEach(section => {
        section.y += game.scrollSpeed;
    });

    // Remove old sections
    riverSections = riverSections.filter(section => section.y < canvas.height + 50);

    // Add new sections
    while (riverSections[0].y > -50) {
        const lastSection = riverSections[0];
        const width = RIVER_MIN_WIDTH + Math.random() * (RIVER_MAX_WIDTH - RIVER_MIN_WIDTH);
        const centerShift = (Math.random() - 0.5) * 50;
        const centerX = (lastSection.left + lastSection.right) / 2 + centerShift;
        
        riverSections.unshift({
            y: lastSection.y - 20,
            left: Math.max(50, centerX - width / 2),
            right: Math.min(canvas.width - 50, centerX + width / 2)
        });
    }
}

// Draw river
function drawRiver() {
    ctx.fillStyle = '#006';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#004';
    ctx.beginPath();
    riverSections.forEach((section, i) => {
        if (i === 0) {
            ctx.moveTo(section.left, section.y);
        } else {
            ctx.lineTo(section.left, section.y);
        }
    });
    riverSections.slice().reverse().forEach(section => {
        ctx.lineTo(section.right, section.y);
    });
    ctx.closePath();
    ctx.fill();
}

// Update player
function updatePlayer() {
    // Movement
    if (keys['ArrowLeft'] && player.x > player.width / 2) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width / 2) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] && player.y > 50) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - 50) {
        player.y += player.speed;
    }

    // Shooting
    if (keys[' '] && game.frameCount % 10 === 0) {
        player.bullets.push({
            x: player.x,
            y: player.y - player.height / 2,
            speed: 8
        });
    }

    // Update bullets
    player.bullets = player.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -10;
    });

    // Check river collision
    const playerSection = riverSections.find(section => 
        Math.abs(section.y - player.y) < 20
    );
    
    if (playerSection) {
        if (player.x - player.width/2 < playerSection.left || 
            player.x + player.width/2 > playerSection.right) {
            playerCrash();
        }
    }

    // Fuel consumption
    game.fuel -= 0.05;
    if (game.fuel <= 0) {
        playerCrash();
    }
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    // Draw plane shape
    ctx.moveTo(player.x, player.y - player.height/2);
    ctx.lineTo(player.x - player.width/2, player.y + player.height/2);
    ctx.lineTo(player.x - player.width/4, player.y + player.height/4);
    ctx.lineTo(player.x, player.y + player.height/3);
    ctx.lineTo(player.x + player.width/4, player.y + player.height/4);
    ctx.lineTo(player.x + player.width/2, player.y + player.height/2);
    ctx.closePath();
    ctx.fill();

    // Draw bullets
    ctx.fillStyle = '#ff0';
    player.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
    });
}

// Spawn enemies
function spawnEnemies() {
    if (game.frameCount % 100 === 0 && Math.random() < 0.7) {
        const section = riverSections[0];
        const x = section.left + Math.random() * (section.right - section.left);
        enemies.push({
            x: x,
            y: -30,
            width: 40,
            height: 30,
            type: Math.random() < 0.5 ? 'boat' : 'helicopter',
            speed: 1 + Math.random()
        });
    }
}

// Update enemies
function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.y += game.scrollSpeed + enemy.speed;
        
        // Check collision with bullets
        const hit = player.bullets.some((bullet, i) => {
            if (Math.abs(bullet.x - enemy.x) < enemy.width/2 && 
                Math.abs(bullet.y - enemy.y) < enemy.height/2) {
                player.bullets.splice(i, 1);
                game.score += enemy.type === 'helicopter' ? 60 : 30;
                return true;
            }
            return false;
        });

        // Check collision with player
        if (Math.abs(player.x - enemy.x) < (player.width + enemy.width)/2 && 
            Math.abs(player.y - enemy.y) < (player.height + enemy.height)/2) {
            playerCrash();
        }

        return !hit && enemy.y < canvas.height + 50;
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.type === 'boat') {
            ctx.fillStyle = '#f80';
            ctx.fillRect(enemy.x - enemy.width/2, enemy.y - enemy.height/2, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = '#f0f';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.width/2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Spawn fuel tanks
function spawnFuelTanks() {
    if (game.frameCount % 300 === 0 && Math.random() < 0.8) {
        const section = riverSections[0];
        const x = section.left + Math.random() * (section.right - section.left);
        fuelTanks.push({
            x: x,
            y: -30,
            width: 30,
            height: 30
        });
    }
}

// Update fuel tanks
function updateFuelTanks() {
    fuelTanks = fuelTanks.filter(tank => {
        tank.y += game.scrollSpeed;
        
        // Check collision with player
        if (Math.abs(player.x - tank.x) < (player.width + tank.width)/2 && 
            Math.abs(player.y - tank.y) < (player.height + tank.height)/2) {
            game.fuel = Math.min(100, game.fuel + 30);
            game.score += 80;
            return false;
        }
        
        return tank.y < canvas.height + 50;
    });
}

// Draw fuel tanks
function drawFuelTanks() {
    ctx.fillStyle = '#0f0';
    fuelTanks.forEach(tank => {
        ctx.fillRect(tank.x - tank.width/2, tank.y - tank.height/2, tank.width, tank.height);
        ctx.fillStyle = '#fff';
        ctx.font = '16px Courier';
        ctx.fillText('F', tank.x - 5, tank.y + 5);
        ctx.fillStyle = '#0f0';
    });
}

// Player crash
function playerCrash() {
    game.lives--;
    game.fuel = 100;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.bullets = [];
    
    if (game.lives <= 0) {
        game.over = true;
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('fuel').textContent = Math.floor(game.fuel);
    document.getElementById('lives').textContent = game.lives;
    
    if (game.over) {
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('finalScore').textContent = game.score;
    }
}

// Reset game
function resetGame() {
    game.score = 0;
    game.fuel = 100;
    game.lives = 3;
    game.over = false;
    game.frameCount = 0;
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.bullets = [];
    enemies = [];
    fuelTanks = [];
    initRiver();
    document.getElementById('gameOver').style.display = 'none';
}

// Game loop
function gameLoop() {
    if (!game.paused && !game.over) {
        game.frameCount++;
        
        updateRiver();
        updatePlayer();
        spawnEnemies();
        updateEnemies();
        spawnFuelTanks();
        updateFuelTanks();
        
        // Increase difficulty
        if (game.frameCount % 500 === 0) {
            game.scrollSpeed = Math.min(5, game.scrollSpeed + 0.2);
        }
    }
    
    // Drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRiver();
    drawFuelTanks();
    drawEnemies();
    drawPlayer();
    
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Initialize and start game
initRiver();
gameLoop();