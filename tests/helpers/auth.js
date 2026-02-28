/**
 * 인증 관련 헬퍼 함수
 *
 * 테스트 계정: info_nomu@naver.com / 123456
 */

export const TEST_ACCOUNT = {
  email: 'info_nomu@naver.com',
  password: '123456',
};

/**
 * 테스트 계정으로 로그인
 * 로그인 성공 시 /my-products로 이동
 */
export async function login(page, email = TEST_ACCOUNT.email, password = TEST_ACCOUNT.password) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // 로그인 성공 후 /my-products로 리다이렉트 대기
  await page.waitForURL('**/my-products', { timeout: 15000 });
}

/**
 * 로그아웃
 * /my-products 또는 /에서 호출 가능
 */
export async function logout(page) {
  await page.goto('/my-products');
  await page.waitForLoadState('domcontentloaded');

  const logoutBtn = page.getByRole('button', { name: '로그아웃' });
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await page.waitForURL('**/', { timeout: 10000 });
  }
}

/**
 * 로그인 상태 확인
 * /my-products 접근 시 리다이렉트 없으면 로그인 상태
 */
export async function isLoggedIn(page) {
  await page.goto('/my-products');
  await page.waitForLoadState('domcontentloaded');
  return page.url().includes('/my-products');
}
