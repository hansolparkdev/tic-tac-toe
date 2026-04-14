import { useRef, useState, useEffect, useCallback } from 'react'
import type { KeyboardEvent } from 'react'
import { Cell } from './Cell'
import { WinningLine } from './WinningLine'
import type { Board, Line } from '../game/logic'

export interface GameBoardProps {
  board: Board
  winningLine: Line | null
  disabled: boolean
  shakeIndex?: number | null
  onPlay: (index: number) => void
}

export function GameBoard({
  board,
  winningLine,
  disabled,
  shakeIndex,
  onPlay,
}: GameBoardProps) {
  const [focusIndex, setFocusIndex] = useState(0)
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])
  const boardRef = useRef<HTMLDivElement | null>(null)
  const focusPending = useRef(false)

  useEffect(() => {
    if (focusPending.current) {
      cellRefs.current[focusIndex]?.focus()
      focusPending.current = false
    }
  }, [focusIndex])

  const moveFocus = useCallback(
    (next: number) => {
      focusPending.current = true
      setFocusIndex(next)
    },
    [],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const row = Math.floor(index / 3)
      const col = index % 3
      let nextIndex = index
      switch (e.key) {
        case 'ArrowRight':
          if (col < 2) nextIndex = index + 1
          break
        case 'ArrowLeft':
          if (col > 0) nextIndex = index - 1
          break
        case 'ArrowDown':
          if (row < 2) nextIndex = index + 3
          break
        case 'ArrowUp':
          if (row > 0) nextIndex = index - 3
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (!disabled) onPlay(index)
          return
        default:
          return
      }
      if (nextIndex !== index) {
        e.preventDefault()
        moveFocus(nextIndex)
      }
    },
    [disabled, onPlay, moveFocus],
  )

  const handleActivate = useCallback(
    (index: number) => {
      if (disabled) return
      setFocusIndex(index)
      onPlay(index)
    },
    [disabled, onPlay],
  )

  return (
    <div
      ref={boardRef}
      className="relative mx-auto w-[80vw] max-w-[360px]"
      data-testid="game-board"
    >
      <div className="grid grid-cols-3">
        {board.map((value, i) => (
          <Cell
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            value={value}
            row={Math.floor(i / 3)}
            col={i % 3}
            index={i}
            focused={i === focusIndex}
            disabled={disabled}
            shake={shakeIndex === i}
            onActivate={handleActivate}
            onKeyDown={(e) => handleKeyDown(e, i)}
          />
        ))}
      </div>
      {winningLine && <WinningLine line={winningLine} boardRef={boardRef} />}
    </div>
  )
}
