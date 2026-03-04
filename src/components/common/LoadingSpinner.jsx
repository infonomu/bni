import { useEffect, useState } from 'react';

const REFRESH_KEY = 'loading_auto_refresh';
const REFRESH_WINDOW_MS = 30000; // 30초 이내 재시도 감지

/**
 * 로딩 스피너 컴포넌트
 * - 3초 후: "잠시만 기다려주세요..." 안내 메시지
 * - 5초 후: 자동 브라우저 새로고침 (무한 루프 방지 포함)
 * - 이미 자동 새로고침한 적 있으면: 수동 "다시 시도" 버튼 표시
 */
export default function LoadingSpinner({
  message = '불러오는 중...',
  color = 'primary-600',
  messageDelayMs = 3000,
  timeoutMs = 5000,
}) {
  const [elapsed, setElapsed] = useState(0);
  const [alreadyRefreshed, setAlreadyRefreshed] = useState(false);

  useEffect(() => {
    // 이전 자동 새로고침 이력 확인 (무한 루프 방지)
    try {
      const last = sessionStorage.getItem(REFRESH_KEY);
      if (last && Date.now() - Number(last) < REFRESH_WINDOW_MS) {
        setAlreadyRefreshed(true);
      }
    } catch { /* sessionStorage 접근 불가 시 무시 */ }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (elapsed * 1000 >= timeoutMs && !alreadyRefreshed) {
      try {
        sessionStorage.setItem(REFRESH_KEY, String(Date.now()));
      } catch { /* ignore */ }
      window.location.reload();
    }
  }, [elapsed, timeoutMs, alreadyRefreshed]);

  const handleManualRefresh = () => {
    try {
      sessionStorage.removeItem(REFRESH_KEY);
    } catch { /* ignore */ }
    window.location.reload();
  };

  return (
    <div className="flex flex-col justify-center items-center py-20">
      <div className={`animate-spin rounded-full h-8 w-8 border-4 border-${color} border-t-transparent`} />
      <p className="mt-4 text-brown/60">{message}</p>

      {elapsed * 1000 >= messageDelayMs && elapsed * 1000 < timeoutMs && !alreadyRefreshed && (
        <p className="mt-2 text-sm text-slate-400 animate-pulse">
          잠시만 기다려주세요...
        </p>
      )}

      {alreadyRefreshed && elapsed >= 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400 mb-3">
            네트워크 상태를 확인해주세요.
          </p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
