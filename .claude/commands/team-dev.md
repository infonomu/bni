# Team-Dev: BNI 마포 에이전트 팀즈

Claude Code의 **에이전트 팀즈(Agent Teams)** 기능을 사용하여 BNI 마포홍보관 프로젝트의 멀티 에이전트 개발팀을 구성합니다.

> 공식 문서: https://code.claude.com/docs/ko/agent-teams

## 실행 지침

이 커맨드가 호출되면, 리더(메인 세션)는 아래 절차에 따라 에이전트 팀을 구성하세요.

### Step 1: 팀 생성

TeamCreate 도구를 사용하여 팀을 생성합니다:

```
TeamCreate({
  team_name: "bnimapo-dev",
  description: "BNI 마포홍보관 기획-개발-테스트 통합 팀"
})
```

### Step 2: 팀원 스폰

아래 5명의 팀원을 Task 도구로 백그라운드 스폰합니다:

**1) 기획자 (planner)**
```
Task({
  subagent_type: "planner",
  model: "opus",
  name: "planner",
  team_name: "bnimapo-dev",
  prompt: "BNI 마포 기획자. 총괄의 요청을 받아 요구사항을 분석하고 기획서를 작성한다.\n- 프로젝트: C:/Users/user/bnimapo\n- 주요 페이지: Home, Login, Register, EditProduct, MyProducts, Profile, Admin, Guide\n- 상태관리: Zustand (useAuth, useProducts, useOrders)\n- DB: Supabase (profiles, products, orders, settings 테이블)\n- 기획서는 GitHub 이슈 본문 형태로 작성 (## 요구사항, ## 서브태스크, ## 영향 파일)\n- 파일 간 의존성을 분석하여 작업 순서를 제안",
  run_in_background: true
})
```

**2) 인프라 개발자 (dev-infra) - 선행 작업**
```
Task({
  subagent_type: "executor",
  model: "sonnet",
  name: "dev-infra",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: "인프라 개발자. DB 마이그레이션, Supabase 설정, 유틸리티 담당.\n- 담당: supabase/migrations/**, supabase/functions/**, src/utils/**\n- Supabase Edge Functions (supabase/functions/)\n- 다른 개발자보다 먼저 작업 완료 필요 (DB/유틸이 선행)\n- 완료 후 TaskUpdate로 태스크 완료 처리",
  run_in_background: true
})
```

**3) 핵심 로직 개발자 (dev-core)**
```
Task({
  subagent_type: "executor-high",
  model: "opus",
  name: "dev-core",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: "핵심 도메인 개발자. 비즈니스 로직 구현 담당.\n- 담당: src/hooks/**, src/lib/**\n- Zustand 스토어: useAuth.js, useProducts.js, useOrders.js\n- Supabase 클라이언트: src/lib/supabase.js\n- 반드시 자신의 worktree에서만 작업\n- 완료 후 TaskUpdate로 태스크 완료 처리",
  run_in_background: true
})
```

**4) UI 개발자 (dev-ui)**
```
Task({
  subagent_type: "executor",
  model: "sonnet",
  name: "dev-ui",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: "UI 개발자. 컴포넌트와 페이지 구현 담당.\n- 담당: src/components/**, src/pages/**, src/styles/**, src/assets/**\n- Tailwind CSS 4 + Tailwind Forms 패턴 준수\n- Framer Motion 애니메이션 활용\n- React Icons 사용\n- 완료 후 TaskUpdate로 태스크 완료 처리",
  run_in_background: true
})
```

**5) QA 테스터 (qa)**
```
Task({
  subagent_type: "qa-tester",
  model: "sonnet",
  name: "qa",
  team_name: "bnimapo-dev",
  prompt: "QA 테스터. E2E 테스트 작성 및 실행.\n- 테스트 위치: tests/\n- Playwright 사용\n- 테스트 계정: info_nomu@naver.com / 0123456\n- 새 브라우저 인스턴스로 실행 (새 탭 X)\n- networkidle 사용 금지 -> domcontentloaded 사용",
  run_in_background: true
})
```

### Step 3: 팀 생성 완료 안내

팀이 생성되면 사용자에게 아래 메시지를 출력합니다:

```
팀 준비 완료. 무엇을 개발할까요?

팀원: planner, dev-infra, dev-core, dev-ui, qa
확인: Shift+Down으로 팀원 순환, 직접 메시지 가능

자연어로 기능/버그/리팩토링을 요청하세요.
"팀 종료"를 말하면 팀을 해체합니다.
```

---

## 리더 행동 규칙 (절대 원칙)

### 리더는 직접 개발하지 않음

리더(메인 세션)는 어떤 상황에서도 직접 코드를 읽거나 수정하지 않습니다.

- 코드 분석/탐색: planner 또는 서브에이전트(Task)에 위임
- 코드 수정/작성: dev-infra, dev-core, dev-ui에 위임
- 테스트 실행: qa에 위임
- DB 작업(RLS, 마이그레이션): 리더가 MCP 도구로 직접 실행 (유일한 예외)
- git 작업(커밋, 푸시, PR): 리더가 직접 실행 (유일한 예외)

리더의 역할:
1. 사용자 요청 접수 및 planner에 분석 의뢰
2. planner 결과를 바탕으로 팀원에게 작업 분배
3. 작업 진행 상황 모니터링 및 조율
4. GitHub 이슈 생성/완료 처리
5. git 커밋/푸시/PR 실행
6. DB 마이그레이션/RLS 정책 실행 (MCP)
7. 결과를 사용자에게 보고

### 이슈 기반 작업 관리

모든 작업은 GitHub 이슈 단위로 관리:
1. planner 분석 결과를 기반으로 작업 단위별 이슈 생성
2. 이슈를 팀원에게 할당하여 개발
3. 작업 완료 후 커밋 해시와 함께 이슈 마감

---

## 작업 요청 처리 워크플로우

### Phase 1: 기획 (총괄 + planner)
```
사용자 요청 -> 총괄: SendMessage(planner, 분석 의뢰) -> planner: 기획서 작성 -> 총괄: 사용자에게 공유
```

### Phase 2: 이슈 생성 및 태스크 분배
```
총괄: gh issue create -> TaskCreate(서브태스크, blockedBy 의존성) -> TaskUpdate(owner 할당) + SendMessage(작업 지시)
```

### Phase 3: 병렬 개발
```
[1단계 선행] dev-infra: DB/유틸 -> TaskUpdate(completed)
[2단계 병렬] dev-core: 훅/서비스 | dev-ui: 컴포넌트/페이지 (동시 진행)
[3단계 통합] 총괄: git merge (infra -> core -> ui)
```

### Phase 4: 테스트 및 PR
```
총괄: npm run build && npm run lint -> SendMessage(qa, 테스트 요청) -> qa: 테스트 실행 -> 총괄: gh pr create
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

## 규모별 팀원 투입

| 규모 | 투입 | 예시 |
|------|------|------|
| 단순 (1~2 파일) | planner + 1명 | 버튼 변경 -> dev-ui |
| 소규모 (1 기능) | planner + 2~3명 | 검색 개선 -> dev-ui + dev-core |
| 중규모 (기능 전체) | planner + 3~4명 | 주문 개편 -> dev-infra + dev-core + dev-ui |
| 대규모 (다중 기능) | 전원 | 회원등급 -> 전원 |

## 긴급 핫픽스

사용자가 "긴급", "핫픽스", "프로덕션 오류" 키워드 사용 시:
1. 현재 작업 일시 중단 (broadcast)
2. idle 에이전트 shutdown -> 슬롯 확보
3. hotfix-dev (executor-high, opus) 투입 -> hotfix/{desc} 브랜치
4. 핫픽스 PR 생성
5. 원래 작업 복귀

## 팀 종료

"팀 종료", "팀 해체", "team stop" 명시 시에만:
1. 각 팀원에게 종료 요청
2. 모든 팀원 종료 확인
3. TeamDelete()로 팀 리소스 정리

작업 완료 후에도 팀은 자동 종료하지 않음. 대기 상태 유지.

## 프로젝트 컨텍스트

- 경로: C:/Users/user/bnimapo
- 기술스택: React 19 + Vite 7 + Tailwind CSS 4 + Zustand + Framer Motion + Supabase
- DB 테이블: profiles, products, orders, settings
- 스토리지: product-images, avatars
- 배포: Vercel
- 테스트 계정: info_nomu@naver.com / 0123456
- 파일 형식: JSX (TypeScript 미사용)
