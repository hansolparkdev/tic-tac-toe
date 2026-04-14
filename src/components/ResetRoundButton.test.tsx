import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetRoundButton } from './ResetRoundButton'

describe('ResetRoundButton', () => {
  it('"다시하기" 라벨을 가진 버튼', () => {
    render(<ResetRoundButton onReset={() => {}} pulsing={false} />)
    expect(screen.getByRole('button', { name: '다시하기' })).toBeInTheDocument()
  })

  it('클릭 시 onReset 호출', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<ResetRoundButton onReset={onReset} pulsing={false} />)
    await user.click(screen.getByRole('button', { name: '다시하기' }))
    expect(onReset).toHaveBeenCalled()
  })

  it('pulsing=true면 pulse-ring 클래스가 적용된다', () => {
    render(<ResetRoundButton onReset={() => {}} pulsing={true} />)
    const btn = screen.getByRole('button', { name: '다시하기' })
    expect(btn.className).toMatch(/animate-pulse-ring/)
  })

  it('pulsing=false면 pulse 클래스가 없다', () => {
    render(<ResetRoundButton onReset={() => {}} pulsing={false} />)
    const btn = screen.getByRole('button', { name: '다시하기' })
    expect(btn.className).not.toMatch(/animate-pulse-ring/)
  })
})
