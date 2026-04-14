import type { Mark, Scores } from './logic'

export const STORAGE_KEY = 'tic-tac-toe/v1'

export interface PersistedState {
  scores: Scores
  nextStarter: Mark
}

const defaultState = (): PersistedState => ({
  scores: { X: 0, draw: 0, O: 0 },
  nextStarter: 'X',
})

const isValidScores = (v: unknown): v is Scores => {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.X === 'number' &&
    Number.isFinite(o.X) &&
    o.X >= 0 &&
    typeof o.draw === 'number' &&
    Number.isFinite(o.draw) &&
    o.draw >= 0 &&
    typeof o.O === 'number' &&
    Number.isFinite(o.O) &&
    o.O >= 0
  )
}

const isValidPersisted = (v: unknown): v is PersistedState => {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return isValidScores(o.scores) && (o.nextStarter === 'X' || o.nextStarter === 'O')
}

export function load(): PersistedState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw === null) return defaultState()
    const parsed: unknown = JSON.parse(raw)
    if (!isValidPersisted(parsed)) return defaultState()
    return {
      scores: { X: parsed.scores.X, draw: parsed.scores.draw, O: parsed.scores.O },
      nextStarter: parsed.nextStarter,
    }
  } catch {
    return defaultState()
  }
}

export function save(state: PersistedState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 저장 실패는 무시 (사용자에게 노출하지 않음)
  }
}
