import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameBoard } from './GameBoard'
import type { Board } from '../game/logic'

const emptyBoard = (): Board =>
  [null, null, null, null, null, null, null, null, null] as Board

describe('GameBoard', () => {
  it('9개의 셀을 렌더링한다', () => {
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={false}
        onPlay={() => {}}
      />,
    )
    expect(screen.getAllByRole('button')).toHaveLength(9)
  })

  it('셀 클릭 시 onPlay가 해당 인덱스로 호출된다', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={false}
        onPlay={onPlay}
      />,
    )
    const cells = screen.getAllByRole('button')
    await user.click(cells[4])
    expect(onPlay).toHaveBeenCalledWith(4)
  })

  it('ArrowRight 누르면 포커스가 (0,0)→(0,1)로 이동, Enter로 착수', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={false}
        onPlay={onPlay}
      />,
    )
    const cells = screen.getAllByRole('button')
    cells[0].focus()
    expect(cells[0]).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(cells[1]).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onPlay).toHaveBeenCalledWith(1)
  })

  it('ArrowDown으로 행 이동, Space로 착수', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={false}
        onPlay={onPlay}
      />,
    )
    const cells = screen.getAllByRole('button')
    cells[0].focus()
    await user.keyboard('{ArrowDown}')
    expect(cells[3]).toHaveFocus()
    await user.keyboard(' ')
    expect(onPlay).toHaveBeenCalledWith(3)
  })

  it('경계에서는 이동하지 않음 (ArrowLeft at col 0)', async () => {
    const user = userEvent.setup()
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={false}
        onPlay={() => {}}
      />,
    )
    const cells = screen.getAllByRole('button')
    cells[0].focus()
    await user.keyboard('{ArrowLeft}')
    expect(cells[0]).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(cells[0]).toHaveFocus()
  })

  it('disabled=true면 클릭해도 onPlay가 호출되지 않는다', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    render(
      <GameBoard
        board={emptyBoard()}
        winningLine={null}
        disabled={true}
        onPlay={onPlay}
      />,
    )
    const cells = screen.getAllByRole('button')
    await user.click(cells[0])
    expect(onPlay).not.toHaveBeenCalled()
  })
})
