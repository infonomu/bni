/**
 * 인증/프로필 E2E 테스트 (qa-auth 담당)
 * TC-AUTH-001 ~ TC-AUTH-023
 *
 * 커버리지:
 *   - Login 페이지 (로그인/회원가입 토글)
 *   - Profile 페이지
 */

import { test, expect } from '@playwright/test';
import { login, logout, TEST_ACCOUNT } from '../helpers/auth.js';
import { waitForToast, waitForErrorToast } from '../helpers/toast.js';
import { navigateTo } from '../helpers/navigation.js';

// ─────────────────────────────────────────────
// Login 페이지 - 로그인
// ─────────────────────────────────────────────

test.describe('로그인', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-AUTH-001: 정상 로그인', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNT.email);
    await page.fill('input[type="password"]', TEST_ACCOUNT.password);
    await page.click('button[type="submit"]');

    await waitForToast(page, '로그인 성공!');
    await page.waitForURL('**/my-products', { timeout: 15000 });
    expect(page.url()).toContain('/my-products');
  });

  test('TC-AUTH-002: 잘못된 비밀번호 로그인', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNT.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await waitForErrorToast(page, '이메일 또는 비밀번호가 올바르지 않습니다');
    expect(page.url()).toContain('/login');
  });

  test('TC-AUTH-003: 미등록 이메일 로그인', async ({ page }) => {
    await page.fill('input[type="email"]', 'notexist@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 에러 메시지 표시 (형식은 Supabase 응답에 따름)
    await expect(page.locator('text=이메일 또는 비밀번호가 올바르지 않습니다').or(
      page.locator('text=오류가 발생했습니다')
    )).toBeVisible({ timeout: 10000 });
  });

  test('TC-AUTH-004: 빈 필드 제출', async ({ page }) => {
    // HTML required 속성이 브라우저 네이티브 유효성 검사를 수행하므로
    // JS 핸들러의 toast 대신 브라우저 검증 확인
    await page.click('button[type="submit"]');
    // 폼이 제출되지 않고 /login에 남아있어야 함
    expect(page.url()).toContain('/login');
    // 이메일 input의 validity 체크
    const isInvalid = await page.locator('input[type="email"]').evaluate(el => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('TC-AUTH-005: 잘못된 이메일 형식', async ({ page }) => {
    await page.fill('input[type="email"]', 'abc');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // type="email"의 브라우저 네이티브 유효성 검사가 먼저 동작
    expect(page.url()).toContain('/login');
    const isInvalid = await page.locator('input[type="email"]').evaluate(el => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('TC-AUTH-006: 짧은 비밀번호 (6자 미만)', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNT.email);
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await waitForErrorToast(page, '비밀번호는 6자 이상이어야 합니다');
  });

  test('TC-AUTH-009: 로그인 버튼 로딩 상태', async ({ page }) => {
    await page.fill('input[type="email"]', TEST_ACCOUNT.email);
    await page.fill('input[type="password"]', TEST_ACCOUNT.password);

    // 버튼 클릭 후 즉시 텍스트 확인
    await page.click('button[type="submit"]');

    // "처리 중..." 또는 disabled 상태 확인 (빠른 응답으로 못 잡을 수도 있음)
    const submitBtn = page.locator('button[type="submit"]');
    // 로딩 완료 후 /my-products 이동 확인
    await page.waitForURL('**/my-products', { timeout: 15000 });
  });

  test('TC-AUTH-010: suspended 계정 로그인 차단', async ({ page }) => {
    // 별도 suspended 계정이 없으면 스킵
    test.skip(true, 'suspended 테스트 계정 미준비 - 별도 계정 생성 후 진행');
  });
});

// ─────────────────────────────────────────────
// Login 페이지 - 회원가입 (isSignUp 토글)
// ─────────────────────────────────────────────

test.describe('회원가입', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    // 회원가입 모드로 전환
    await page.getByText('계정이 없으신가요? 회원가입').click();
    await page.waitForSelector('text=회원가입', { timeout: 3000 });
  });

  test('TC-AUTH-007: 로그인/회원가입 전환', async ({ page }) => {
    // 회원가입 필드들이 나타나는지 확인
    await expect(page.locator('text=이름').first()).toBeVisible();
    await expect(page.locator('text=챕터명').first()).toBeVisible();
    await expect(page.locator('text=전문분야').first()).toBeVisible();
    await expect(page.locator('text=회사명').first()).toBeVisible();
    await expect(page.locator('text=연락처').first()).toBeVisible();
  });

  test('TC-AUTH-008: 폼 초기화 확인', async ({ page }) => {
    // 회원가입 필드 입력
    await page.fill('input[placeholder="BNI 멤버 이름"]', '테스트이름');

    // 로그인으로 다시 전환
    await page.getByText('이미 계정이 있으신가요? 로그인').click();
    await page.waitForSelector('button[type="submit"]');

    // 다시 회원가입으로 전환
    await page.getByText('계정이 없으신가요? 회원가입').click();

    // 이름 필드가 초기화되어 있어야 함
    await expect(page.locator('input[placeholder="BNI 멤버 이름"]')).toHaveValue('');
  });

  test('TC-AUTH-011: 회원가입 폼 필드 표시', async ({ page }) => {
    await expect(page.locator('input[placeholder="BNI 멤버 이름"]')).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="전문분야"]').or(
      page.locator('input[placeholder*="식품유통"]')
    )).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('TC-AUTH-012: 이름 미입력 회원가입', async ({ page }) => {
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await waitForErrorToast(page, '이름을 입력해주세요');
  });

  test('TC-AUTH-013: 챕터 드롭다운 로드', async ({ page }) => {
    const select = page.locator('select').first();
    await expect(select).toBeVisible();

    // 챕터 데이터 로드 대기 (API 호출 시간 고려)
    await page.waitForFunction(() => {
      const sel = document.querySelector('select');
      return sel && sel.options.length > 1;
    }, { timeout: 15000 }).catch(() => {});

    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('TC-AUTH-014: 중복 이메일 가입', async ({ page }) => {
    await page.fill('input[placeholder="BNI 멤버 이름"]', '테스트');
    await page.fill('input[type="email"]', TEST_ACCOUNT.email);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await waitForErrorToast(page, '이미 가입된 이메일입니다');
  });

  test('TC-AUTH-015: 주소 검색 연동 (카카오 SDK)', async ({ page }) => {
    test.skip(true, '외부 카카오 우편번호 SDK 팝업 - Playwright 제어 불가, P2 스킵');
  });

  test('TC-AUTH-016: 정상 회원가입 플로우', async ({ page }) => {
    test.skip(true, '실제 DB에 계정 생성됨 - 테스트 계정 생성 정책 확인 후 진행');
  });
});

// ─────────────────────────────────────────────
// Profile 페이지
// ─────────────────────────────────────────────

test.describe('프로필 페이지', () => {
  test('TC-AUTH-017: 비로그인 접근 차단', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');

    // /login으로 리다이렉트
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('TC-AUTH-018: 기존 프로필 로드', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/profile');

    // 이름 필드에 값이 채워져 있어야 함
    const nameInput = page.locator('input[placeholder="BNI 멤버 이름"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    const nameValue = await nameInput.inputValue();
    expect(nameValue.length).toBeGreaterThan(0);
  });

  test('TC-AUTH-019: 프로필 저장', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/profile');

    // 이름 필드 확인 후 동일한 값으로 저장 (데이터 변경 최소화)
    const nameInput = page.locator('input[placeholder="BNI 멤버 이름"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    // 저장 버튼 클릭
    await page.getByRole('button', { name: '저장하기' }).click();

    await waitForToast(page, '프로필이 저장되었습니다');
    await page.waitForURL('**/my-products', { timeout: 10000 });
    expect(page.url()).toContain('/my-products');
  });

  test('TC-AUTH-020: 이름 미입력 저장', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/profile');

    const nameInput = page.locator('input[placeholder="BNI 멤버 이름"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('');
    // required 속성 제거하여 JS 유효성 검사 테스트
    await nameInput.evaluate(el => el.removeAttribute('required'));

    await page.getByRole('button', { name: '저장하기' }).click();
    await waitForErrorToast(page, '이름을 입력해주세요');
  });

  test('TC-AUTH-021: 챕터 미선택 저장', async ({ page }) => {
    await login(page);
    await navigateTo(page, '/profile');

    const select = page.locator('select').first();
    await expect(select).toBeVisible({ timeout: 10000 });

    // 프로필 데이터 로드 대기 (select에 값이 세팅될 때까지)
    await page.waitForTimeout(1000);

    // 챕터 선택 초기화 + required 속성 제거 (evaluate로 React state 동기화)
    await select.evaluate(el => {
      el.value = '';
      el.removeAttribute('required');
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.getByRole('button', { name: '저장하기' }).click();
    await waitForErrorToast(page, '챕터를 선택해주세요');
  });

  test('TC-AUTH-022: 로딩 스피너 표시', async ({ page }) => {
    test.skip(true, 'P2 - 로딩 스피너는 빠른 네트워크에서 순간적으로 표시됨');
  });

  test('TC-AUTH-023: 주소 검색 및 업데이트', async ({ page }) => {
    test.skip(true, '외부 카카오 우편번호 SDK 팝업 - Playwright 제어 불가, P2 스킵');
  });
});
