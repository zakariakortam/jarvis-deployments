class Ball {
    constructor(x, y, radius, canvas) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.canvas = canvas;
        this.reset();
    }
    
    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        
        // Random initial direction
        const angle = (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees
        const speed = 6;
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        this.vx = Math.cos(angle) * speed * direction;
        this.vy = Math.sin(angle) * speed;
        
        // Ensure minimum horizontal speed
        if (Math.abs(this.vx) < 3) {
            this.vx = this.vx < 0 ? -3 : 3;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off top and bottom walls
        if (this.y - this.radius <= 0 || this.y + this.radius >= this.canvas.height) {
            this.vy = -this.vy;
            this.y = this.y - this.radius <= 0 ? this.radius : this.canvas.height - this.radius;
        }
    }
    
    checkPaddleCollision(paddle) {
        // Check if ball is within paddle's x range
        if (this.x + this.radius >= paddle.x && 
            this.x - this.radius <= paddle.x + paddle.width) {
            
            // Check if ball is within paddle's y range
            if (this.y + this.radius >= paddle.y && 
                this.y - this.radius <= paddle.y + paddle.height) {
                
                // Calculate relative position on paddle (0 to 1)
                const relativeIntersectY = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
                
                // Calculate bounce angle (max 45 degrees)
                const bounceAngle = relativeIntersectY * Math.PI / 4;
                
                // Determine direction based on which paddle was hit
                const direction = this.x < this.canvas.width / 2 ? 1 : -1;
                
                // Set new velocity with slight speed increase
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 1.05;
                this.vx = Math.cos(bounceAngle) * speed * direction;
                this.vy = Math.sin(bounceAngle) * speed;
                
                // Move ball away from paddle to prevent multiple collisions
                if (direction > 0) {
                    this.x = paddle.x + paddle.width + this.radius;
                } else {
                    this.x = paddle.x - this.radius;
                }
                
                return true;
            }
        }
        return false;
    }
    
    isOutOfBounds() {
        return this.x < -this.radius || this.x > this.canvas.width + this.radius;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

class Paddle {
    constructor(x, y, width, height, canvas) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.canvas = canvas;
        this.speed = 8;
        this.targetY = y;
    }
    
    moveUp() {
        this.y = Math.max(0, this.y - this.speed);
    }
    
    moveDown() {
        this.y = Math.min(this.canvas.height - this.height, this.y + this.speed);
    }
    
    // AI movement with smooth interpolation
    moveTowards(targetY, difficulty = 0.1) {
        this.targetY = Math.max(0, Math.min(this.canvas.height - this.height, 
            targetY - this.height / 2));
        
        const diff = this.targetY - this.y;
        this.y += diff * difficulty;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 5;
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.shadowBlur = 0;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameMessage = document.getElementById('gameMessage');
        this.playerScoreElement = document.getElementById('playerScore');
        this.computerScoreElement = document.getElementById('computerScore');
        
        // Game state
        this.gameState = 'START'; // START, PLAYING, PAUSED, GAME_OVER
        this.playerScore = 0;
        this.computerScore = 0;
        this.maxScore = 10;
        this.isVsAI = true;
        
        // Input handling
        this.keys = {};
        
        this.setupCanvas();
        this.initializeGame();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth - 6; // Account for border
            const aspectRatio = 4 / 3;
            
            this.canvas.width = Math.min(containerWidth, 800);
            this.canvas.height = this.canvas.width / aspectRatio;
            
            // Recreate game objects with new canvas dimensions
            if (this.ball) {
                this.initializeGame();
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    initializeGame() {
        const paddleWidth = 15;
        const paddleHeight = 100;
        const ballRadius = 10;
        
        this.ball = new Ball(
            this.canvas.width / 2, 
            this.canvas.height / 2, 
            ballRadius, 
            this.canvas
        );
        
        this.leftPaddle = new Paddle(
            20, 
            this.canvas.height / 2 - paddleHeight / 2, 
            paddleWidth, 
            paddleHeight, 
            this.canvas
        );
        
        this.rightPaddle = new Paddle(
            this.canvas.width - 20 - paddleWidth, 
            this.canvas.height / 2 - paddleHeight / 2, 
            paddleWidth, 
            paddleHeight, 
            this.canvas
        );
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Handle special keys
            if (e.key === ' ') {
                e.preventDefault();
                this.handleSpaceKey();
            } else if (e.key.toLowerCase() === 'p') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Game mode buttons
        document.getElementById('vsAI').addEventListener('click', () => {
            this.setGameMode(true);
        });
        
        document.getElementById('vsPlayer').addEventListener('click', () => {
            this.setGameMode(false);
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setGameMode(vsAI) {
        this.isVsAI = vsAI;
        
        // Update button states
        document.getElementById('vsAI').classList.toggle('active', vsAI);
        document.getElementById('vsPlayer').classList.toggle('active', !vsAI);
        
        // Reset game if already playing
        if (this.gameState === 'PLAYING') {
            this.resetGame();
        }
    }
    
    handleSpaceKey() {
        if (this.gameState === 'START' || this.gameState === 'GAME_OVER') {
            this.startGame();
        } else if (this.gameState === 'PAUSED') {
            this.resumeGame();
        }
    }
    
    togglePause() {
        if (this.gameState === 'PLAYING') {
            this.pauseGame();
        } else if (this.gameState === 'PAUSED') {
            this.resumeGame();
        }
    }
    
    startGame() {
        this.gameState = 'PLAYING';
        this.hideMessage();
        this.ball.reset();
    }
    
    pauseGame() {
        this.gameState = 'PAUSED';
        this.showMessage('Game Paused', 'Press P to resume', 'Press SPACE to restart');
    }
    
    resumeGame() {
        this.gameState = 'PLAYING';
        this.hideMessage();
    }
    
    resetGame() {
        this.playerScore = 0;
        this.computerScore = 0;
        this.updateScore();
        this.gameState = 'START';
        this.showMessage('PONG Game', 'Press SPACE to start', 
            this.isVsAI ? 'Playing vs AI' : 'Playing vs Player');
        this.initializeGame();
    }
    
    gameOver(winner) {
        this.gameState = 'GAME_OVER';
        this.showMessage(
            `${winner} Wins!`, 
            `Final Score: ${this.playerScore} - ${this.computerScore}`, 
            'Press SPACE to play again'
        );
    }
    
    showMessage(title, ...lines) {
        this.gameMessage.innerHTML = `
            <h2>${title}</h2>
            ${lines.map(line => `<p>${line}</p>`).join('')}
        `;
        this.gameMessage.classList.remove('hidden');
    }
    
    hideMessage() {
        this.gameMessage.classList.add('hidden');
    }
    
    updateScore() {
        this.playerScoreElement.textContent = this.playerScore;
        this.computerScoreElement.textContent = this.computerScore;
    }
    
    handleInput() {
        if (this.gameState !== 'PLAYING') return;
        
        // Left paddle (Player 1)
        if (this.keys['w']) {
            this.leftPaddle.moveUp();
        }
        if (this.keys['s']) {
            this.leftPaddle.moveDown();
        }
        
        // Right paddle (Player 2 or AI)
        if (!this.isVsAI) {
            if (this.keys['arrowup']) {
                this.rightPaddle.moveUp();
            }
            if (this.keys['arrowdown']) {
                this.rightPaddle.moveDown();
            }
        }
    }
    
    updateAI() {
        if (!this.isVsAI || this.gameState !== 'PLAYING') return;
        
        // AI difficulty - how accurately it follows the ball
        let difficulty = 0.08;
        
        // Make AI slightly less perfect by adding some randomness
        const prediction = this.ball.y + (Math.random() - 0.5) * 20;
        
        // Only move AI when ball is moving towards it
        if (this.ball.vx > 0) {
            this.rightPaddle.moveTowards(prediction, difficulty);
        }
    }
    
    update() {
        if (this.gameState !== 'PLAYING') return;
        
        this.handleInput();
        this.updateAI();
        this.ball.update();
        
        // Check paddle collisions
        this.ball.checkPaddleCollision(this.leftPaddle);
        this.ball.checkPaddleCollision(this.rightPaddle);
        
        // Check scoring
        if (this.ball.isOutOfBounds()) {
            if (this.ball.x < 0) {
                this.computerScore++;
            } else {
                this.playerScore++;
            }
            
            this.updateScore();
            
            // Check for game over
            if (this.playerScore >= this.maxScore) {
                this.gameOver('Player');
                return;
            } else if (this.computerScore >= this.maxScore) {
                this.gameOver(this.isVsAI ? 'Computer' : 'Player 2');
                return;
            }
            
            // Reset ball for next round
            setTimeout(() => {
                if (this.gameState === 'PLAYING') {
                    this.ball.reset();
                }
            }, 1000);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#00ff41';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw game objects
        this.leftPaddle.draw(this.ctx);
        this.rightPaddle.draw(this.ctx);
        
        if (this.gameState === 'PLAYING' || this.gameState === 'PAUSED') {
            this.ball.draw(this.ctx);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});