# Team-Mapo: BNI 마포홍보관 에이전트 팀즈 (온디맨드)

Claude Code의 **에이전트 팀즈(Agent Teams)** 기능을 사용하여 BNI 마포홍보관 프로젝트의 멀티 에이전트 개발팀을 구성합니다.

**운영 방식: 온디맨드** - 전원 상시 대기가 아닌, 작업 요청 시 필요한 팀원만 스폰합니다.

## 실행 지침

이 커맨드가 호출되면, 리더(메인 세션)는 아래 절차를 따릅니다.

### Step 1: 팀 생성 (팀원 스폰 없이)

```
TeamCreate({
  team_name: "team-mapo",
  description: "BNI 마포홍보관 온디맨드 개발팀"
})
```

### Step 2: 사용자에게 안내

```
마포 팀 준비 완료. (온디맨드 모드)

작업 요청 시 필요한 팀원만 투입합니다.
자연어로 기능/버그/리팩토링을 요청하세요.
"팀 종료"를 말하면 팀을 해체합니다.
```

**팀원은 스폰하지 않습니다.** 사용자의 작업 요청이 들어온 후 필요한 팀원만 스폰합니다.

---

## 온디맨드 스폰 규칙

### 작업 요청이 들어오면

1. **리더가 직접 분석**: 사용자 요청의 규모와 영향 범위를 판단
2. **필요한 팀원만 스폰**: 아래 판단 기준에 따라 최소 인원 투입
3. **작업 완료 후 즉시 종료**: 팀원이 작업을 마치면 shutdown_request로 종료

### 스폰 판단 기준

| 작업 유형 | 스폰 대상 | 예시 |
|-----------|-----------|------|
| 단순 수정 (1~2파일) | 1명 | 버튼 텍스트 변경 → dev-ui |
| 버그 수정 | 1~2명 | 로그인 오류 → dev-core |
| 소규모 기능 | 2명 | 검색 개선 → dev-core + dev-ui |
| 중규모 기능 (DB 변경) | 2~3명 | 주문 개편 → dev-infra + dev-core + dev-ui |
| 대규모 기능 | 3~4명 | 회원등급 → dev-infra + dev-core + dev-ui + qa |
| E2E 테스트 | 1명 | 로그인 테스트 → qa |
| 기획/분석만 | 1명 | 요구사항 분석 → planner |

### 동시 최대 에이전트 수: 2명 (권장)

`.claude.json` 동시 접근 충돌 방지를 위해, 동시 실행 에이전트는 **최대 2명**을 권장합니다.
3명 이상 필요 시 순차 실행합니다: 선행 작업 완료 → 종료 → 다음 팀원 스폰.

---

## 팀원 스폰 템플릿

필요 시 아래 템플릿으로 스폰합니다:

**기획자 (planner)** - read-only, 분석/기획만
```
Task({
  subagent_type: "planner", model: "opus", name: "planner", team_name: "team-mapo",
  prompt: "BNI 마포 기획자. 요구사항 분석 및 기획서 작성.\n- 프로젝트: C:/Users/user/bnimapo\n- DB: Supabase (profiles, products, orders, settings, chapters, dream_referrals)\n- 기획서는 ## 요구사항, ## 서브태스크, ## 영향 파일 형식\n- 답변은 한글로",
  run_in_background: true
})
```

**인프라 개발자 (dev-infra)** - DB/유틸리티 선행 작업
```
Task({
  subagent_type: "executor", model: "sonnet", name: "dev-infra", team_name: "team-mapo",
  isolation: "worktree",
  prompt: "인프라 개발자. 담당: supabase/migrations/**, supabase/functions/**, src/utils/**\n- 할당된 태스크만 작업, 완료 후 TaskUpdate(completed)\n- 답변은 한글로",
  run_in_background: true
})
```

**핵심 로직 개발자 (dev-core)** - 비즈니스 로직
```
Task({
  subagent_type: "executor", model: "sonnet", name: "dev-core", team_name: "team-mapo",
  isolation: "worktree",
  prompt: "핵심 로직 개발자. 담당: src/hooks/**, src/lib/**\n- Zustand 스토어, Supabase 클라이언트\n- 할당된 태스크만 작업, 완료 후 TaskUpdate(completed)\n- 답변은 한글로",
  run_in_background: true
})
```

**UI 개발자 (dev-ui)** - 컴포넌트/페이지
```
Task({
  subagent_type: "executor", model: "sonnet", name: "dev-ui", team_name: "team-mapo",
  isolation: "worktree",
  prompt: "UI 개발자. 담당: src/components/**, src/pages/**, src/styles/**\n- Tailwind CSS 4, Framer Motion, React Icons\n- 할당된 태스크만 작업, 완료 후 TaskUpdate(completed)\n- 답변은 한글로",
  run_in_background: true
})
```

**QA 테스터 (qa)** - E2E 테스트
```
Task({
  subagent_type: "qa-tester", model: "sonnet", name: "qa", team_name: "team-mapo",
  prompt: "QA 테스터. Playwright E2E 테스트.\n- 테스트 계정: info_nomu@naver.com / 0123456\n- 새 브라우저 인스턴스로 실행, networkidle 금지 → domcontentloaded\n- 답변은 한글로",
  run_in_background: true
})
```

---

## 리더 행동 규칙

### 리더는 직접 개발하지 않음

- 코드 분석/탐색: planner 또는 서브에이전트에 위임
- 코드 수정/작성: dev-infra, dev-core, dev-ui에 위임
- 테스트 실행: qa에 위임
- DB 작업(RLS, 마이그레이션): 리더가 직접 실행 (예외)
- git 작업(커밋, 푸시, PR): 리더가 직접 실행 (예외)

---

## 온디맨드 워크플로우

```
사용자 요청
  ↓
리더: 규모 판단 → 필요한 팀원 스폰 (최대 2명 동시)
  ↓
팀원: 작업 수행 → TaskUpdate(completed) → 리더에게 보고
  ↓
리더: 팀원 shutdown → 빌드 검증 → 결과 보고
  ↓
(DB 변경이 필요하면 먼저 dev-infra 스폰 → 완료 → 종료 → dev-core/dev-ui 스폰)
```

---

## 파일 소유권 (충돌 방지)

```
planner:   분석/기획 문서 (코드 수정 없음)
dev-core:  src/hooks/**, src/lib/**
dev-ui:    src/components/**, src/pages/**, src/styles/**, src/assets/**
dev-infra: supabase/migrations/**, supabase/functions/**, src/utils/**
리더:      package.json, App.jsx, main.jsx, index.html, vite.config.js, git/이슈 관리
```

## 브랜치 전략

| 유형 | 패턴 | 예시 |
|------|------|------|
| 신규 기능 | `feat/{name}` | `feat/member-grade` |
| 버그 수정 | `fix/{desc}` | `fix/product-upload` |
| 리팩토링 | `refactor/{scope}` | `refactor/auth-flow` |
| 긴급 | `hotfix/{desc}` | `hotfix/login-crash` |

## 팀 종료

"팀 종료", "팀 해체", "team stop" 명시 시:
1. 활성 팀원이 있으면 shutdown_request
2. TeamDelete()로 팀 리소스 정리

## 프로젝트 컨텍스트

- 경로: C:/Users/user/bnimapo
- 기술스택: React 19 + Vite 7 + Tailwind CSS 4 + Zustand + Framer Motion + Supabase
- DB 테이블: profiles, products, orders, settings, chapters, dream_referrals
- 스토리지: product-images, avatars
- 배포: Vercel (bni-orcin.vercel.app)
- 테스트 계정: info_nomu@naver.com / 0123456
- 파일 형식: JSX (TypeScript 미사용)
