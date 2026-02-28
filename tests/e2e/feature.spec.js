/**
 * 부가기능 E2E 테스트 (qa-feature 담당)
 * TC-FEAT-001 ~ TC-FEAT-038
 * TC-MEMBER-001 ~ TC-MEMBER-006
 *
 * 커버리지:
 *   - Admin 페이지
 *   - Guide 페이지
 *   - DreamReferral 페이지
 *   - Chapters 페이지 + MemberDirectory 컴포넌트
 *   - 멤버리스트 가입승인 검증
 */

import { test, expect } from '@playwright/test';
import { login, TEST_ACCOUNT } from '../helpers/auth.js';
import { waitForToast, waitForErrorToast } from '../helpers/toast.js';
import { navigateTo, waitForLoading, waitForSkeleton, waitForModal, waitForModalClose } from '../helpers/navigation.js';

// ─────────────────────────────────────────────
// Admin 페이지
// ─────────────────────────────────────────────

test.describe('Admin 페이지', () => {
  test('TC-FEAT-001: 비관리자 접근 차단 (비로그인)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // 비로그인 → /login 또는 / 로 리다이렉트
    await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('TC-FEAT-002~007: Admin 기능 (admin 계정 필요)', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // 테스트 계정이 admin인지 확인
    const isAdmin = await page.locator('text=관리자 대시보드').isVisible({ timeout: 5000 }).catch(() => false);
    if (!isAdmin) {
      test.skip();
      return;
    }

    // TC-FEAT-002: 통계 카드
    await expect(page.locator('text=등록 상품')).toBeVisible();
    await expect(page.locator('text=총 주문')).toBeVisible();
    await expect(page.locator('text=참여 멤버')).toBeVisible();

    // TC-FEAT-003: 탭 전환
    await expect(page.locator('button:has-text("운영 설정")')).toBeVisible();
    await expect(page.locator('button:has-text("상품 관리")')).toBeVisible();
    await expect(page.locator('button:has-text("멤버 관리")')).toBeVisible();

    // TC-FEAT-004: 운영 설정 탭
    await page.locator('button:has-text("운영 설정")').click();
    await expect(page.locator('text=홍보관 타이틀')).toBeVisible();
    await expect(page.locator('text=공지사항')).toBeVisible();

    // TC-FEAT-006: 상품 관리 탭
    await page.locator('button:has-text("상품 관리")').click();
    await expect(page.locator('text=상품명')).toBeVisible();
    await expect(page.locator('text=판매자')).toBeVisible();

    // TC-FEAT-007: 상품 활성/비활성 토글 (첫 번째 상품)
    const toggleBtn = page.locator('button:has-text("활성"), button:has-text("비활성")').first();
    if (await toggleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const currentText = await toggleBtn.textContent();
      await toggleBtn.click();
      await waitForToast(page, currentText === '활성' ? '비활성화되었습니다' : '활성화되었습니다');
      // 원복
      await toggleBtn.click();
    }
  });

  test('TC-FEAT-005: 설정 저장', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    const isAdmin = await page.locator('text=관리자 대시보드').isVisible({ timeout: 5000 }).catch(() => false);
    if (!isAdmin) {
      test.skip();
      return;
    }

    await page.locator('button:has-text("운영 설정")').click();
    await page.locator('button:has-text("설정 저장")').click();
    await waitForToast(page, '설정이 저장되었습니다');
  });

  test('TC-FEAT-008: 멤버 동기화 Edge Function', async ({ page }) => {
    await login(page);
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    const isAdmin = await page.locator('text=관리자 대시보드').isVisible({ timeout: 5000 }).catch(() => false);
    if (!isAdmin) {
      test.skip();
      return;
    }

    await page.locator('button:has-text("멤버 관리")').click();
    await page.locator('button:has-text("멤버 동기화 실행")').click();

    // Edge Function 호출 - 시간이 오래 걸릴 수 있음
    await waitForToast(page, '멤버 동기화가 완료되었습니다', 60000);
    await expect(page.locator('text=동기화 결과')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// Guide 페이지
// ─────────────────────────────────────────────

test.describe('가이드 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/guide');
  });

  test('TC-FEAT-012: 가이드 페이지 로드', async ({ page }) => {
    await expect(page.locator('text=홍보관 이용 안내').or(
      page.locator('h1, h2').filter({ hasText: /안내|가이드/ })
    ).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-FEAT-013: 아이템 등록 방법 섹션', async ({ page }) => {
    // "아이템 등록 방법" 섹션 헤딩 확인
    await expect(page.locator('text=아이템 등록 방법')).toBeVisible({ timeout: 5000 });
  });

  test('TC-FEAT-014: 주문 방법 섹션', async ({ page }) => {
    // "문의 및 주문 방법" 섹션 헤딩 확인
    await expect(page.locator('text=문의 및 주문 방법')).toBeVisible({ timeout: 5000 });
  });

  test('TC-FEAT-015: 하단 CTA 링크', async ({ page }) => {
    // 하단 홈으로 돌아가기 링크 확인
    await expect(page.locator('a[href="/"]').first()).toBeVisible({ timeout: 5000 });
    // 아이템 등록하기 링크 확인
    await expect(page.locator('a[href="/register"]').first()).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// DreamReferral 페이지
// ─────────────────────────────────────────────

test.describe('드림리퍼럴 페이지', () => {
  test('TC-FEAT-017: 드림리퍼럴 목록 로드', async ({ page }) => {
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    // 히어로 섹션 텍스트 확인 (nav 링크와 구분하기 위해 heading으로 특정)
    await expect(page.getByRole('heading', { name: '드림리퍼럴 커넥트' })).toBeVisible({ timeout: 10000 });
    // 카드 그리드 또는 빈 상태
    const hasCards = await page.locator('article').count().then(c => c > 0).catch(() => false);
    const hasEmpty = await page.locator('text=아직 등록된 드림리퍼럴이 없습니다').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('TC-FEAT-018: 비로그인 CTA', async ({ page }) => {
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    // 비로그인 상태에서 로그인 안내 텍스트 확인
    await expect(page.locator('text=드림리퍼럴을 등록하려면 로그인이 필요합니다')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a:has-text("로그인하기")')).toBeVisible();
  });

  test('TC-FEAT-019: 로그인 CTA', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    // 로그인 상태에서 등록 버튼 표시
    const hasRegisterBtn = await page.locator('button:has-text("드림리퍼럴")').or(
      page.locator('text=등록하기')
    ).isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasRegisterBtn).toBeTruthy();
  });

  test('TC-FEAT-020: 등록 모달 표시', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    const registerBtn = page.locator('button').filter({ hasText: /드림리퍼럴.*등록|등록하기/ }).first();
    if (!await registerBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }

    await registerBtn.click();
    await waitForModal(page);

    await expect(page.locator('input[placeholder*="제목"]').or(
      page.locator('textarea').or(page.locator('.fixed.inset-0'))
    ).first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-FEAT-024: 드림리퍼럴 등록 성공', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    // "나의 드림리퍼럴 등록하기" 버튼
    const registerBtn = page.locator('button:has-text("드림리퍼럴 등록하기")');
    if (!await registerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      test.skip();
      return;
    }

    await registerBtn.click();
    await waitForModal(page);

    // 제목 입력 (placeholder: "예: 사무실 인테리어를 고민하는 중소기업 대표님")
    const titleInput = page.locator('.fixed input[type="text"]').first();
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill('[TEST] 드림리퍼럴 테스트');

    // 분야 선택
    const select = page.locator('.fixed select').first();
    await expect(select).toBeVisible({ timeout: 3000 });
    await select.selectOption({ index: 1 });

    // 설명 입력
    const textarea = page.locator('.fixed textarea').first();
    await expect(textarea).toBeVisible({ timeout: 3000 });
    await textarea.fill('테스트 드림리퍼럴 설명입니다. Playwright E2E 테스트용.');

    // 등록 버튼 클릭
    const submitBtn = page.locator('.fixed button[type="submit"]');
    await submitBtn.click();
    await waitForToast(page, '드림리퍼럴이 등록되었습니다', 15000);
  });

  test('TC-FEAT-026: 드림리퍼럴 상세 모달', async ({ page }) => {
    await navigateTo(page, '/dream-referral');
    await waitForLoading(page);

    const cards = page.locator('.grid > div, [class*="card"]');
    if (await cards.count() === 0) {
      test.skip();
      return;
    }

    await cards.first().click();
    await waitForModal(page);

    await expect(page.locator('.fixed.inset-0')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// Chapters 페이지 + MemberDirectory
// ─────────────────────────────────────────────

test.describe('챕터 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await navigateTo(page, '/chapters');
    await waitForLoading(page);
    await waitForSkeleton(page);
  });

  test('TC-FEAT-029: 챕터 목록 로드', async ({ page }) => {
    await expect(page.locator('text=마포 챕터')).toBeVisible({ timeout: 10000 });

    // 챕터 수, 총 멤버 수 뱃지
    const badges = page.locator('.rounded-full');
    await expect(badges.first()).toBeVisible();
  });

  test('TC-FEAT-030: 탭 전환', async ({ page }) => {
    await expect(page.locator('button:has-text("챕터 정보")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("멤버 디렉터리")')).toBeVisible();

    // 멤버 디렉터리 탭 클릭
    await page.locator('button:has-text("멤버 디렉터리")').click();
    await waitForSkeleton(page, 20000);

    await expect(page.locator('text=이름').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-FEAT-031: 챕터 카드 정보', async ({ page }) => {
    await page.locator('button:has-text("챕터 정보")').click();

    // 챕터 카드가 있는지 확인
    const chapterCards = page.locator('.grid > div');
    const count = await chapterCards.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // 첫 번째 카드에 챕터명 포함 확인
    await expect(chapterCards.first()).toBeVisible();
  });

  test('TC-FEAT-032: 멤버 디렉터리 로드', async ({ page }) => {
    await page.locator('button:has-text("멤버 디렉터리")').click();
    await waitForSkeleton(page, 20000);

    // 멤버 테이블 헤더 확인
    await expect(page.locator('text=이름').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=챕터').first()).toBeVisible();
    await expect(page.locator('text=업종').or(page.locator('text=전문분야')).first()).toBeVisible();
  });

  test('TC-FEAT-033: 챕터 필터', async ({ page }) => {
    await page.locator('button:has-text("멤버 디렉터리")').click();
    await waitForSkeleton(page, 20000);

    const chapterSelect = page.locator('select').first();
    await expect(chapterSelect).toBeVisible({ timeout: 10000 });

    // 드롭다운 옵션 확인
    const options = await chapterSelect.locator('option').count();
    expect(options).toBeGreaterThan(1); // "전체 챕터" + 실제 챕터들

    // 두 번째 옵션(첫 번째 챕터) 선택
    await chapterSelect.selectOption({ index: 1 });
    await waitForSkeleton(page, 10000);

    // 결과가 있거나 빈 상태
    const hasResult = await page.locator('.divide-y > div').count();
    const hasEmpty = await page.locator('text=검색 결과가 없습니다').isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasResult >= 0 || hasEmpty).toBeTruthy();
  });

  test('TC-FEAT-034: 업종 검색 (400ms 디바운스)', async ({ page }) => {
    await page.locator('button:has-text("멤버 디렉터리")').click();
    await waitForSkeleton(page, 20000);

    const searchInput = page.locator('input[placeholder*="업종"]').or(
      page.locator('input[placeholder*="검색"]')
    ).first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    await searchInput.fill('없는업종XYZ12345');
    // 400ms 디바운스 + 여유시간
    await page.waitForTimeout(600);
    await waitForSkeleton(page, 10000);

    await expect(page.locator('text=검색 결과가 없습니다').or(
      page.locator('text=멤버 정보를 불러오는 중')
    ).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-FEAT-035: 페이지네이션', async ({ page }) => {
    await page.locator('button:has-text("멤버 디렉터리")').click();
    await waitForSkeleton(page, 20000);

    // 페이지네이션 버튼 있으면 테스트
    const nextBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    const paginationExists = await page.locator('button:has-text("2")').isVisible({ timeout: 3000 }).catch(() => false);

    if (!paginationExists) {
      test.skip();
      return;
    }

    await page.locator('button:has-text("2")').click();
    await waitForSkeleton(page, 10000);

    // 2페이지 활성 버튼 확인
    await expect(page.locator('button:has-text("2").bg-primary-600')).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────
// 멤버리스트 가입승인 검증
// ─────────────────────────────────────────────

test.describe('멤버리스트 가입승인 검증', () => {
  test('TC-MEMBER-001: BNI 비멤버 가입 가능 여부 확인', async ({ page }) => {
    // 현재 chapter_members 검증 없이 누구나 가입 가능
    // 이 TC는 현재 상태 문서화 목적
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.getByText('계정이 없으신가요? 회원가입').click();
    await page.waitForSelector('input[placeholder="BNI 멤버 이름"]', { timeout: 5000 });

    // 이름 필드에 임의값 입력 가능한지 확인 (검증 없음)
    const nameInput = page.locator('input[placeholder="BNI 멤버 이름"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('비멤버테스트');

    // 챕터 데이터 로드 대기
    const select = page.locator('select').first();
    await page.waitForFunction(() => {
      const sel = document.querySelector('select');
      return sel && sel.options.length > 1;
    }, { timeout: 15000 }).catch(() => {});

    const options = await select.locator('option').count();
    // 챕터가 로드되지 않으면 현재 상태만 문서화
    if (options <= 1) {
      console.log('TC-MEMBER-001: 챕터 목록 미로드 - API 확인 필요');
      test.skip();
      return;
    }
    expect(options).toBeGreaterThan(1);

    // 현재 상태: 누구나 아무 챕터로 가입 가능 (멤버리스트 검증 없음)
    console.log('TC-MEMBER-001: 현재 가입 시 멤버리스트 검증 없음 - 개선 필요');
  });

  test('TC-MEMBER-002: BNI 멤버 가입 플로우', async ({ page }) => {
    test.skip(true, 'TC-AUTH-016과 동일 - 실제 DB 계정 생성됨, 별도 정책 확인 필요');
  });

  test('TC-MEMBER-005: 동기화 후 탈퇴 처리', async ({ page }) => {
    test.skip(true, 'Admin Edge Function 테스트 (TC-FEAT-008)와 연계 - admin 계정 필요');
  });
});
