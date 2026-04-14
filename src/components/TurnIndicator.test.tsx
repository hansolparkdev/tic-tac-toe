import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TurnIndicator } from './TurnIndicator'

describe('TurnIndicator', () => {
  it('현재 차례 X를 표시', () => {
    render(<TurnIndicator currentMark="X" active={true} />)
    expect(screen.getByText(/X/)).toBeInTheDocument()
    expect(screen.getByText(/차례/)).toBeInTheDocument()
  })

  it('현재 차례 O를 표시', () => {
    render(<TurnIndicator currentMark="O" active={true} />)
    expect(screen.getByText(/O/)).toBeInTheDocument()
  })

  it('active=false면 "대기" 또는 숨김 처리 (게임 종료)', () => {
    const { container } = render(<TurnIndicator currentMark="X" active={false} />)
    // 종료 시엔 차례 텍스트가 보이지 않아야 함
    expect(container.textContent).not.toMatch(/차례/)
  })
})
