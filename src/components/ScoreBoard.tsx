import type { Mark, Scores } from '../game/logic'
import { ScoreCard } from './ScoreCard'

export interface ScoreBoardProps {
  scores: Scores
  currentMark: Mark
  active: boolean
}

export function ScoreBoard({ scores, currentMark, active }: ScoreBoardProps) {
  return (
    <div className="grid w-full max-w-md grid-cols-3 gap-2">
      <ScoreCard
        label="X"
        value={scores.X}
        active={active && currentMark === 'X'}
        ariaLabel={`X ${scores.X}승`}
        accent="X"
      />
      <ScoreCard
        label="Draw"
        value={scores.draw}
        active={false}
        ariaLabel={`무승부 ${scores.draw}`}
        accent="draw"
      />
      <ScoreCard
        label="O"
        value={scores.O}
        active={active && currentMark === 'O'}
        ariaLabel={`O ${scores.O}승`}
        accent="O"
      />
    </div>
  )
}
