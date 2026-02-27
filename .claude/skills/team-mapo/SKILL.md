---
name: team-mapo
description: BNI 마포홍보관 온디맨드 에이전트 팀즈. 필요한 팀원만 스폰.
---

# Team-Mapo: BNI 마포홍보관 에이전트 팀즈 (온디맨드)

## Usage

```
/team-mapo
```

## Magic Keywords

- "team-mapo", "팀마포", "팀 마포", "마포팀", "마포 팀"
- "개발팀 구성", "팀 구성", "팀 세팅"

## 온디맨드 방식

전원 상시 대기가 아닌, 작업 요청 시 필요한 팀원만 스폰합니다.
- 동시 최대 2명 (`.claude.json` 충돌 방지)
- 작업 완료 후 팀원 즉시 종료

## 팀원 풀

| 이름 | 역할 | 담당 |
|------|------|------|
| planner | 기획/분석 | 코드 수정 없음 |
| dev-infra | DB/유틸리티 | supabase/**, src/utils/** |
| dev-core | 비즈니스 로직 | src/hooks/**, src/lib/** |
| dev-ui | UI/페이지 | src/components/**, src/pages/** |
| qa | E2E 테스트 | tests/** |

## 실행 시

`/team-mapo` 호출 시 `.claude/commands/team-mapo.md`의 실행 지침을 따릅니다.
