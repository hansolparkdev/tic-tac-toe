import { useEffect, useRef } from 'react'

export interface ResetScoreDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ResetScoreDialog({ open, onCancel, onConfirm }: ResetScoreDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  // 오픈 시 [취소] 버튼에 포커스
  useEffect(() => {
    if (open) {
      // 다음 tick에 포커스 (마운트 직후)
      cancelRef.current?.focus()
    }
  }, [open])

  // ESC 처리
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return
    // 포커스 트랩: 취소 <-> 리셋 두 버튼 사이만
    const cancel = cancelRef.current
    const confirm = confirmRef.current
    if (!cancel || !confirm) return
    const active = document.activeElement
    e.preventDefault()
    if (e.shiftKey) {
      // 역방향
      if (active === cancel) confirm.focus()
      else cancel.focus()
    } else {
      if (active === cancel) confirm.focus()
      else cancel.focus()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      data-testid="reset-score-dialog-overlay"
      onClick={handleOverlayClick}
      className={[
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
        'animate-fade-in motion-reduce:animate-none',
      ].join(' ')}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-score-dialog-title"
        aria-describedby="reset-score-dialog-desc"
        onKeyDown={handleKeyDown}
        className={[
          'w-full max-w-sm rounded-lg bg-white p-6 shadow-xl',
          'animate-fade-in motion-reduce:animate-none',
        ].join(' ')}
      >
        <h2 id="reset-score-dialog-title" className="text-lg font-semibold text-gray-900">
          스코어 리셋
        </h2>
        <p id="reset-score-dialog-desc" className="mt-2 text-sm text-gray-700">
          스코어를 0부터 다시 시작할까요?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={[
              'rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-800',
              'transition-colors hover:bg-gray-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            취소
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={[
              'rounded-md bg-danger px-4 py-2 text-white',
              'transition-colors hover:bg-red-700',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2',
            ].join(' ')}
          >
            리셋
          </button>
        </div>
      </div>
    </div>
  )
}
