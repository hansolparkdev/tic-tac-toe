# Proposal: tic-tac-toe-core

## Intent
설치/회원가입 없이 즉시 플레이할 수 있는 2인용 틱택토의 핵심 게임플레이(보드 착수, 승패 판정, 라운드 리셋, 선공 교대 규칙)를 구현한다. 접근성 기본(키보드 네비, aria, prefers-reduced-motion)을 함께 포함해 단독으로 한 판을 완결할 수 있는 최소 배포 단위를 제공한다.

## Scope
### In Scope
- 3×3 보드 렌더링 및 X/O 번갈아 착수
- 가로·세로·대각선 3연속 승리 판정, 9칸 꽉 찬 무승부 판정
- 승리 라인 SVG 오버레이 (리사이즈 시 좌표 재계산)
- 현재 차례 인디케이터
- "다시하기" 버튼 (보드만 초기화)
- 선공 교대 규칙 (직전 패자 선공, 무승부 시 직전 선공 반대)
- 접근성: 셀 aria-label, aria-live 상태 메시지, Tab/Arrow/Enter/Space 키보드 네비, prefers-reduced-motion 대응
- 잘못된 착수 피드백 (점유 셀 shake, 종료 후 다시하기 pulse)

### Out of Scope
- 누적 스코어보드 숫자 표시 및 카운트업 애니메이션
- sessionStorage 영속화
- 스코어 리셋 및 확인 다이얼로그
- 다크모드, 효과음, AI 대전

## Approach
순수 함수로 게임 상태 전이(board, currentMark, winner, winningLine, nextStarter)를 정의하고, React 컴포넌트는 상태 렌더링과 이벤트 디스패치만 담당한다. 승리 라인 좌표는 보드 DOM에서 `getBoundingClientRect`로 계산하며 `ResizeObserver`로 재계산한다. 애니메이션은 Tailwind 유틸과 CSS `@media (prefers-reduced-motion: reduce)`로 토글한다.

## 메타
- feature: tic-tac-toe
- type: frontend
- 변경 유형: ADDED
- 영향 도메인:
  - game: ADDED
- 패키지: .
