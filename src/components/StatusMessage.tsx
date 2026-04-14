import type { Mark } from '../game/logic'

export interface StatusMessageProps {
  winner: Mark | 'draw' | null
}

export function StatusMessage({ winner }: StatusMessageProps) {
  let message = ''
  if (winner === 'X') message = 'X 승리!'
  else if (winner === 'O') message = 'O 승리!'
  else if (winner === 'draw') message = '무승부!'

  return (
    <div
      aria-live="polite"
      role="status"
      className="h-8 text-center text-lg font-semibold text-gray-800"
    >
      {message}
    </div>
  )
}
