# BNI 마포홍보관 프로젝트

## 프로젝트 개요
BNI 마포챕터 홍보관 웹앱. 회원 간 상품/서비스를 등록하고 주문하는 플랫폼.

## 기술스택
- **프레임워크**: React 19 + Vite 7
- **상태관리**: Zustand (src/hooks/useAuth.js, useProducts.js, useOrders.js)
- **스타일링**: Tailwind CSS 4 + Tailwind Forms
- **애니메이션**: Framer Motion
- **아이콘**: React Icons
- **백엔드**: Supabase (Auth, Database, Storage, Edge Functions)
- **배포**: Vercel (bni-orcin.vercel.app)
- **파일 형식**: JSX (TypeScript 미사용)

## DB 구조
- **테이블**: profiles, products, orders, settings
- **스토리지 버킷**: product-images, avatars

## 주요 페이지
Home, Login, Register, EditProduct, MyProducts, Profile, Admin, Guide

## 디렉토리 구조
```
src/
  components/   # 공통, 레이아웃, 상품, 주문 컴포넌트
  pages/        # 페이지 컴포넌트
  hooks/        # Zustand 스토어 (useAuth, useProducts, useOrders)
  lib/          # Supabase 클라이언트
  utils/        # 유틸리티 함수
  styles/       # 스타일 파일
  assets/       # 정적 자산
supabase/
  migrations/   # DB 마이그레이션
  functions/    # Edge Functions
tests/          # E2E 테스트 (Playwright)
```

## 개발 규칙
- 답변은 항상 한글로 해줘
- 자동으로 커밋하고 푸시하지 않음 (사용자가 명시적으로 요청할 때만)
- Playwright 사용 시 새 탭이 아닌 브라우저를 새로 열어서 테스트
- Playwright는 에이전트로 실행
- networkidle 사용 금지 → domcontentloaded 사용

## 테스트 계정
- 이메일: info_nomu@naver.com
- 비밀번호: 123456

## 브랜치 전략
| 유형 | 패턴 | 예시 |
|------|------|------|
| 신규 기능 | feat/{name} | feat/member-grade |
| 버그 수정 | fix/{desc} | fix/product-upload |
| 리팩토링 | refactor/{scope} | refactor/auth-flow |
| 긴급 | hotfix/{desc} | hotfix/login-crash |
