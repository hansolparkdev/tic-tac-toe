import { describe, it, expect } from 'vitest'
import { initialUiState, reducer } from './reducer'
import type { UiState } from './reducer'

const playMoves = (state: UiState, moves: number[]): UiState =>
  moves.reduce((s, i) => reducer(s, { type: 'PLAY', index: i }), state)

describe('reducer scores', () => {
  it('X 승리 시 scores.X가 1 증가한다', () => {
    const s0 = initialUiState()
    // X=0, O=3, X=1, O=4, X=2 -> X wins row 0
    const s = playMoves(s0, [0, 3, 1, 4, 2])
    expect(s.winner).toBe('X')
    expect(s.scores).toEqual({ X: 1, draw: 0, O: 0 })
  })

  it('O 승리 시 scores.O가 1 증가한다', () => {
    const s0 = initialUiState()
    // X=0, O=3, X=1, O=4, X=8, O=5 -> O wins row 1
    const s = playMoves(s0, [0, 3, 1, 4, 8, 5])
    expect(s.winner).toBe('O')
    expect(s.scores).toEqual({ X: 0, draw: 0, O: 1 })
  })

  it('무승부 시 scores.draw가 1 증가한다', () => {
    const s0 = initialUiState()
    const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8]
    const s = playMoves(s0, moves)
    expect(s.winner).toBe('draw')
    expect(s.scores).toEqual({ X: 0, draw: 1, O: 0 })
  })

  it('2라운드 시뮬레이션: 스코어 누적 + 선공 교대', () => {
    let s = initialUiState()
    // Round 1: X wins
    s = playMoves(s, [0, 3, 1, 4, 2])
    expect(s.winner).toBe('X')
    expect(s.scores).toEqual({ X: 1, draw: 0, O: 0 })
    expect(s.nextStarter).toBe('O')

    // Reset round -> O starts
    s = reducer(s, { type: 'RESET_ROUND' })
    expect(s.currentMark).toBe('O')
    expect(s.scores).toEqual({ X: 1, draw: 0, O: 0 })

    // Round 2: O wins - O=0, X=3, O=1, X=4, O=2 -> O wins row 0
    s = playMoves(s, [0, 3, 1, 4, 2])
    expect(s.winner).toBe('O')
    expect(s.scores).toEqual({ X: 1, draw: 0, O: 1 })
    expect(s.nextStarter).toBe('X')
  })

  it('RESET_ALL: scores 0/0/0 + board 초기화 + nextStarter=X + currentMark=X', () => {
    let s = initialUiState()
    s = playMoves(s, [0, 3, 1, 4, 2]) // X wins
    expect(s.scores.X).toBe(1)

    s = reducer(s, { type: 'RESET_ALL' })
    expect(s.scores).toEqual({ X: 0, draw: 0, O: 0 })
    expect(s.board.every((c) => c === null)).toBe(true)
    expect(s.nextStarter).toBe('X')
    expect(s.currentMark).toBe('X')
    expect(s.winner).toBeNull()
    expect(s.winningLine).toBeNull()
  })
})
