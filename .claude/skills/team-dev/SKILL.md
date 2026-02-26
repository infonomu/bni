---
name: team-dev
description: BNI 마포홍보관 공식 에이전트 팀즈 개발팀. 사용자가 각 팀원을 직접 확인/소통 가능.
---

# Team-Dev: BNI 마포 에이전트 팀즈

> 공식 문서: https://code.claude.com/docs/ko/agent-teams

Claude Code의 **에이전트 팀즈(Agent Teams)** 기능을 사용하여 BNI 마포홍보관 프로젝트의 멀티 에이전트 개발팀을 구성합니다.

## 에이전트 팀즈란?

- 여러 Claude Code **인스턴스**가 팀으로 함께 작동
- 팀 리더가 작업을 조율하고, 팀원들은 **독립적으로 작동하며 서로 직접 통신**
- 사용자는 **Shift+Down**으로 팀원을 순환하며 직접 확인/메시지 가능
- 서브에이전트와 달리 팀원들이 **사용자에게 보임** (in-process 모드)

## Usage

```
/team-dev
```

## Magic Keywords

- "team-dev", "팀개발", "팀 개발", "팀세팅", "팀 세팅"
- "개발팀 구성", "팀 구성"

---

## 실행 지침

`/team-dev` 호출 시, 리더(메인 세션)는 아래 자연어 프롬프트를 기반으로 에이전트 팀을 구성합니다.

### Step 1: 팀 생성 요청

사용자에게 아래와 같이 안내하고 팀을 생성합니다:

```
BNI 마포홍보관 프로젝트의 에이전트 팀을 구성합니다.

팀 구조:
- planner: 기획/분석 담당 (초기 요구사항 분석, 작업 분해, 이슈 생성)
- dev-infra: DB 마이그레이션, Supabase 설정, 유틸리티 (선행 작업)
- dev-core: 비즈니스 로직 (상태관리 훅, 서비스 로직)
- dev-ui: UI 컴포넌트, 페이지, 스타일링
- qa: E2E 테스트 작성/실행

각 팀원의 담당 범위:
- planner: 요구사항 분석, 작업 분해, GitHub 이슈 생성/관리, 기술 스펙 작성
- dev-infra: supabase/migrations/**, supabase/functions/**, src/utils/**
- dev-core: src/hooks/**, src/lib/**
- dev-ui: src/components/**, src/pages/**, src/styles/**, src/assets/**
- qa: tests/** (E2E 테스트)

프로젝트 정보:
- 경로: C:/Users/user/bnimapo
- 기술스택: React 19 + Vite 7 + Tailwind CSS 4 + Zustand + Framer Motion + Supabase
- 상태관리: Zustand (src/hooks/useAuth.js, useProducts.js, useOrders.js)
- 스타일링: Tailwind CSS + Tailwind Forms
- 빌드: Vite 7.2.4
- 배포: Vercel (vercel.json)
- 테스트 계정: info_nomu@naver.com / 0123456
- 파일 형식: JSX (TypeScript 미사용)
```

### Step 2: 팀 생성 확인

팀이 생성되면 사용자에게:

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

**리더(메인 세션)는 어떤 상황에서도 직접 코드를 읽거나 수정하지 않습니다.**

- 코드 분석/탐색: planner 또는 서브에이전트(Task)에 위임
- 코드 수정/작성: dev-infra, dev-core, dev-ui에 위임
- 테스트 실행: qa에 위임
- DB 작업(RLS, 마이그레이션): 리더가 MCP 도구로 직접 실행 (유일한 예외)
- git 작업(커밋, 푸시, PR): 리더가 직접 실행 (유일한 예외)

**리더의 역할은 오직:**
1. 사용자 요청 접수 및 planner에 분석 의뢰
2. planner 결과를 바탕으로 팀원에게 작업 분배
3. 작업 진행 상황 모니터링 및 조율
4. GitHub 이슈 생성/완료 처리
5. git 커밋/푸시/PR 실행
6. DB 마이그레이션/RLS 정책 실행 (MCP)
7. 결과를 사용자에게 보고

### 이슈 기반 작업 관리

모든 작업은 GitHub 이슈 단위로 관리합니다:

1. **이슈 생성**: planner 분석 결과를 기반으로 작업 단위별 이슈 생성
2. **작업 할당**: 이슈를 팀원에게 할당하여 개발
3. **이슈 완료**: 작업 완료 후 커밋 해시와 함께 이슈 마감
4. **추적성**: 모든 변경사항이 이슈에 연결됨

---

## 팀 운영 규칙

### 사용자 상호작용 (공식 에이전트 팀즈 방식)

- **in-process 모드**: Shift+Down으로 팀원 순환, 직접 메시지 전송
- 사용자는 리더뿐 아니라 **개별 팀원에게도 직접 지시** 가능

### 작업 요청 처리 (리더 역할)

사용자가 작업을 요청하면 리더가 조율:

1. **기획**: planner에게 요구사항 분석 및 작업 분해 의뢰
2. **이슈 생성**: planner 결과를 기반으로 GitHub 이슈 생성 (작업 단위별)
3. **브랜치**: 작업 유형에 맞는 브랜치 생성
4. **작업 분배**: 이슈를 팀원에게 할당
5. **개발**: 팀원들이 병렬로 작업, 서로 직접 소통
6. **통합**: build/lint 검증 (서브에이전트 활용)
7. **이슈 마감**: 완료된 작업의 이슈를 커밋 해시와 함께 마감
8. **PR**: 적절한 단위로 PR 생성
9. **대기**: 다음 요청 대기

### planner 역할 상세

planner는 작업 시작 전 초기 분석을 담당합니다:

- **요구사항 분석**: 사용자 요청을 기술적 요구사항으로 변환
- **영향 범위 파악**: 관련 파일, 컴포넌트, DB 테이블 식별
- **작업 분해**: 개발 단위로 세분화 (이슈 단위)
- **의존성 파악**: 작업 간 순서/의존관계 정의
- **기술 스펙 작성**: 각 작업의 구현 방향 제시
- **위험 요소 식별**: RLS 정책, Supabase 설정 등 주의사항

### 규모별 팀원 투입

| 규모 | 투입 | 예시 |
|------|------|------|
| 단순 (1~2 파일) | planner + 1명 | "버튼 텍스트 변경" -> planner -> dev-ui |
| 소규모 (1 기능) | planner + 2~3명 | "상품 검색 개선" -> planner -> dev-ui + dev-core |
| 중규모 (기능 전체) | planner + 3~4명 | "주문 시스템 개편" -> planner -> dev-infra + dev-core + dev-ui |
| 대규모 (다중 기능) | 전원 | "회원등급 시스템" -> planner -> 전원 |

### 브랜치 전략

| 유형 | 패턴 | 예시 |
|------|------|------|
| 신규 기능 | `feat/{name}` | `feat/member-grade` |
| 버그 수정 | `fix/{desc}` | `fix/product-upload` |
| 리팩토링 | `refactor/{scope}` | `refactor/auth-flow` |
| 긴급 | `hotfix/{desc}` | `hotfix/login-crash` |

### PR 전략

| 변경 규모 | PR 전략 |
|-----------|---------|
| ~500줄 | 단일 PR |
| 500~2000줄 | 분할 검토 |
| 2000줄+ | 반드시 분할 |

### 파일 소유권 (충돌 방지)

```
planner:   분석/기획 문서, 이슈 내용 (코드 수정 없음)
dev-core:  src/hooks/**, src/lib/**
dev-ui:    src/components/**, src/pages/**, src/styles/**, src/assets/**
dev-infra: supabase/migrations/**, supabase/functions/**, src/utils/**
리더:      package.json, App.jsx, main.jsx, index.html, vite.config.js, git/이슈 관리
```

---

## 팀 생성 코드 (리더 실행)

```javascript
// 팀 생성
TeamCreate({
  team_name: "bnimapo-dev",
  description: "BNI 마포홍보관 기획-개발-테스트 통합 팀"
})

// 기획자
Task({
  subagent_type: "planner",
  model: "opus",
  name: "planner",
  team_name: "bnimapo-dev",
  prompt: `BNI 마포 기획자. 총괄의 요청을 받아 요구사항을 분석하고 기획서를 작성한다.
  - 프로젝트: C:/Users/user/bnimapo
  - 주요 페이지: Home, Login, Register, EditProduct, MyProducts, Profile, Admin, Guide
  - 상태관리: Zustand (useAuth, useProducts, useOrders)
  - DB: Supabase (profiles, products, orders, settings 테이블)
  - 기획서는 GitHub 이슈 본문 형태로 작성 (## 요구사항, ## 서브태스크, ## 영향 파일)
  - 파일 간 의존성을 분석하여 작업 순서를 제안`,
  run_in_background: true
})

// 개발자 A - 인프라 (선행 작업)
Task({
  subagent_type: "executor",
  model: "sonnet",
  name: "dev-infra",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: `인프라 개발자. DB 마이그레이션, Supabase 설정, 유틸리티 담당.
  - 담당: supabase/migrations/**, supabase/functions/**, src/utils/**
  - Supabase Edge Functions (supabase/functions/)
  - 다른 개발자보다 먼저 작업 완료 필요 (DB/유틸이 선행)
  - 완료 후 TaskUpdate로 태스크 완료 처리`,
  run_in_background: true
})

// 개발자 B - 핵심 로직
Task({
  subagent_type: "executor-high",
  model: "opus",
  name: "dev-core",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: `핵심 도메인 개발자. 비즈니스 로직 구현 담당.
  - 담당: src/hooks/**, src/lib/**
  - Zustand 스토어: useAuth.js, useProducts.js, useOrders.js
  - Supabase 클라이언트: src/lib/supabase.js
  - 반드시 자신의 worktree에서만 작업
  - 완료 후 TaskUpdate로 태스크 완료 처리`,
  run_in_background: true
})

// 개발자 C - UI
Task({
  subagent_type: "executor",
  model: "sonnet",
  name: "dev-ui",
  team_name: "bnimapo-dev",
  isolation: "worktree",
  prompt: `UI 개발자. 컴포넌트와 페이지 구현 담당.
  - 담당: src/components/**, src/pages/**, src/styles/**, src/assets/**
  - Tailwind CSS 4 + Tailwind Forms 패턴 준수
  - Framer Motion 애니메이션 활용
  - React Icons 사용
  - 완료 후 TaskUpdate로 태스크 완료 처리`,
  run_in_background: true
})

// QA
Task({
  subagent_type: "qa-tester",
  model: "sonnet",
  name: "qa",
  team_name: "bnimapo-dev",
  prompt: `QA 테스터. E2E 테스트 작성 및 실행.
  - 테스트 위치: tests/
  - Playwright 사용
  - 테스트 계정: info_nomu@naver.com / 0123456
  - 새 브라우저 인스턴스로 실행 (새 탭 X)
  - networkidle 사용 금지 -> domcontentloaded 사용`,
  run_in_background: true
})
```

---

## 워크플로우 (기획 -> 개발 -> 테스트 -> PR)

### Phase 1: 기획 (총괄 + 기획자)

```
사용자: "회원등급 시스템 만들어줘"
  |
총괄: SendMessage(planner, "회원등급 시스템 기획 요청.
     현재 profiles 테이블과 useAuth 훅 참고.")
  |
기획자: 코드베이스 탐색 -> 기획서 작성 -> SendMessage(총괄, 기획서)
  |
총괄: 사용자에게 기획서 공유 -> 피드백 반영 -> 확정
```

### Phase 2: 이슈 생성 및 태스크 분배 (총괄)

```
총괄: gh issue create (기획서 기반)
  |
총괄: TaskCreate로 서브태스크 생성 (의존성 blockedBy 설정)
  예:
  - Task 1: "DB 스키마 + RLS 정책" (blockedBy: [])         -> dev-infra
  - Task 2: "회원등급 훅/서비스 구현" (blockedBy: [Task 1]) -> dev-core
  - Task 3: "회원등급 UI 컴포넌트" (blockedBy: [Task 1])    -> dev-ui
  - Task 4: "E2E 테스트 작성" (blockedBy: [Task 2, Task 3]) -> qa
  |
총괄: TaskUpdate로 owner 할당 + SendMessage로 작업 지시
```

### Phase 3: 병렬 개발 (개발자 3명)

```
[1단계 - 선행작업]
  dev-infra: DB 마이그레이션 + 유틸리티 -> TaskUpdate(completed)

[2단계 - 병렬작업] (dev-infra 완료 후 자동 unblock)
  dev-core: Zustand 훅/서비스 구현 (worktree에서)
  dev-ui: UI 컴포넌트/페이지 구현 (worktree에서)
  (동시 진행, 파일 소유권 분리로 충돌 없음)

[3단계 - 통합]
  총괄: 각 worktree의 변경사항을 메인 브랜치로 통합
  -> git merge 또는 cherry-pick
```

### Phase 4: 테스트 및 PR (총괄 + QA)

```
총괄: 통합 빌드 검증 (npm run build && npm run lint)
  |
총괄: SendMessage(qa, "통합 완료. 테스트 실행 요청")
  |
qa: E2E 테스트 실행 -> 결과 보고
  |
총괄: gh pr create (이슈 번호 참조, Closes #N)
  |
총괄: 사용자에게 PR URL 공유
```

---

## 브랜치/커밋 전략

### 브랜치 네이밍

```
feat/{feature-name}                    # 피처 메인 브랜치
feat/{feature-name}/infra              # dev-infra worktree 브랜치
feat/{feature-name}/core               # dev-core worktree 브랜치
feat/{feature-name}/ui                 # dev-ui worktree 브랜치
hotfix/{bug-description}               # 긴급 핫픽스
```

### 커밋 순서 (의존성 기반)

```
1순위: DB 마이그레이션 + 유틸리티                    -> dev-infra
2순위: Zustand 훅 + 서비스 로직 (hooks/, lib/)      -> dev-core
3순위: 컴포넌트 (components/) + 페이지 (pages/)      -> dev-ui
4순위: 라우팅/레이아웃 연동                           -> 총괄
5순위: E2E 테스트                                     -> qa
```

### 통합 머지 절차

```bash
# 총괄이 수행
git checkout feat/{feature-name}
git merge feat/{feature-name}/infra    # 먼저: DB/유틸
git merge feat/{feature-name}/core     # 다음: 훅/서비스
git merge feat/{feature-name}/ui       # 마지막: UI
npm run build && npm run lint          # 통합 검증
```

---

## 긴급 핫픽스 프로토콜

### 트리거

사용자가 "긴급", "핫픽스", "프로덕션 오류" 등 키워드 사용 시

### 절차

```
[Step 1] 현재 작업 일시 중단
  총괄: SendMessage(broadcast, "긴급 핫픽스 모드 진입. 현재 작업 일시 중지")
  총괄: 진행 중인 태스크 TaskUpdate(status: "pending")

[Step 2] 슬롯 확보
  총괄: TaskList로 현재 각 에이전트 상태 확인
  - idle 상태인 에이전트 -> 해당 에이전트 shutdown
  - 모두 작업 중이면 -> 우선순위 가장 낮은 에이전트 shutdown

[Step 3] 핫픽스 개발자 투입
  총괄: Task({
    subagent_type: "executor-high",
    model: "opus",
    name: "hotfix-dev",
    team_name: "bnimapo-dev",
    isolation: "worktree",
    prompt: `긴급 핫픽스: {버그 설명}
    - main 브랜치 기반 hotfix/{description} 브랜치에서 작업
    - 최소 변경으로 수정
    - 완료 후 npm run build로 검증`
  })

[Step 4] 핫픽스 PR 생성
  hotfix-dev 완료 -> 총괄: gh pr create --base main

[Step 5] 원래 작업 복귀
  총괄: 핫픽스 에이전트 종료
  총괄: 종료했던 에이전트 재스폰
  총괄: 중단된 태스크 재개 지시
```

---

## 팀 종료

사용자가 "팀 종료", "팀 해체", "team stop"을 명시적으로 말했을 때만:

1. 리더가 각 팀원에게 종료 요청
2. 모든 팀원 종료 확인
3. 팀 리소스 정리

**작업 완료 후에도 팀은 자동 종료하지 않음.** 대기 상태로 유지.

---

## 프로젝트 컨텍스트

- React 19 + Vite 7 + Tailwind CSS 4, Zustand, Framer Motion, Supabase
- 상태관리: Zustand 스토어 (src/hooks/)
- 컴포넌트: src/components/ (common, layout, product, order)
- 페이지: src/pages/ (Home, Login, Register, EditProduct, MyProducts, Profile, Admin, Guide)
- DB 테이블: profiles, products, orders, settings
- 스토리지 버킷: product-images, avatars
- 배포: Vercel (bni-orcin.vercel.app)
- 계정: info_nomu@naver.com / 0123456
- 파일 형식: JSX (TypeScript 미사용)
