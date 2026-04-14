# CLAUDE.md

## 프로젝트 타입
frontend

## 기술 스택
- 언어·프레임워크: TypeScript + React 18 + Vite
- 패키지 매니저: npm
- 단위 테스트: Vitest + React Testing Library
- E2E: Playwright
- UI 라이브러리: Tailwind CSS

## 아키텍처
- 패턴: 없음 (단순 SPA)
- 폴더 구조: feature-based

## 테스트 폴더
소스 옆 (co-located — 예: `src/components/Foo.tsx` ↔ `src/components/Foo.test.tsx`)

## 설치 명령
```
npm install
```

## 단위 테스트 명령
- 전체: `npm test`
- 단일 파일: `npm test -- src/components/Foo.test.tsx`
- 커버리지: `npm run coverage`

## E2E 명령
- 헤드리스 (기본): `npm run e2e`
- 헤디드 (디버깅): `npm run e2e:headed`

## 개발 서버
```
npm run dev
```

## 보안 스캔
```
npm run audit
```

## 코드 컨벤션
린트·포맷은 자동 적용 (ESLint + Prettier + husky pre-commit).
예외 사례:
- 함수형 컴포넌트만 사용
- Props 타입 명시 필수
