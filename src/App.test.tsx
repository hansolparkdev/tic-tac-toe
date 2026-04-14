import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

beforeEach(() => {
  sessionStorage.clear()
})

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

describe('App (meta: 스코어 + sessionStorage + 다이얼로그)', () => {
  const cellsOf = () =>
    screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)

  it('초기 표시: X:0 / Draw:0 / O:0, X 카드 강조', () => {
    render(<App />)
    expect(screen.getByLabelText('X 0승')).toBeInTheDocument()
    expect(screen.getByLabelText('무승부 0')).toBeInTheDocument()
    expect(screen.getByLabelText('O 0승')).toBeInTheDocument()
    expect(screen.getByLabelText('X 0승').getAttribute('data-active')).toBe('true')
    expect(screen.getByLabelText('O 0승').getAttribute('data-active')).toBe('false')
  })

  it('X 착수 후 강조가 O 카드로 이동', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    await user.click(cells[4])
    expect(screen.getByLabelText('X 0승').getAttribute('data-active')).toBe('false')
    expect(screen.getByLabelText('O 0승').getAttribute('data-active')).toBe('true')
  })

  it('X 승리 시 X 스코어가 0→1로 증가', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2]) // X wins
    expect(screen.getByLabelText('X 1승')).toBeInTheDocument()
  })

  it('무승부 시 draw 스코어 1 증가', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    // [0,1,2,4,3,5,7,6,8] -> draw
    for (const i of [0, 1, 2, 4, 3, 5, 7, 6, 8]) {
      await user.click(cells[i])
    }
    expect(screen.getByLabelText('무승부 1')).toBeInTheDocument()
  })

  it('[스코어 리셋] 클릭 시 다이얼로그 열림, ESC로 취소 시 스코어 유지', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    // X 승리로 X=1 만들기
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2])
    expect(screen.getByLabelText('X 1승')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '스코어 리셋' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // 스코어 유지
    expect(screen.getByLabelText('X 1승')).toBeInTheDocument()
  })

  it('다이얼로그 [리셋] 클릭 시 스코어 0/0/0, 보드 초기화, 다이얼로그 닫힘', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    // X=1 만들기
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2])
    expect(screen.getByLabelText('X 1승')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '스코어 리셋' }))
    await user.click(screen.getByRole('button', { name: '리셋' }))

    // 다이얼로그 닫힘
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // 스코어 0/0/0
    expect(screen.getByLabelText('X 0승')).toBeInTheDocument()
    expect(screen.getByLabelText('무승부 0')).toBeInTheDocument()
    expect(screen.getByLabelText('O 0승')).toBeInTheDocument()
    // 보드 비움
    const cellsAfter = cellsOf()
    cellsAfter.forEach((c) => expect(c.textContent).toBe(''))
    // 차례 = X
    const turn = screen.getByText('차례').parentElement
    expect(within(turn!).getByText('X')).toBeInTheDocument()
  })

  it('sessionStorage에 저장된 scores/nextStarter가 마운트 시 복원된다', () => {
    sessionStorage.setItem(
      'tic-tac-toe/v1',
      JSON.stringify({ scores: { X: 2, draw: 0, O: 1 }, nextStarter: 'O' }),
    )
    render(<App />)
    expect(screen.getByLabelText('X 2승')).toBeInTheDocument()
    expect(screen.getByLabelText('O 1승')).toBeInTheDocument()
    // 현재 차례 = O (= nextStarter)
    const turn = screen.getByText('차례').parentElement
    expect(within(turn!).getByText('O')).toBeInTheDocument()
    // 보드는 빈 상태
    const cells = screen.getAllByRole('button').filter((b) => b.getAttribute('data-index') !== null)
    cells.forEach((c) => expect(c.textContent).toBe(''))
  })

  it('sessionStorage 저장 포맷이 손상되어도 기본값으로 마운트 (예외 미노출)', () => {
    sessionStorage.setItem('tic-tac-toe/v1', '{broken json')
    render(<App />)
    expect(screen.getByLabelText('X 0승')).toBeInTheDocument()
    expect(screen.getByLabelText('무승부 0')).toBeInTheDocument()
    expect(screen.getByLabelText('O 0승')).toBeInTheDocument()
  })

  it('승리 후 sessionStorage에 scores/nextStarter가 저장된다', async () => {
    const user = userEvent.setup()
    render(<App />)
    const cells = cellsOf()
    await user.click(cells[0])
    await user.click(cells[3])
    await user.click(cells[1])
    await user.click(cells[4])
    await user.click(cells[2]) // X wins

    const raw = sessionStorage.getItem('tic-tac-toe/v1')
    expect(raw).not.toBeNull()
    const persisted = JSON.parse(raw as string) as {
      scores: { X: number; draw: number; O: number }
      nextStarter: string
    }
    expect(persisted.scores.X).toBe(1)
    expect(persisted.nextStarter).toBe('O')
  })

  it('오버레이 클릭 시 다이얼로그 닫히고 스코어 유지', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '스코어 리셋' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    const overlay = screen.getByTestId('reset-score-dialog-overlay')
    await user.click(overlay)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
