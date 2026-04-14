import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App (통합)', () => {
  it('초기 렌더: Tic-Tac-Toe 타이틀과 빈 보드 9칸, X 차례', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Tic-Tac-Toe/i })).toBeInTheDocument()
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    expect(cells).toHaveLength(9)
    expect(screen.getByText('차례')).toBeInTheDocument()
  })

  it('셀 클릭 후 X 렌더, 차례 O로 바뀜', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    await user.click(cells[4])
    expect(cells[4]).toHaveTextContent('X')
    expect(cells[4]).toHaveAttribute('aria-label', '2행 2열, X')
  })

  it('X가 가로 승리 → "X 승리!" 메시지', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    // X=0, O=3, X=1, O=4, X=2 → top row win
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2])
    expect(screen.getByText('X 승리!')).toBeInTheDocument()
  })

  it('승리 후 다시하기 → 보드 비우고 O 선공', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    await user.click(cells[0]) // X
    await user.click(cells[3]) // O
    await user.click(cells[1]) // X
    await user.click(cells[4]) // O
    await user.click(cells[2]) // X wins
    expect(screen.getByText('X 승리!')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시하기' }))

    // 보드 비움
    const cellsAfter = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    cellsAfter.forEach((c) => expect(c.textContent).toBe(''))
    // 차례 = O
    const turn = screen.getByText('차례').parentElement
    expect(within(turn!).getByText('O')).toBeInTheDocument()
    // 상태 메시지 비움
    expect(screen.queryByText(/승리!/)).not.toBeInTheDocument()
  })

  it('점유 셀 클릭은 무시 (값 불변)', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    await user.click(cells[0]) // X
    await user.click(cells[0]) // O가 0을 다시 눌러도 X 유지
    expect(cells[0]).toHaveTextContent('X')
  })

  it('승리 후 빈 셀 클릭은 무시되고 리셋 버튼에 pulse 클래스 적용', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2]) // X wins

    // 종료 후 빈 셀 클릭
    await user.click(cells[5])
    expect(cells[5].textContent).toBe('')

    const resetBtn = screen.getByRole('button', { name: '다시하기' })
    expect(resetBtn.className).toMatch(/animate-pulse-ring/)
  })
})
