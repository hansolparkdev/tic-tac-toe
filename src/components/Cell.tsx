import { forwardRef } from 'react'
import type { Cell as CellValue } from '../game/logic'

export interface CellProps {
  value: CellValue
  row: number
  col: number
  index: number
  focused: boolean
  disabled: boolean
  /** true인 경우 점유된 셀 클릭을 시도한 상태 (shake 애니메이션 표시용) */
  shake?: boolean
  onActivate: (index: number) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void
}

export const Cell = forwardRef<HTMLButtonElement, CellProps>(function Cell(
  { value, row, col, index, focused, disabled, shake, onActivate, onKeyDown },
  ref,
) {
  const stateLabel = value === null ? '비어있음' : value
  const ariaLabel = `${row + 1}행 ${col + 1}열, ${stateLabel}`

  const colorClass =
    value === 'X' ? 'text-markX' : value === 'O' ? 'text-markO' : 'text-transparent'

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      aria-label={ariaLabel}
      tabIndex={focused ? 0 : -1}
      disabled={disabled && value !== null}
      onClick={() => onActivate(index)}
      onKeyDown={onKeyDown}
      data-index={index}
      className={[
        'relative flex aspect-square w-full items-center justify-center',
        'border-2 border-gray-300 bg-white',
        'text-[60%] font-bold leading-none',
        'transition-colors hover:bg-gray-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        value !== null ? 'cursor-not-allowed' : 'cursor-pointer',
        value !== null ? 'animate-pop motion-reduce:animate-none' : '',
        shake ? 'animate-shake motion-reduce:animate-none' : '',
        colorClass,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontSize: '60%' }}
    >
      <span
        className="select-none"
        style={{ fontSize: 'calc(var(--cell-size, 100px) * 0.6)' }}
      >
        {value ?? ''}
      </span>
    </button>
  )
})
