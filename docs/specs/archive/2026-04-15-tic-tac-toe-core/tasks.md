# Tasks: tic-tac-toe-core

- [x] 1. 프로젝트 초기화 및 스타일 베이스
  - [x] 1-1. Vite + React + TS 스캐폴딩 확인, Tailwind 설정, 컬러 토큰 (X=blue, O=coral) 등록
  - [x] 1-2. 전역 레이아웃 (세로 중앙 정렬, 헤더/보드/상태/액션 영역) 뼈대

- [x] 2. 게임 로직 순수 함수 (`src/game/logic.ts`)
  - [x] 2-1. `initialState`, `play(state, index)`, `resetRound(state)` 구현
  - [x] 2-2. `evaluate(board)` 승리 라인 탐지 (8가지 라인) + 무승부 판정
  - [x] 2-3. 선공 교대 규칙 (패자 선공 / 무승부 시 직전 선공 반대) 적용
  - [x] 2-4. Vitest 단위 테스트: 승리 8케이스, 무승부, 선공 교대 규칙 전 케이스

- [x] 3. UI 컴포넌트
  - [x] 3-1. `Cell` (aria-label "N행 M열, 비어있음/X/O", pop/shake 애니메이션, motion-reduce 대응)
  - [x] 3-2. `GameBoard` + roving tabindex 키보드 네비 (Arrow/Enter/Space)
  - [x] 3-3. `TurnIndicator`, `StatusMessage` (aria-live="polite"), `ResetRoundButton`
  - [x] 3-4. `WinningLine` SVG + ResizeObserver 좌표 재계산

- [x] 4. 통합
  - [x] 4-1. `App`에서 useReducer 연결, 종료 후 셀 클릭 시 다시하기 pulse 트리거
  - [x] 4-2. RTL 통합 테스트: 한 판 진행 → 승리 → 다시하기 → 선공 교대 확인

## 의존관계
선행 슬라이스: 없음
