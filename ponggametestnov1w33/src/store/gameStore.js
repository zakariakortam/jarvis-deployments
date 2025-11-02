import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 15
const PADDLE_HEIGHT = 100
const BALL_SIZE = 15
const INITIAL_BALL_SPEED = 5

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state
      gameState: 'menu', // 'menu', 'playing', 'paused', 'gameOver'
      playerScore: 0,
      aiScore: 0,
      difficulty: 'medium', // 'easy', 'medium', 'hard'
      soundEnabled: true,

      // Game objects
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        dx: INITIAL_BALL_SPEED,
        dy: INITIAL_BALL_SPEED,
        speed: INITIAL_BALL_SPEED,
      },
      playerPaddle: {
        x: 20,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: 0,
      },
      aiPaddle: {
        x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: 0,
      },

      // Constants
      constants: {
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        BALL_SIZE,
        INITIAL_BALL_SPEED,
        PADDLE_SPEED: 8,
        MAX_SCORE: 11,
      },

      // Actions
      startGame: () => set({
        gameState: 'playing',
        playerScore: 0,
        aiScore: 0,
      }),

      pauseGame: () => set({ gameState: 'paused' }),

      resumeGame: () => set({ gameState: 'playing' }),

      endGame: () => set({ gameState: 'gameOver' }),

      returnToMenu: () => set({
        gameState: 'menu',
        playerScore: 0,
        aiScore: 0,
      }),

      setDifficulty: (difficulty) => set({ difficulty }),

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      updateBall: (updates) => set((state) => ({
        ball: { ...state.ball, ...updates }
      })),

      updatePlayerPaddle: (updates) => set((state) => ({
        playerPaddle: { ...state.playerPaddle, ...updates }
      })),

      updateAiPaddle: (updates) => set((state) => ({
        aiPaddle: { ...state.aiPaddle, ...updates }
      })),

      incrementPlayerScore: () => set((state) => {
        const newScore = state.playerScore + 1
        return {
          playerScore: newScore,
          gameState: newScore >= state.constants.MAX_SCORE ? 'gameOver' : state.gameState
        }
      }),

      incrementAiScore: () => set((state) => {
        const newScore = state.aiScore + 1
        return {
          aiScore: newScore,
          gameState: newScore >= state.constants.MAX_SCORE ? 'gameOver' : state.gameState
        }
      }),

      resetBall: () => set((state) => ({
        ball: {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED,
          dy: (Math.random() - 0.5) * INITIAL_BALL_SPEED,
          speed: INITIAL_BALL_SPEED,
        }
      })),

      resetGame: () => set({
        gameState: 'menu',
        playerScore: 0,
        aiScore: 0,
        ball: {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: INITIAL_BALL_SPEED,
          dy: INITIAL_BALL_SPEED,
          speed: INITIAL_BALL_SPEED,
        },
        playerPaddle: {
          x: 20,
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          width: PADDLE_WIDTH,
          height: PADDLE_HEIGHT,
          dy: 0,
        },
        aiPaddle: {
          x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          width: PADDLE_WIDTH,
          height: PADDLE_HEIGHT,
          dy: 0,
        },
      }),
    }),
    {
      name: 'pong-game-storage',
      partialize: (state) => ({
        difficulty: state.difficulty,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
)
