/**
 * 네비게이션 헬퍼 함수
 */

/**
 * 페이지 이동 후 domcontentloaded 대기
 * @param {import('@playwright/test').Page} page
 * @param {string} path
 */
export async function navigateTo(page, path) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}

/**
 * 홈 페이지 이동 후 상품 목록 로드 대기
 */
export async function goToHome(page) {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // 로딩 스피너가 사라질 때까지 대기
  await page.waitForSelector('.animate-spin', { state: 'hidden', timeout: 15000 }).catch(() => {});
}

/**
 * 모달이 열릴 때까지 대기
 * Framer Motion AnimatePresence 사용으로 약간의 대기 필요
 */
export async function waitForModal(page) {
  await page.waitForSelector('.fixed.inset-0.z-50', { state: 'visible', timeout: 5000 });
}

/**
 * 모달이 닫힐 때까지 대기
 */
export async function waitForModalClose(page) {
  await page.waitForSelector('.fixed.inset-0.z-50', { state: 'hidden', timeout: 5000 });
}

/**
 * 로딩 스피너 사라질 때까지 대기
 */
export async function waitForLoading(page, timeout = 15000) {
  await page.waitForSelector('.animate-spin', { state: 'hidden', timeout }).catch(() => {});
}

/**
 * 스켈레톤(animate-pulse) 사라질 때까지 대기
 */
export async function waitForSkeleton(page, timeout = 15000) {
  await page.waitForSelector('.animate-pulse', { state: 'hidden', timeout }).catch(() => {});
}
