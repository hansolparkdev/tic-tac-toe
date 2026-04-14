# Design: tic-tac-toe-core

## 사용 스택
- 언어: TypeScript
- 프레임워크: React 18 + Vite
- 스타일: Tailwind CSS
- 단위 테스트: Vitest + React Testing Library
- E2E 테스트: Playwright
- 패키지 매니저: npm

## 아키텍처
- 단일 페이지 SPA. `App` 하위에 `GameBoard`, `TurnIndicator`, `StatusMessage`, `ActionBar`.
- 게임 로직은 순수 함수 모듈 `src/game/logic.ts`로 분리 (React 비의존, Vitest로 100% 커버).
- 상태는 `useReducer`로 단일 store 관리. action: `PLAY(cellIndex)`, `RESET_ROUND`.
- 승리 라인 오버레이는 `WinningLine` 컴포넌트에서 SVG로 렌더링, `ResizeObserver`로 셀 중심 좌표 재계산.

## 데이터 모델
```ts
type Mark = 'X' | 'O';
type Cell = Mark | null;
type Board = Cell[]; // length 9, index 0~8

interface GameState {
  board: Board;
  currentMark: Mark;   // 지금 놓을 차례
  nextStarter: Mark;   // 다음 라운드 선공 (라운드 종료 시 갱신)
  winner: Mark | 'draw' | null;
  winningLine: [number, number, number] | null;
}
```

### 데이터 흐름
1. 셀 클릭 → `PLAY(i)` dispatch → 점유/종료 셀이면 `shake` 플래그만 토글.
2. reducer가 보드 갱신 후 `evaluate(board)`로 winner/line 계산.
3. winner 확정 시 `nextStarter`를 규칙대로 갱신 (패자 = 반대 마크; draw 시 직전 선공의 반대).
4. `RESET_ROUND` → board 비우고 `currentMark = nextStarter`.

## 컴포넌트 구조
```
App
├─ TurnIndicator         (currentMark)
├─ GameBoard             (board, winningLine, onPlay)
│   ├─ Cell × 9          (value, disabled, aria-label, onClick, onKeyDown)
│   └─ WinningLine (SVG) (line, reducedMotion)
├─ StatusMessage         (aria-live="polite")
└─ ActionBar
    └─ ResetRoundButton  (다시하기)
```

## 기술 결정
| 결정 | 선택 | 이유 |
|------|------|------|
| 상태 관리 | useReducer | 전이 규칙 순수 함수화 용이, 외부 라이브러리 불필요 |
| 승리 라인 | SVG + getBoundingClientRect | 셀 크기/위치 반응형 대응 정확 |
| 리사이즈 감지 | ResizeObserver | window resize보다 보드 자체 변화 감지 정확 |
| 키보드 네비 | roving tabindex (보드 자체 tabIndex=0, 내부 포커스 인덱스 관리) | Tab 진입 1회 + Arrow 이동 표준 패턴 |
| 애니메이션 토글 | CSS `@media (prefers-reduced-motion: reduce)` | JS 분기 없이 Tailwind `motion-reduce:` 유틸로 일관 처리 |

## 의존성
- 선행 슬라이스: 없음
- 런타임: react, react-dom
- 개발: vitest, @testing-library/react, @testing-library/jest-dom, @playwright/test, tailwindcss
