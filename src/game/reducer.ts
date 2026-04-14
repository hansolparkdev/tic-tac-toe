import { initialState, play, resetAll, resetRound } from './logic'
import type { GameState, Mark, Scores } from './logic'

export interface UiState extends GameState {
  shakeToken: number
  shakeIndex: number | null
  pulseToken: number
}

export const initialUiState = (): UiState => ({
  ...initialState(),
  shakeToken: 0,
  shakeIndex: null,
  pulseToken: 0,
})

export interface PersistedInit {
  scores: Scores
  nextStarter: Mark
}

export const uiStateFromPersisted = (p: PersistedInit): UiState => ({
  ...initialState(),
  scores: p.scores,
  nextStarter: p.nextStarter,
  currentMark: p.nextStarter,
  shakeToken: 0,
  shakeIndex: null,
  pulseToken: 0,
})

export type GameAction =
  | { type: 'PLAY'; index: number }
  | { type: 'RESET_ROUND' }
  | { type: 'RESET_ALL' }
  | { type: 'CLEAR_SHAKE' }

export function reducer(state: UiState, action: GameAction): UiState {
  switch (action.type) {
    case 'PLAY': {
      const { index } = action
      // 종료 상태: 보드 불변, 리셋 버튼 pulse 트리거
      if (state.winner !== null) {
        return { ...state, pulseToken: state.pulseToken + 1 }
      }
      // 점유 셀: shake 트리거, 보드 불변
      if (state.board[index] !== null) {
        return {
          ...state,
          shakeToken: state.shakeToken + 1,
          shakeIndex: index,
        }
      }
      const next = play(state, index)
      // play가 동일 참조를 반환하면 아무 변화 없음
      if (next === state) return state
      return {
        ...state,
        ...next,
        shakeIndex: null,
      }
    }
    case 'RESET_ROUND': {
      const next = resetRound(state)
      return {
        ...state,
        ...next,
        shakeIndex: null,
        pulseToken: 0,
      }
    }
    case 'RESET_ALL': {
      const next = resetAll()
      return {
        ...next,
        shakeToken: 0,
        shakeIndex: null,
        pulseToken: 0,
      }
    }
    case 'CLEAR_SHAKE':
      return { ...state, shakeIndex: null }
    default:
      return state
  }
}
