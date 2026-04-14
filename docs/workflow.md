# 개발 워크플로우

## 전체 흐름

```
[프로젝트 최초 1회]
CLAUDE.md 작성      설치 명령 / 테스트 명령 / 컨벤션 등 프로젝트 환경 정의
      ↓
/planning {기능명}   기획 에이전트 + 비평 에이전트 → plan.md
      ↓
/spec {기능명}       아키텍트 → 기존 스펙 확인 → ADDED/MODIFIED 판단 → 스펙 작성
      ↓
/dev {기능명}        슬라이스별 순서대로:
                     개발 → 리뷰 루프 → 테스트 → sync → archive
```

## CLAUDE.md

프로젝트 루트에 **한 번만** 작성하는 파일. 기능이 추가될 때마다 바꾸는 게 아님.

```markdown
# CLAUDE.md

## 설치 명령
(예: npm install / pip install -r requirements.txt / poetry install)

## 테스트 명령
- 전체: (예: npm test / pytest)
- 단일 파일: (예: npm test -- --testPathPattern=파일명 / pytest tests/test_auth.py)
- 커버리지: (예: npm test -- --coverage / pytest --cov)

## 개발 서버
(예: npm run dev / uvicorn main:app --reload)

## 보안 스캔
(예: npm audit / pip-audit)

## 코드 컨벤션
- (팀 규칙 작성)
```

---

## 디렉토리 구조

```
docs/
├── design/
│   ├── DESIGN.md                        ← 공통 디자인 시스템 (기본 참조)
│   └── {feature}/
│       ├── stitch-prompt.md             ← Stitch 생성 프롬프트
│       └── ui.png                       ← Stitch UI 결과물
│
├── plans/
│   └── {feature}/
│       └── plan.md
│
└── specs/
    ├── main/                            ← source of truth (누적 병합)
    │   └── {domain}/
    │       └── spec.md
    │
    ├── changes/                         ← 진행 중인 변경사항
    │   ├── {feature}-{slice}/           ← 슬라이스 = change 단위
    │   │   ├── proposal.md              ← 의도 + 범위 + 변경유형 + 영향 도메인
    │   │   ├── design.md
    │   │   ├── tasks.md
    │   │   └── specs/                   ← 영향받는 도메인별 spec
    │   │       ├── auth/
    │   │       │   └── spec.md          ← delta (ADDED/MODIFIED/REMOVED)
    │   │       └── user/
    │   │           └── spec.md
    │   └── {feature}-{slice2}/
    │       └── ...
    │
    └── archive/                         ← 완료된 변경사항
        └── YYYY-MM-DD-{feature}-{slice}/
            ├── proposal.md
            ├── design.md
            ├── tasks.md
            └── specs/
                └── {domain}/
                    └── spec.md
```

---

## 1. 기획 단계 (/planning)

**에이전트:** 기획 에이전트 + 비평 에이전트

**흐름**
```
기획 에이전트: 초안 작성
      ↓
비평 에이전트: 비평 (메인이 회차 정보 전달)
      ↓
기획 에이전트: 피드백 반영
      ↓
PASS 또는 3회 완료 시 종료
      ↓
docs/plans/{feature}/plan.md 저장
```

**디자인 (선택, 사람이 직접)**
```
plan.md → Google Stitch 입력 → UI 생성
결과물 → docs/design/{feature}/ 저장
```

---

## 2. 스펙 단계 (/spec)

**에이전트:** 아키텍트

**핵심: 기존 스펙 확인 → ADDED/MODIFIED 판단**

```
docs/specs/main/ 확인
      ↓
관련 도메인 없음 → 신규 (ADDED only)
관련 도메인 있음 → 수정 (ADDED/MODIFIED/REMOVED 혼합)
      ↓
슬라이싱 → 각 슬라이스별 4개 파일 작성
```

**proposal.md 필수 포함 항목**
```
- 변경 유형: ADDED | MODIFIED
- 도메인: {domain}   ← sync 시 main/{domain}/spec.md 에 반영
- 기존 스펙 경로 (신규면 "없음")
```

---

## 3. 개발 단계 (/dev)

**에이전트:** 개발 에이전트 + 리뷰어 + 테스터

**슬라이스별 순서대로 (01 → 02 → ...) 처리**

각 슬라이스마다:
```
개발 에이전트: CLAUDE.md 읽기(없으면 넘어감) → TDD → 구현
      ↓
리뷰어: 코드 리뷰 (메인이 회차 전달, 최대 3회)
  FAIL → 개발 에이전트 재개발
  PASS → 다음 단계
      ↓
테스터: spec 시나리오 → E2E 작성 → 실행 → 보안 스캔
      ↓
Sync: delta → docs/specs/main/{domain}/spec.md 반영
      ↓
Archive: YYYY-MM-DD-{feature}-{slice}/ 로 이동
```

**디자인 참조 규칙**
```
1. docs/design/{feature}/ 있으면 우선
2. 없으면 docs/design/DESIGN.md
3. 둘 다 없으면 넘어감
```

---

## 4. Sync 상세

**ADDED (신규):**
```
spec.md ADDED → main/{domain}/spec.md 에 추가
(파일 없으면 새로 생성)
```

**MODIFIED (수정):**
```
delta 반영 순서: REMOVED → MODIFIED → ADDED
- REMOVED: 해당 요구사항 삭제
- MODIFIED: 해당 요구사항 전체 교체
- ADDED: 새 요구사항 추가
```

**sync 실패 시 아카이브 금지** — 데이터 무결성 보장

---

## 5. Archive 상세

```
슬라이스 단위로 아카이브:
changes/{feature}/01-{slice}/
→ archive/2025-01-24-{feature}-01-{slice}/

같은 기능 반복 수정 시:
archive/2025-01-24-login-01-email/   ← 1차
archive/2025-01-31-login-01-email/   ← 2차 (날짜가 달라 충돌 없음)
```

---

## 에이전트 목록

| 에이전트 | 역할 | 단계 |
|---------|------|------|
| 기획 에이전트 | plan.md 작성 | 기획 |
| 비평 에이전트 | PASS/FAIL 비평 (회차 수신) | 기획 |
| 아키텍트 | 기존 스펙 확인 + 슬라이싱 + OpenSpec 형식 작성 | 스펙 |
| 개발 에이전트 | CLAUDE.md 참조 + TDD + 구현 | 개발 |
| 리뷰어 | 전체 스펙(main+delta) 기준 코드 리뷰 (회차 수신) | 개발 |
| 테스터 | spec 시나리오 → E2E + 보안 스캔 | 개발 |

---

## 스킬

```
/planning {기능명}         기획 → plan.md (3회 FAIL 시 경고 포함 저장 후 유저 확인)
/spec {기능명}             스펙 → changes/{feature}-{slice}/ (flat 구조)
/dev {feature}-{slice}     단일 슬라이스 개발 → sync → archive
```

## 재진입 방법 (중단된 경우)
```
sync만 재실행    → "sync만 실행해줘" 요청
테스트만 재실행  → "테스트만 재실행해줘" 요청
```

## 주의사항
- `/spec`과 `/dev` 경로 규약: 반드시 `changes/{feature}-{slice}/` flat 구조
- 슬라이스 의존관계: tasks.md `## 의존관계` 기준, 선행 슬라이스 archive 확인 후 실행
- 테스트 실행 전: 로컬 서버 + 테스트 DB + 환경 변수 준비 필요
- sync 실패 시: 아카이브 하지 않음

## 속도 / 컨텍스트 주의사항

**병목 구간:**
- 리뷰 루프 3회 × (리뷰 + 재구현) = 가장 큰 컨텍스트 소비 구간
  → 치명적 문제 없으면 1~2회차에 PASS 가능 (3회 채울 필요 없음)
- 기획 루프도 동일: 명확한 요구사항이면 1회에 PASS

**컨텍스트 절약 규칙:**
- 각 에이전트는 자기 역할에 필요한 파일만 읽음 (type 기반 스킵 적용)
  - backend: design.md, plan.md, UX 체크리스트 읽지 않음
  - frontend: design.md(API) 읽지 않음
- 리뷰어 출력: FAIL 항목만 상세 기술 (PASS 항목 나열 금지)
- 테스터: 커버리지는 TDD 결과 확인만 (별도 재실행 금지)

**슬라이스 크기:**
- 슬라이스가 너무 크면 리뷰 루프 비용이 기하급수적으로 증가
- 1-3일 작업량으로 분리 권장
