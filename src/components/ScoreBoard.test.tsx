import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreBoard } from './ScoreBoard'

describe('ScoreBoard', () => {
  it('3개의 카드를 렌더하고 값을 표시한다', () => {
    render(
      <ScoreBoard scores={{ X: 2, draw: 1, O: 0 }} currentMark="X" active={true} />,
    )
    // 접근 가능 텍스트 (aria-label) 확인
    expect(screen.getByLabelText('X 2승')).toBeInTheDocument()
    expect(screen.getByLabelText('무승부 1')).toBeInTheDocument()
    expect(screen.getByLabelText('O 0승')).toBeInTheDocument()
  })

  it('현재 차례(X)일 때 X 카드에 강조 클래스 적용', () => {
    render(
      <ScoreBoard scores={{ X: 0, draw: 0, O: 0 }} currentMark="X" active={true} />,
    )
    const xCard = screen.getByLabelText('X 0승')
    const oCard = screen.getByLabelText('O 0승')
    expect(xCard.getAttribute('data-active')).toBe('true')
    expect(oCard.getAttribute('data-active')).toBe('false')
  })

  it('현재 차례가 O로 바뀌면 강조가 O 카드로 이동', () => {
    render(
      <ScoreBoard scores={{ X: 1, draw: 0, O: 0 }} currentMark="O" active={true} />,
    )
    const xCard = screen.getByLabelText('X 1승')
    const oCard = screen.getByLabelText('O 0승')
    expect(xCard.getAttribute('data-active')).toBe('false')
    expect(oCard.getAttribute('data-active')).toBe('true')
  })

  it('게임 종료 상태(active=false)에서는 어떤 카드도 강조되지 않는다', () => {
    render(
      <ScoreBoard scores={{ X: 1, draw: 0, O: 0 }} currentMark="X" active={false} />,
    )
    expect(screen.getByLabelText('X 1승').getAttribute('data-active')).toBe('false')
    expect(screen.getByLabelText('O 0승').getAttribute('data-active')).toBe('false')
  })

  it('라벨 X / Draw / O 노출', () => {
    render(
      <ScoreBoard scores={{ X: 3, draw: 2, O: 1 }} currentMark="X" active={true} />,
    )
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('Draw')).toBeInTheDocument()
    expect(screen.getByText('O')).toBeInTheDocument()
  })

  it('숫자 값이 표시된다', () => {
    render(
      <ScoreBoard scores={{ X: 3, draw: 2, O: 1 }} currentMark="X" active={true} />,
    )
    const xCard = screen.getByLabelText('X 3승')
    const drawCard = screen.getByLabelText('무승부 2')
    const oCard = screen.getByLabelText('O 1승')
    expect(xCard.textContent).toMatch(/3/)
    expect(drawCard.textContent).toMatch(/2/)
    expect(oCard.textContent).toMatch(/1/)
  })

  it('값 증가 시 카운트업 애니메이션 클래스 적용', () => {
    const { rerender } = render(
      <ScoreBoard scores={{ X: 0, draw: 0, O: 0 }} currentMark="X" active={true} />,
    )
    rerender(
      <ScoreBoard scores={{ X: 1, draw: 0, O: 0 }} currentMark="O" active={true} />,
    )
    const xCard = screen.getByLabelText('X 1승')
    // 카운트업 애니메이션은 key 변경 + 클래스로 처리됨
    const valueEl = xCard.querySelector('[data-role="score-value"]')
    expect(valueEl).not.toBeNull()
    expect(valueEl!.className).toMatch(/animate-countup|motion-reduce:animate-none/)
  })
})
