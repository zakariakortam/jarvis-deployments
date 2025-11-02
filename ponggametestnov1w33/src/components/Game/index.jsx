import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../store/gameStore'
import {
  checkCollision,
  calculateAiMove,
  updateBallPosition,
  handlePaddleCollision,
  playSound,
  generateSoundFrequency
} from '../../utils/gameEngine'
import './styles.css'

export default function Game() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const audioContextRef = useRef(null)
  const keysPressed = useRef({})

  // Use refs to store current game state for the loop (avoids infinite re-renders)
  const gameStateRef = useRef({
    ball: null,
    playerPaddle: null,
    aiPaddle: null,
  })

  const {
    gameState,
    ball,
    playerPaddle,
    aiPaddle,
    constants,
    difficulty,
    soundEnabled,
    incrementPlayerScore,
    incrementAiScore,
    resetBall,
    pauseGame,
  } = useGameStore()

  // Update refs when store state changes
  useEffect(() => {
    gameStateRef.current.ball = ball
    gameStateRef.current.playerPaddle = playerPaddle
    gameStateRef.current.aiPaddle = aiPaddle
  }, [ball, playerPaddle, aiPaddle])

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Sound effect helper
  const playSoundEffect = useCallback((type) => {
    if (soundEnabled && audioContextRef.current) {
      const frequency = generateSoundFrequency(type)
      playSound(audioContextRef.current, frequency)
    }
  }, [soundEnabled])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState === 'playing') {
        keysPressed.current[e.key] = true

        if (e.key === 'Escape') {
          pauseGame()
        }
      }
    }

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, pauseGame])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Local state for smooth animation (no re-renders)
    let localBall = { ...gameStateRef.current.ball }
    let localPlayerPaddle = { ...gameStateRef.current.playerPaddle }
    let localAiPaddle = { ...gameStateRef.current.aiPaddle }

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT)

      // Update player paddle based on keyboard input
      let playerDy = 0
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) {
        playerDy = -constants.PADDLE_SPEED
      }
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) {
        playerDy = constants.PADDLE_SPEED
      }

      localPlayerPaddle.y = Math.max(
        0,
        Math.min(
          constants.CANVAS_HEIGHT - localPlayerPaddle.height,
          localPlayerPaddle.y + playerDy
        )
      )
      localPlayerPaddle.dy = playerDy

      // Update AI paddle
      const aiDy = calculateAiMove(localBall, localAiPaddle, difficulty, constants.CANVAS_HEIGHT)
      localAiPaddle.y = Math.max(
        0,
        Math.min(
          constants.CANVAS_HEIGHT - localAiPaddle.height,
          localAiPaddle.y + aiDy
        )
      )
      localAiPaddle.dy = aiDy

      // Update ball
      const updatedBall = updateBallPosition(localBall, constants)

      // Check wall collision for sound
      if (updatedBall.collision === 'wall') {
        playSoundEffect('wall')
      }

      // Check paddle collisions
      if (checkCollision(updatedBall, localPlayerPaddle, constants.BALL_SIZE)) {
        localBall = handlePaddleCollision(updatedBall, localPlayerPaddle, constants)
        playSoundEffect('paddle')
      } else if (checkCollision(updatedBall, localAiPaddle, constants.BALL_SIZE)) {
        localBall = handlePaddleCollision(updatedBall, localAiPaddle, constants)
        playSoundEffect('paddle')
      } else {
        localBall = updatedBall
      }

      // Check for scoring
      if (localBall.x <= 0) {
        incrementAiScore()
        playSoundEffect('score')
        resetBall()
        // Reset local state to new ball position
        localBall = { ...gameStateRef.current.ball }
      } else if (localBall.x + constants.BALL_SIZE >= constants.CANVAS_WIDTH) {
        incrementPlayerScore()
        playSoundEffect('score')
        resetBall()
        // Reset local state to new ball position
        localBall = { ...gameStateRef.current.ball }
      }

      // Draw game objects
      ctx.fillStyle = 'currentColor'

      // Draw paddles
      ctx.fillRect(localPlayerPaddle.x, localPlayerPaddle.y, localPlayerPaddle.width, localPlayerPaddle.height)
      ctx.fillRect(localAiPaddle.x, localAiPaddle.y, localAiPaddle.width, localAiPaddle.height)

      // Draw ball
      ctx.fillRect(localBall.x, localBall.y, constants.BALL_SIZE, constants.BALL_SIZE)

      // Draw center line
      ctx.setLineDash([10, 10])
      ctx.strokeStyle = 'currentColor'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(constants.CANVAS_WIDTH / 2, 0)
      ctx.lineTo(constants.CANVAS_WIDTH / 2, constants.CANVAS_HEIGHT)
      ctx.stroke()
      ctx.setLineDash([])

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [
    gameState,
    constants,
    difficulty,
    incrementPlayerScore,
    incrementAiScore,
    resetBall,
    playSoundEffect,
  ])

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={constants.CANVAS_WIDTH}
        height={constants.CANVAS_HEIGHT}
        className="game-canvas"
        aria-label="Pong game canvas"
      />
      <div className="game-instructions" aria-live="polite">
        <p>Use Arrow Keys or W/S to move your paddle</p>
        <p>Press ESC to pause</p>
      </div>
    </div>
  )
}
