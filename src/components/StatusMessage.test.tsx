import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('aria-live="polite" 속성을 가진다', () => {
    const { container } = render(<StatusMessage winner={null} />)
    const el = container.querySelector('[aria-live="polite"]')
    expect(el).not.toBeNull()
  })

  it('winner가 X면 "X 승리!" 표시', () => {
    render(<StatusMessage winner="X" />)
    expect(screen.getByText('X 승리!')).toBeInTheDocument()
  })

  it('winner가 O면 "O 승리!" 표시', () => {
    render(<StatusMessage winner="O" />)
    expect(screen.getByText('O 승리!')).toBeInTheDocument()
  })

  it('winner가 draw면 "무승부!" 표시', () => {
    render(<StatusMessage winner="draw" />)
    expect(screen.getByText('무승부!')).toBeInTheDocument()
  })

  it('winner가 null이면 메시지 영역은 비어도 높이가 유지된다', () => {
    const { container } = render(<StatusMessage winner={null} />)
    const el = container.querySelector('[aria-live="polite"]')
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('')
  })
})
