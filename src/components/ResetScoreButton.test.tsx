import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResetScoreButton } from './ResetScoreButton'

describe('ResetScoreButton', () => {
  it('"스코어 리셋" 텍스트를 표시하고 클릭 시 onClick을 호출한다', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<ResetScoreButton onClick={onClick} />)
    const btn = screen.getByRole('button', { name: '스코어 리셋' })
    await user.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
