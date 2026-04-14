import type { Mark } from '../game/logic'

export interface TurnIndicatorProps {
  currentMark: Mark
  active: boolean
}

export function TurnIndicator({ currentMark, active }: TurnIndicatorProps) {
  if (!active) {
    return <div className="h-7" aria-hidden="true" />
  }
  const color = currentMark === 'X' ? 'text-markX' : 'text-markO'
  return (
    <div className="h-7 text-base font-medium text-gray-700">
      <span className={`font-bold ${color}`}>{currentMark}</span>
      <span className="ml-1">차례</span>
    </div>
  )
}
