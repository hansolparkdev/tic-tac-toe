export interface ScoreCardProps {
  label: string
  value: number
  active: boolean
  ariaLabel: string
  accent: 'X' | 'draw' | 'O'
}

const borderColor = (accent: ScoreCardProps['accent'], active: boolean): string => {
  if (!active) return 'border-transparent'
  if (accent === 'X') return 'border-markX ring-2 ring-markX/40'
  if (accent === 'O') return 'border-markO ring-2 ring-markO/40'
  return 'border-gray-400'
}

const labelColor = (accent: ScoreCardProps['accent']): string => {
  if (accent === 'X') return 'text-markX'
  if (accent === 'O') return 'text-markO'
  return 'text-gray-600'
}

export function ScoreCard({ label, value, active, ariaLabel, accent }: ScoreCardProps) {
  return (
    <div
      aria-label={ariaLabel}
      data-active={active ? 'true' : 'false'}
      className={[
        'flex flex-col items-center justify-center rounded-md border-2 bg-white px-4 py-3',
        'transition-colors',
        borderColor(accent, active),
      ].join(' ')}
    >
      <span className={['text-sm font-medium', labelColor(accent)].join(' ')}>
        {label}
      </span>
      <span
        key={value}
        data-role="score-value"
        className={[
          'text-2xl font-bold tabular-nums text-gray-900',
          'animate-countup motion-reduce:animate-none',
        ].join(' ')}
      >
        {value}
      </span>
    </div>
  )
}
