import { defineConfig, devices } from '@playwright/test';

/**
 * BNI 마포홍보관 Playwright 설정
 *
 * 환경변수로 baseURL 오버라이드 가능:
 *   BASE_URL=http://localhost:5173 npx playwright test
 *
 * 주의사항:
 *   - networkidle 사용 금지 → domcontentloaded 사용
 *   - 새 브라우저 인스턴스로 테스트 (새 탭 금지)
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://bni-orcin.vercel.app',
    waitUntil: 'domcontentloaded',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'tests/results',
});
