import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Cell } from './Cell'

describe('Cell', () => {
  it('비어있는 셀은 aria-label "N행 M열, 비어있음"을 가진다', () => {
    render(
      <Cell
        value={null}
        row={0}
        col={1}
        index={1}
        focused={false}
        disabled={false}
        onActivate={() => {}}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label', '1행 2열, 비어있음')
  })

  it('X가 놓인 셀은 aria-label "N행 M열, X"를 가진다', () => {
    render(
      <Cell
        value="X"
        row={1}
        col={1}
        index={4}
        focused={false}
        disabled={false}
        onActivate={() => {}}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label', '2행 2열, X')
    expect(btn).toHaveTextContent('X')
  })

  it('O가 놓인 셀은 aria-label "N행 M열, O"를 가진다', () => {
    render(
      <Cell
        value="O"
        row={2}
        col={0}
        index={6}
        focused={false}
        disabled={false}
        onActivate={() => {}}
      />,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-label', '3행 1열, O')
    expect(btn).toHaveTextContent('O')
  })

  it('클릭하면 onActivate가 호출된다', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    render(
      <Cell
        value={null}
        row={0}
        col={0}
        index={0}
        focused={false}
        disabled={false}
        onActivate={onActivate}
      />,
    )
    await user.click(screen.getByRole('button'))
    expect(onActivate).toHaveBeenCalledWith(0)
  })

  it('focused=true면 tabIndex=0, 아니면 -1', () => {
    const { rerender } = render(
      <Cell
        value={null}
        row={0}
        col={0}
        index={0}
        focused={true}
        disabled={false}
        onActivate={() => {}}
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
    rerender(
      <Cell
        value={null}
        row={0}
        col={0}
        index={0}
        focused={false}
        disabled={false}
        onActivate={() => {}}
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '-1')
  })
})
