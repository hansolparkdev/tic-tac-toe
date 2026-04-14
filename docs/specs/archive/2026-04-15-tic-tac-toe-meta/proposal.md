# Proposal: tic-tac-toe-meta

## Intent
핵심 게임플레이 위에 여러 라운드 연속 대결 경험을 완성한다. 누적 스코어보드, 스코어 리셋(확인 다이얼로그 포함), sessionStorage 영속화를 추가해 탭이 유지되는 동안 점수와 다음 선공이 보존되도록 한다.

## Scope
### In Scope
- 누적 스코어보드 UI (X 승수 / Draw / O 승수 카드 3분할, 현재 차례 카드 강조)
- 승리/무승부 확정 시 스코어 갱신 및 카운트업 애니메이션
- "스코어 리셋" 버튼 + 확인 다이얼로그 (기본 포커스 [취소], ESC/오버레이 클릭 취소, 포커스 트랩)
- sessionStorage 영속화: 누적 스코어 + 다음 라운드 선공 저장/복원
- 새로고침 시 복원 (진행 중 보드는 초기화, 스코어와 선공은 유지)

### Out of Scope
- localStorage/서버 저장
- 다크모드, 효과음
- AI 대전, 온라인 대전

## Approach
core 슬라이스의 `GameState`에 `scores: { X: number; draw: number; O: number }`를 추가하고, reducer의 승리/무승부 전이 시 스코어를 증가시킨다. `useEffect`로 상태 변경마다 sessionStorage에 `{ scores, nextStarter }`만 직렬화 저장하며, 최초 마운트 시 복원한다. 다이얼로그는 헤드리스 접근성 패턴(role="dialog", aria-modal, 포커스 트랩)을 직접 구현한다.

## 메타
- feature: tic-tac-toe
- type: frontend
- 변경 유형: ADDED
- 영향 도메인:
  - game: ADDED
- 패키지: .
