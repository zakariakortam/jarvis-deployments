import { useGameStore } from '../../store/gameStore'
import './styles.css'

export default function ScoreBoard() {
  const { playerScore, aiScore, constants } = useGameStore()

  return (
    <div className="scoreboard" role="status" aria-live="polite" aria-atomic="true">
      <div className="score-display">
        <div className="score-section">
          <span className="score-label">Player</span>
          <span className="score-number">{playerScore}</span>
        </div>
        <div className="score-divider">:</div>
        <div className="score-section">
          <span className="score-label">AI</span>
          <span className="score-number">{aiScore}</span>
        </div>
      </div>
      <div className="score-goal">First to {constants.MAX_SCORE}</div>
    </div>
  )
}
