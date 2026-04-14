export interface ResetRoundButtonProps {
  onReset: () => void
  pulsing: boolean
}

export function ResetRoundButton({ onReset, pulsing }: ResetRoundButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={[
        'rounded-md bg-primary px-4 py-2 text-white',
        'transition-colors hover:bg-blue-700',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        pulsing ? 'animate-pulse-ring motion-reduce:animate-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      다시하기
    </button>
  )
}
