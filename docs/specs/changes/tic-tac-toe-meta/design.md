# Design: tic-tac-toe-meta

## 사용 스택
- 언어: TypeScript
- 프레임워크: React 18 + Vite
- 스타일: Tailwind CSS
- 단위 테스트: Vitest + React Testing Library
- E2E 테스트: Playwright
- 영속화: 브라우저 sessionStorage
- 패키지 매니저: npm

## 아키텍처
- core 슬라이스의 `useReducer` 상태에 `scores` 필드를 확장한다.
- `src/game/storage.ts` 모듈이 sessionStorage 직렬화/역직렬화 단일 책임을 담당 (`load()`, `save({ scores, nextStarter })`).
- `App` 마운트 시 `load()`로 초기 state 구성, `useEffect([scores, nextStarter])`로 저장.
- `ResetScoreDialog` 컴포넌트가 모달 UI, 포커스 트랩, ESC/오버레이 핸들러를 소유.

## 데이터 모델
```ts
interface Scores { X: number; draw: number; O: number }

// core의 GameState 확장
interface GameState {
  board: Board;
  currentMark: Mark;
  nextStarter: Mark;
  winner: Mark | 'draw' | null;
  winningLine: [number, number, number] | null;
  scores: Scores;              // 추가
}

// sessionStorage payload (키: "tic-tac-toe/v1")
interface PersistedState { scores: Scores; nextStarter: Mark }
```

### 데이터 흐름
1. 앱 마운트 → `storage.load()` → 없으면 기본값(`scores = 0,0,0`, `nextStarter = 'X'`).
2. PLAY 후 winner 확정 시 reducer가 `scores[winner | 'draw']++` 수행.
3. `scores` 또는 `nextStarter` 변경 시 `useEffect`가 `storage.save()` 호출.
4. "스코어 리셋" 클릭 → 다이얼로그 open → [리셋] 선택 시 `RESET_ALL` action → scores 0/0/0, board 초기화, nextStarter = 'X'.

## 컴포넌트 구조
```
App
├─ Header
│   └─ ScoreBoard            (scores, currentMark)
│       ├─ ScoreCard (X)
│       ├─ ScoreCard (Draw)
│       └─ ScoreCard (O)
├─ (core 컴포넌트들)
├─ ActionBar
│   ├─ ResetRoundButton      (core)
│   └─ ResetScoreButton      (opens dialog)
└─ ResetScoreDialog          (role="dialog", focus trap)
```

## 기술 결정
| 결정 | 선택 | 이유 |
|------|------|------|
| 영속화 저장소 | sessionStorage | 요구사항: 탭 종료 시 초기화, 새로고침 유지 |
| 저장 키 | `tic-tac-toe/v1` | 스키마 변경 대비 버전 네임스페이스 |
| 저장 범위 | scores + nextStarter만 | 진행 중 보드는 복원하지 않는다는 요구사항 반영 |
| 다이얼로그 | 직접 구현 (라이브러리 없음) | 단일 다이얼로그, 의존성 최소화 |
| 카운트업 | CSS transition + key 변경 | 모션 감소 시 즉시 값 반영 (motion-reduce 유틸) |

## 의존성
- 선행 슬라이스: tic-tac-toe-core
- 런타임: 추가 패키지 없음
- 개발: 추가 패키지 없음
