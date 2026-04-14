export interface ResetScoreButtonProps {
  onClick: () => void
}

export function ResetScoreButton({ onClick }: ResetScoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800',
        'transition-colors hover:bg-gray-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      스코어 리셋
    </button>
  )
}
