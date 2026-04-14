import { describe, it, expect } from 'vitest'
import { initialState, play, resetRound, evaluate } from './logic'
import type { Board, Mark } from './logic'

describe('initialState', () => {
  it('빈 보드, 현재 X, 다음 선공 X, winner/line null', () => {
    const s = initialState()
    expect(s.board).toEqual([null, null, null, null, null, null, null, null, null])
    expect(s.currentMark).toBe('X')
    expect(s.nextStarter).toBe('X')
    expect(s.winner).toBeNull()
    expect(s.winningLine).toBeNull()
  })
})

describe('play', () => {
  it('빈 셀 착수 시 기호 배치, 차례 교대', () => {
    const s = initialState()
    const next = play(s, 4)
    expect(next.board[4]).toBe('X')
    expect(next.currentMark).toBe('O')
    expect(next.winner).toBeNull()
  })

  it('점유 셀은 무시되어 같은 state 반환', () => {
    const s = play(initialState(), 0)
    const same = play(s, 0)
    expect(same).toBe(s)
  })

  it('종료 후 착수는 무시', () => {
    // X wins top row
    let s = initialState()
    s = play(s, 0) // X
    s = play(s, 3) // O
    s = play(s, 1) // X
    s = play(s, 4) // O
    s = play(s, 2) // X wins
    expect(s.winner).toBe('X')
    const after = play(s, 5)
    expect(after).toBe(s)
  })
})

describe('evaluate', () => {
  const winCases: Array<{ name: string; idxs: [number, number, number] }> = [
    { name: 'row 0', idxs: [0, 1, 2] },
    { name: 'row 1', idxs: [3, 4, 5] },
    { name: 'row 2', idxs: [6, 7, 8] },
    { name: 'col 0', idxs: [0, 3, 6] },
    { name: 'col 1', idxs: [1, 4, 7] },
    { name: 'col 2', idxs: [2, 5, 8] },
    { name: 'diag \\', idxs: [0, 4, 8] },
    { name: 'diag /', idxs: [2, 4, 6] },
  ]

  winCases.forEach(({ name, idxs }) => {
    it(`X 승리 - ${name}`, () => {
      const board: Board = Array(9).fill(null) as Board
      idxs.forEach((i) => (board[i] = 'X' as Mark))
      const r = evaluate(board)
      expect(r.winner).toBe('X')
      expect(r.line).toEqual(idxs)
    })
  })

  it('무승부: 9칸 채움, 승자 없음', () => {
    // X O X
    // X O O
    // O X X
    const board: Board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    const r = evaluate(board)
    expect(r.winner).toBe('draw')
    expect(r.line).toBeNull()
  })

  it('미종료: 아직 빈 칸 있고 승자 없음', () => {
    const board: Board = ['X', 'O', null, null, null, null, null, null, null]
    const r = evaluate(board)
    expect(r.winner).toBeNull()
    expect(r.line).toBeNull()
  })
})

describe('선공 교대 규칙', () => {
  it('X 승리 후 리셋 → 다음 선공 O', () => {
    let s = initialState()
    s = play(s, 0) // X
    s = play(s, 3) // O
    s = play(s, 1) // X
    s = play(s, 4) // O
    s = play(s, 2) // X wins
    expect(s.winner).toBe('X')
    expect(s.nextStarter).toBe('O')
    const reset = resetRound(s)
    expect(reset.currentMark).toBe('O')
    expect(reset.board.every((c) => c === null)).toBe(true)
    expect(reset.winner).toBeNull()
  })

  it('O 승리 후 리셋 → 다음 선공 X', () => {
    let s = initialState()
    s = play(s, 0) // X
    s = play(s, 3) // O
    s = play(s, 1) // X
    s = play(s, 4) // O
    s = play(s, 8) // X (no win)
    s = play(s, 5) // O wins row 1
    expect(s.winner).toBe('O')
    expect(s.nextStarter).toBe('X')
  })

  it('무승부 후 리셋 → 직전 선공의 반대 (X 선공이었으면 다음 O)', () => {
    // 무승부 구성 후 resetRound
    // X O X
    // X O O
    // O X X
    // 진행순: X=0, O=1, X=2, X=3? — 실제 교대 순서로 재현
    let s = initialState()
    // turns alternating X,O
    // Build: moves [0,1,2,4,3,5,7,6,8]
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]
    for (const m of moves) {
      s = play(s, m)
    }
    expect(s.winner).toBe('draw')
    expect(s.nextStarter).toBe('O')
    const r = resetRound(s)
    expect(r.currentMark).toBe('O')
  })
})
