/**
 * Playwright 공통 픽스처
 *
 * 사용 예시:
 *   import { test, expect } from '../fixtures/index.js';
 *
 *   test('로그인 필요 테스트', async ({ authenticatedPage }) => {
 *     // authenticatedPage는 이미 로그인된 상태
 *   });
 */

import { test as base } from '@playwright/test';
import { login } from '../helpers/auth.js';

/**
 * 공통 픽스처 확장
 */
export const test = base.extend({
  /**
   * 로그인된 상태의 page 픽스처
   * 각 테스트 전 자동 로그인 수행
   */
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
    // 사후 정리: 테스트 후 상태는 각 테스트에서 직접 관리
  },
});

export { expect } from '@playwright/test';

/**
 * 테스트용 이미지 파일 경로
 */
export const TEST_IMAGE_PATH = new URL('./test-image.png', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

/**
 * 테스트에서 생성한 상품 정리용 헬퍼
 * 테스트 상품은 이름에 '[TEST]' prefix 사용
 */
export const TEST_PRODUCT_PREFIX = '[TEST]';
