import { describe, it, expect, beforeEach } from 'vitest'
import { load, save, STORAGE_KEY } from './storage'

describe('storage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('저장된 값이 없으면 기본값 반환', () => {
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 0, draw: 0, O: 0 }, nextStarter: 'X' })
  })

  it('save 후 load 하면 동일 값 복원', () => {
    save({ scores: { X: 2, draw: 1, O: 1 }, nextStarter: 'O' })
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 2, draw: 1, O: 1 }, nextStarter: 'O' })
  })

  it('저장 키는 "tic-tac-toe/v1"', () => {
    expect(STORAGE_KEY).toBe('tic-tac-toe/v1')
    save({ scores: { X: 3, draw: 0, O: 0 }, nextStarter: 'X' })
    const raw = sessionStorage.getItem('tic-tac-toe/v1')
    expect(raw).not.toBeNull()
  })

  it('파싱 불가능한 JSON이면 기본값 반환 (예외 미노출)', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not-json')
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 0, draw: 0, O: 0 }, nextStarter: 'X' })
  })

  it('스키마가 불일치하면 기본값 반환', () => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 0, draw: 0, O: 0 }, nextStarter: 'X' })
  })

  it('scores 필드에 음수/비숫자가 있으면 기본값 반환', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ scores: { X: -1, draw: 0, O: 0 }, nextStarter: 'X' }),
    )
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 0, draw: 0, O: 0 }, nextStarter: 'X' })
  })

  it('nextStarter가 X/O가 아니면 기본값 반환', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ scores: { X: 1, draw: 0, O: 0 }, nextStarter: 'Z' }),
    )
    const loaded = load()
    expect(loaded).toEqual({ scores: { X: 0, draw: 0, O: 0 }, nextStarter: 'X' })
  })
})
