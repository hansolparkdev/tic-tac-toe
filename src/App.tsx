import { useReducer, useEffect, useState } from 'react'
import { GameBoard } from './components/GameBoard'
import { TurnIndicator } from './components/TurnIndicator'
import { StatusMessage } from './components/StatusMessage'
import { ResetRoundButton } from './components/ResetRoundButton'
import { ScoreBoard } from './components/ScoreBoard'
import { ResetScoreButton } from './components/ResetScoreButton'
import { ResetScoreDialog } from './components/ResetScoreDialog'
import { reducer, uiStateFromPersisted } from './game/reducer'
import { load, save } from './game/storage'

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    uiStateFromPersisted(load()),
  )
  const [pulseActive, setPulseActive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // scores/nextStarter 변경 시 sessionStorage에 저장
  useEffect(() => {
    save({ scores: state.scores, nextStarter: state.nextStarter })
  }, [state.scores, state.nextStarter])

  // pulseToken이 증가할 때마다 pulse를 잠깐 활성화 (1초 후 해제)
  useEffect(() => {
    if (state.pulseToken === 0) {
      setPulseActive(false)
      return
    }
    setPulseActive(true)
    const t = window.setTimeout(() => setPulseActive(false), 1000)
    return () => window.clearTimeout(t)
  }, [state.pulseToken])

  const gameOver = state.winner !== null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 py-8 text-gray-900">
      <h1 className="text-3xl font-semibold tracking-tight">Tic-Tac-Toe</h1>
      <ScoreBoard scores={state.scores} currentMark={state.currentMark} active={!gameOver} />
      <TurnIndicator currentMark={state.currentMark} active={!gameOver} />
      <GameBoard
        board={state.board}
        winningLine={state.winningLine}
        disabled={false}
        shakeIndex={state.shakeIndex}
        onPlay={(index) => dispatch({ type: 'PLAY', index })}
      />
      <StatusMessage winner={state.winner} />
      <div className="flex items-center gap-3">
        <ResetRoundButton
          onReset={() => dispatch({ type: 'RESET_ROUND' })}
          pulsing={pulseActive}
        />
        <ResetScoreButton onClick={() => setDialogOpen(true)} />
      </div>
      <ResetScoreDialog
        open={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          dispatch({ type: 'RESET_ALL' })
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

export default App
