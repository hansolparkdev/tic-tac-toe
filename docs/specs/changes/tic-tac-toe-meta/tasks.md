# Tasks: tic-tac-toe-meta

- [ ] 1. 상태 확장 및 스코어 로직
  - [ ] 1-1. `GameState`에 `scores` 추가, reducer에 승리/무승부 시 scores 증가 로직
  - [ ] 1-2. `RESET_ALL` action: scores 0/0/0, board 초기화, nextStarter='X'
  - [ ] 1-3. Vitest: 2라운드 시뮬레이션으로 스코어 누적, 선공 교대, RESET_ALL 검증

- [ ] 2. sessionStorage 영속화
  - [ ] 2-1. `src/game/storage.ts` 구현 (`load`, `save`, 키 `tic-tac-toe/v1`, JSON 스키마 가드)
  - [ ] 2-2. `App` 마운트 시 load, scores/nextStarter 변경 시 save (useEffect)
  - [ ] 2-3. Vitest: storage 모듈 단위 테스트 (불량 JSON 복원 실패 시 기본값 반환)

- [ ] 3. 스코어보드 UI
  - [ ] 3-1. `ScoreBoard` + `ScoreCard` 3분할, 현재 차례 카드 강조 테두리
  - [ ] 3-2. 카운트업 애니메이션 (motion-reduce 시 즉시 반영)

- [ ] 4. 스코어 리셋 다이얼로그
  - [ ] 4-1. `ResetScoreDialog` (role="dialog", aria-modal, 기본 포커스 [취소])
  - [ ] 4-2. ESC/오버레이 클릭 = 취소, Tab 포커스 트랩, [리셋] = RESET_ALL dispatch
  - [ ] 4-3. RTL 테스트: 포커스 트랩, ESC 닫힘, [리셋] 시 스코어 0 초기화

## 의존관계
선행 슬라이스: tic-tac-toe-core
