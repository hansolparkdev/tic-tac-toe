export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Board = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
export type Line = [number, number, number]

export interface GameState {
  board: Board
  currentMark: Mark
  nextStarter: Mark
  winner: Mark | 'draw' | null
  winningLine: Line | null
}

export interface EvaluateResult {
  winner: Mark | 'draw' | null
  line: Line | null
}

const LINES: Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const emptyBoard = (): Board =>
  [null, null, null, null, null, null, null, null, null] as Board

export const initialState = (): GameState => ({
  board: emptyBoard(),
  currentMark: 'X',
  nextStarter: 'X',
  winner: null,
  winningLine: null,
})

export const evaluate = (board: Board): EvaluateResult => {
  for (const line of LINES) {
    const [a, b, c] = line
    const v = board[a]
    if (v !== null && v === board[b] && v === board[c]) {
      return { winner: v, line }
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', line: null }
  }
  return { winner: null, line: null }
}

const opposite = (m: Mark): Mark => (m === 'X' ? 'O' : 'X')

export const play = (state: GameState, index: number): GameState => {
  if (state.winner !== null) return state
  if (state.board[index] !== null) return state

  const nextBoard = [...state.board] as Board
  nextBoard[index] = state.currentMark
  const { winner, line } = evaluate(nextBoard)

  if (winner === null) {
    return {
      ...state,
      board: nextBoard,
      currentMark: opposite(state.currentMark),
    }
  }

  // 라운드 종료: nextStarter 계산
  let nextStarter: Mark
  if (winner === 'draw') {
    // 직전 선공의 반대. 이번 라운드의 선공 = 초기 currentMark였던 값
    // currentMark/nextStarter는 매 착수마다 currentMark 바뀜. 직전 선공은 state가 초기화될 때의 nextStarter로 저장됨.
    // 간단 파생: 초기 선공 = 라운드 시작 시의 currentMark. 여기서는 state.nextStarter가 라운드 시작 시 currentMark와 같음.
    nextStarter = opposite(state.nextStarter)
  } else {
    // 패자 선공
    nextStarter = opposite(winner)
  }

  return {
    ...state,
    board: nextBoard,
    currentMark: opposite(state.currentMark),
    winner,
    winningLine: line,
    nextStarter,
  }
}

export const resetRound = (state: GameState): GameState => ({
  board: emptyBoard(),
  currentMark: state.nextStarter,
  nextStarter: state.nextStarter,
  winner: null,
  winningLine: null,
})
