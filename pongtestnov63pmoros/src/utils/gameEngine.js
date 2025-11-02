export const checkCollision = (ball, paddle, ballSize) => {
  return (
    ball.x < paddle.x + paddle.width &&
    ball.x + ballSize > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y + ballSize > paddle.y
  )
}

export const calculateAiMove = (ball, aiPaddle, difficulty, canvasHeight) => {
  const paddleCenter = aiPaddle.y + aiPaddle.height / 2
  const ballCenter = ball.y + 7.5 // Half of ball size

  let aiSpeed = 4
  let reactionDelay = 10

  switch (difficulty) {
    case 'easy':
      aiSpeed = 3
      reactionDelay = 20
      break
    case 'medium':
      aiSpeed = 5
      reactionDelay = 10
      break
    case 'hard':
      aiSpeed = 7
      reactionDelay = 5
      break
    default:
      aiSpeed = 5
  }

  if (Math.abs(paddleCenter - ballCenter) > reactionDelay) {
    if (paddleCenter < ballCenter) {
      return Math.min(aiSpeed, canvasHeight - aiPaddle.y - aiPaddle.height)
    } else {
      return Math.max(-aiSpeed, -aiPaddle.y)
    }
  }

  return 0
}

export const updateBallPosition = (ball, constants) => {
  const newBall = { ...ball }

  newBall.x += newBall.dx
  newBall.y += newBall.dy

  // Wall collision (top and bottom)
  if (newBall.y <= 0 || newBall.y + constants.BALL_SIZE >= constants.CANVAS_HEIGHT) {
    newBall.dy = -newBall.dy
    return { ...newBall, collision: 'wall' }
  }

  return { ...newBall, collision: null }
}

export const handlePaddleCollision = (ball, paddle, constants) => {
  const newBall = { ...ball }

  // Calculate where the ball hit the paddle (0 = top, 1 = bottom)
  const hitPosition = (ball.y - paddle.y) / paddle.height

  // Adjust angle based on hit position
  const maxAngle = Math.PI / 4 // 45 degrees
  const angle = (hitPosition - 0.5) * maxAngle * 2

  // Increase speed slightly on each hit (max 1.5x original speed)
  newBall.speed = Math.min(newBall.speed * 1.05, constants.INITIAL_BALL_SPEED * 1.5)

  // Reverse horizontal direction
  newBall.dx = -newBall.dx

  // Adjust vertical direction based on hit position
  newBall.dy = newBall.speed * Math.sin(angle)
  newBall.dx = Math.sign(newBall.dx) * newBall.speed * Math.cos(angle)

  return newBall
}

export const generateSoundFrequency = (type) => {
  const frequencies = {
    paddle: 440, // A4
    wall: 330, // E4
    score: 523, // C5
    gameOver: 262 // C4
  }
  return frequencies[type] || 440
}

export const playSound = (audioContext, frequency, duration = 0.1) => {
  if (!audioContext) return

  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'square'

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}
