# BNI 마포 DnA 설선물관 - 개발 계획

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | BNI 마포 DnA 설선물관 |
| **기술 스택** | React 19 + Vite 7 + Supabase + Tailwind CSS 4 |
| **목표** | BNI 멤버 간 설 선물 거래 플랫폼 |

---

## 2. 프로젝트 구조 (완료)

```
bnimapo/
├── public/
├── src/
│   ├── components/
│   │   ├── common/          # SearchBar
│   │   ├── layout/          # Layout, Header, Footer
│   │   ├── product/         # ProductCard, ProductForm, ProductModal, CategoryFilter
│   │   └── order/           # OrderForm
│   ├── pages/
│   │   ├── Home.jsx         # 메인 선물관
│   │   ├── Login.jsx        # 로그인
│   │   ├── Register.jsx     # 상품 등록
│   │   ├── EditProduct.jsx  # 상품 수정
│   │   ├── MyProducts.jsx   # 내 상품 관리
│   │   ├── Profile.jsx      # 프로필 설정
│   │   └── Admin.jsx        # 관리자 대시보드
│   ├── hooks/               # useAuth, useProducts, useOrders
│   ├── lib/
│   │   └── supabase.js      # Supabase 클라이언트
│   ├── utils/               # format.js
│   ├── styles/              # index.css (Tailwind)
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── migrations/          # SQL 마이그레이션
│   └── functions/           # Edge Function
├── .env.local.example
├── index.html
├── package.json
└── vite.config.js
```

---

## 3. 개발 단계 계획

### Phase 1: 인프라 설정 (Day 1-2)

#### 1.1 Supabase 프로젝트 생성
- [ ] Supabase 대시보드에서 새 프로젝트 생성
- [ ] `.env.local` 파일 생성 및 환경변수 설정
  ```
  VITE_SUPABASE_URL=https://xxx.supabase.co
  VITE_SUPABASE_ANON_KEY=xxx
  ```

#### 1.2 데이터베이스 스키마 적용
- [ ] SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
- [ ] RLS 정책 확인
- [ ] Storage 버킷 생성 (`product-images`, `avatars`)

#### 1.3 인증 설정
- [ ] Supabase Auth > Email 설정 (Magic Link 활성화)
- [ ] 카카오 OAuth 설정 (선택사항)
  - 카카오 개발자 콘솔에서 앱 생성
  - Supabase에 카카오 Client ID/Secret 등록

#### 1.4 Edge Function 배포
- [ ] Supabase CLI 설치: `npm install -g supabase`
- [ ] `supabase login` 및 프로젝트 연결
- [ ] Resend API 키 발급 및 설정
- [ ] Edge Function 배포: `supabase functions deploy send-order-email`

---

### Phase 2: 인증 기능 구현 (Day 3-4)

#### 2.1 인증 플로우 테스트
- [ ] 매직링크 로그인 테스트
- [ ] 프로필 자동 생성 확인
- [ ] 로그아웃 테스트

#### 2.2 프로필 기능
- [ ] 프로필 조회/수정 테스트
- [ ] 인증 상태 유지 확인

---

### Phase 3: 상품 CRUD (Day 5-7)

#### 3.1 상품 등록
- [ ] 이미지 업로드 테스트
- [ ] 상품 등록 폼 검증
- [ ] RLS 정책 테스트 (인증 사용자만 등록)

#### 3.2 상품 조회
- [ ] 카테고리 필터링
- [ ] 키워드 검색 (debounce)
- [ ] 정렬 기능
- [ ] 무한 스크롤 (선택사항)

#### 3.3 상품 수정/삭제
- [ ] 본인 상품만 수정 가능 확인
- [ ] 이미지 추가/삭제

---

### Phase 4: 주문 기능 (Day 8-10)

#### 4.1 주문 요청
- [ ] 주문 폼 검증
- [ ] 주문 데이터 저장

#### 4.2 이메일 발송
- [ ] Edge Function 테스트
- [ ] 이메일 템플릿 확인
- [ ] 재시도 로직 테스트

#### 4.3 주문 현황
- [ ] 판매자 주문 조회
- [ ] 이메일 발송 상태 표시

---

### Phase 5: 관리자 기능 (Day 11-12)

#### 5.1 대시보드
- [ ] 통계 조회 (상품/주문/멤버 수)
- [ ] 전체 상품 관리

#### 5.2 운영 설정
- [ ] 운영 기간 설정
- [ ] 공지사항 관리
- [ ] 상품 활성화/비활성화

---

### Phase 6: UI/UX 개선 (Day 13-15)

#### 6.1 애니메이션
- [ ] 카드 등장 애니메이션 (fadeInUp)
- [ ] 모달 애니메이션 (slideUp)
- [ ] 버튼 호버 효과
- [ ] 플로팅 장식 애니메이션

#### 6.2 반응형 최적화
- [ ] 모바일 레이아웃 테스트
- [ ] 터치 제스처 (스와이프)
- [ ] 폰트 최적화

#### 6.3 접근성
- [ ] 키보드 네비게이션
- [ ] ARIA 레이블
- [ ] 색상 대비 확인

---

### Phase 7: 테스트 및 배포 (Day 16-20)

#### 7.1 테스트
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
- [ ] 모바일 테스트 (iOS, Android)
- [ ] 성능 테스트 (Lighthouse)

#### 7.2 SEO
- [ ] 메타 태그 설정
- [ ] Open Graph 이미지
- [ ] 사이트맵 (선택사항)

#### 7.3 배포
- [ ] Vercel 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 도메인 연결 (선택사항)
- [ ] CI/CD 설정

---

## 4. 실행 명령어

```bash
# 개발 서버 시작
cd C:/Users/user/bnimapo
npm run dev

# 빌드
npm run build

# 프리뷰
npm run preview
```

---

## 5. 환경 설정 체크리스트

### Supabase 설정
- [ ] 프로젝트 URL 확인
- [ ] anon key 확인
- [ ] service role key 확인 (Edge Function용)
- [ ] Storage CORS 설정

### Resend 설정
- [ ] API Key 발급
- [ ] 발신 이메일 도메인 설정
- [ ] 테스트 이메일 발송 확인

### Vercel 설정 (배포 시)
- [ ] 환경변수 설정
- [ ] 빌드 명령어: `npm run build`
- [ ] 출력 디렉토리: `dist`

---

## 6. 주요 파일 설명

| 파일 | 설명 |
|------|------|
| `src/lib/supabase.js` | Supabase 클라이언트 초기화 |
| `src/hooks/useAuth.js` | 인증 상태 관리 (Zustand) |
| `src/hooks/useProducts.js` | 상품 CRUD 및 상태 관리 |
| `src/hooks/useOrders.js` | 주문 관련 함수 |
| `supabase/migrations/*.sql` | DB 스키마 |
| `supabase/functions/send-order-email/` | 이메일 발송 Edge Function |

---

## 7. 다음 단계

1. **Supabase 프로젝트 생성** 후 `.env.local` 파일 설정
2. **DB 스키마 적용** (SQL Editor에서 마이그레이션 실행)
3. **Storage 버킷 생성** (product-images, avatars)
4. `npm run dev`로 개발 서버 시작
5. 기능별 순차 테스트

---

> 📌 **참고**: 현재 프론트엔드 기본 구조가 완성되어 있습니다. Supabase 설정 후 바로 테스트 가능합니다.
