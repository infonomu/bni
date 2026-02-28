/**
 * react-hot-toast 헬퍼 함수
 *
 * react-hot-toast는 DOM에 aria-live 영역으로 렌더링됨.
 * role="status" 또는 텍스트 직접 셀렉팅으로 확인 가능.
 */

const TOAST_TIMEOUT = 8000;

/**
 * 특정 텍스트의 토스트 메시지 대기 및 확인
 * @param {import('@playwright/test').Page} page
 * @param {string} text - 토스트에 포함될 텍스트
 * @param {number} timeout - 대기 시간(ms)
 */
export async function waitForToast(page, text, timeout = TOAST_TIMEOUT) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * 에러 토스트 대기 (정확한 텍스트 일치)
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
export async function waitForErrorToast(page, text, timeout = TOAST_TIMEOUT) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * 성공 토스트 대기 후 사라질 때까지 대기 (선택적)
 * @param {import('@playwright/test').Page} page
 * @param {string} text
 */
export async function waitForSuccessToast(page, text, timeout = TOAST_TIMEOUT) {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * toast 기반 커스텀 confirm 다이얼로그의 버튼 클릭
 * MyProducts의 삭제 확인, 드림리퍼럴 삭제 확인 등에 사용
 * @param {import('@playwright/test').Page} page
 * @param {'삭제' | '취소' | string} buttonText
 */
export async function clickToastButton(page, buttonText) {
  // toast confirm은 role="status" 내부에 버튼으로 렌더링됨
  const toastContainer = page.locator('[role="status"]').last();
  await toastContainer.waitFor({ state: 'visible', timeout: 5000 });
  await toastContainer.getByRole('button', { name: buttonText }).click();
}
