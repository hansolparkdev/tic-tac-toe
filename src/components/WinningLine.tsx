import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { Line } from '../game/logic'

export interface WinningLineProps {
  line: Line
  boardRef: RefObject<HTMLDivElement | null>
}

interface Point {
  x: number
  y: number
}

export function WinningLine({ line, boardRef }: WinningLineProps) {
  const [coords, setCoords] = useState<{ start: Point; end: Point; size: number } | null>(
    null,
  )

  useEffect(() => {
    const board = boardRef.current
    if (!board) return

    const compute = () => {
      const rect = board.getBoundingClientRect()
      const size = rect.width
      const cellSize = size / 3
      const center = (idx: number): Point => {
        const row = Math.floor(idx / 3)
        const col = idx % 3
        return {
          x: col * cellSize + cellSize / 2,
          y: row * cellSize + cellSize / 2,
        }
      }
      const start = center(line[0])
      const end = center(line[2])
      setCoords({ start, end, size })
    }

    compute()

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => compute())
      ro.observe(board)
      return () => ro.disconnect()
    }
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [line, boardRef])

  if (!coords) return null

  return (
    <svg
      data-testid="winning-line"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${coords.size} ${coords.size}`}
      preserveAspectRatio="none"
    >
      <line
        x1={coords.start.x}
        y1={coords.start.y}
        x2={coords.end.x}
        y2={coords.end.y}
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        className="text-danger animate-draw-line motion-reduce:animate-none"
      />
    </svg>
  )
}
