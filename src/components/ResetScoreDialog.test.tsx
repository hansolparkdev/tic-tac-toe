import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetScoreDialog } from './ResetScoreDialog'

describe('ResetScoreDialog', () => {
  it('open=false일 때 렌더되지 않는다', () => {
    render(<ResetScoreDialog open={false} onCancel={() => {}} onConfirm={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('open=true일 때 role="dialog"와 aria-modal=true로 렌더된다', () => {
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('헤더 "스코어 리셋"과 본문 안내 텍스트, [취소]/[리셋] 버튼 포함', () => {
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={() => {}} />)
    expect(screen.getByText('스코어 리셋')).toBeInTheDocument()
    expect(screen.getByText(/스코어를 0부터 다시 시작할까요/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '리셋' })).toBeInTheDocument()
  })

  it('오픈 시 [취소] 버튼에 포커스가 적용된다', () => {
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={() => {}} />)
    const cancel = screen.getByRole('button', { name: '취소' })
    expect(cancel).toHaveFocus()
  })

  it('ESC 키를 누르면 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={onCancel} onConfirm={() => {}} />)
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('오버레이 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={onCancel} onConfirm={() => {}} />)
    const overlay = screen.getByTestId('reset-score-dialog-overlay')
    await user.click(overlay)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('다이얼로그 내부 클릭은 onCancel을 호출하지 않는다', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={onCancel} onConfirm={() => {}} />)
    // 본문 텍스트를 클릭
    await user.click(screen.getByText(/스코어를 0부터 다시 시작할까요/))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('[리셋] 클릭 시 onConfirm이 호출된다', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: '리셋' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('[취소] 클릭 시 onCancel이 호출된다', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={onCancel} onConfirm={() => {}} />)
    await user.click(screen.getByRole('button', { name: '취소' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('Tab을 누르면 [취소] → [리셋]로 순환', async () => {
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={() => {}} />)
    const cancel = screen.getByRole('button', { name: '취소' })
    const reset = screen.getByRole('button', { name: '리셋' })
    expect(cancel).toHaveFocus()
    await user.tab()
    expect(reset).toHaveFocus()
    await user.tab()
    // 포커스 트랩: 다시 [취소]로
    expect(cancel).toHaveFocus()
  })

  it('Shift+Tab을 누르면 [취소] → [리셋]로 역방향 순환', async () => {
    const user = userEvent.setup()
    render(<ResetScoreDialog open={true} onCancel={() => {}} onConfirm={() => {}} />)
    const cancel = screen.getByRole('button', { name: '취소' })
    const reset = screen.getByRole('button', { name: '리셋' })
    expect(cancel).toHaveFocus()
    await user.tab({ shift: true })
    expect(reset).toHaveFocus()
  })
})
