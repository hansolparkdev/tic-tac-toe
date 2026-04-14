import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useRef, useState } from 'react'
import { WinningLine } from './WinningLine'
import type { Line } from '../game/logic'

// ResizeObserver 목: 인스턴스와 콜백을 저장해 수동 트리거 가능하게 함
const observers: Array<{ cb: ResizeObserverCallback; target: Element | null }> = []

class MockResizeObserver {
  cb: ResizeObserverCallback
  target: Element | null = null
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb
    observers.push(this)
  }
  observe(el: Element) {
    this.target = el
  }
  disconnect() {
    this.target = null
  }
  unobserve() {}
}

beforeEach(() => {
  observers.length = 0
  ;(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver
})

afterEach(() => {
  vi.restoreAllMocks()
})

function Harness({
  line,
  width,
}: {
  line: Line
  width: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const setRef = (el: HTMLDivElement | null) => {
    ref.current = el
    if (el) {
      vi.spyOn(el, 'getBoundingClientRect').mockImplementation(() => ({
        width,
        height: width,
        left: 0,
        top: 0,
        right: width,
        bottom: width,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }))
      if (!ready) setReady(true)
    }
  }
  return (
    <div ref={setRef} style={{ width, height: width }} data-testid="board-host">
      {ready && <WinningLine line={line} boardRef={ref} />}
    </div>
  )
}

describe('WinningLine', () => {
  it('가로 (0,1,2) 라인 렌더: 첫 셀 중심 → 세 번째 셀 중심', async () => {
    const { findByTestId } = render(<Harness line={[0, 1, 2]} width={300} />)
    const svg = await findByTestId('winning-line')
    const lineEl = svg.querySelector('line')
    expect(lineEl).not.toBeNull()
    // width=300 → cellSize=100. center(0) = (50,50), center(2) = (250,50)
    expect(lineEl?.getAttribute('x1')).toBe('50')
    expect(lineEl?.getAttribute('y1')).toBe('50')
    expect(lineEl?.getAttribute('x2')).toBe('250')
    expect(lineEl?.getAttribute('y2')).toBe('50')
  })

  it('대각선 (0,4,8) 라인: (50,50) → (250,250)', async () => {
    const { findByTestId } = render(<Harness line={[0, 4, 8]} width={300} />)
    const svg = await findByTestId('winning-line')
    const lineEl = svg.querySelector('line')
    expect(lineEl?.getAttribute('x1')).toBe('50')
    expect(lineEl?.getAttribute('y1')).toBe('50')
    expect(lineEl?.getAttribute('x2')).toBe('250')
    expect(lineEl?.getAttribute('y2')).toBe('250')
  })

  it('ResizeObserver 트리거 시 좌표 재계산', async () => {
    const line: Line = [0, 1, 2]
    const { findByTestId, getByTestId } = render(<Harness line={line} width={300} />)
    const svg = await findByTestId('winning-line')
    let lineEl = svg.querySelector('line')
    expect(lineEl?.getAttribute('x2')).toBe('250')

    // 보드 크기 변경 후 ResizeObserver 콜백 수동 호출
    const host = getByTestId('board-host')
    vi.spyOn(host, 'getBoundingClientRect').mockImplementation(() => ({
      width: 600,
      height: 600,
      left: 0,
      top: 0,
      right: 600,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }))

    act(() => {
      observers.forEach((o) => {
        if (o.target) {
          o.cb(
            [{ target: o.target } as unknown as ResizeObserverEntry],
            o as unknown as ResizeObserver,
          )
        }
      })
    })

    lineEl = svg.querySelector('line')
    // width=600 → cellSize=200 → center(0)=(100,100), center(2)=(500,100)
    expect(lineEl?.getAttribute('x1')).toBe('100')
    expect(lineEl?.getAttribute('x2')).toBe('500')
  })
})
