import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// 세션 만료 관련 에러인지 확인
const isAuthError = (error) => {
  if (!error) return false;
  const message = error.message?.toLowerCase() || '';
  return (
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('session') ||
    message.includes('refresh_token') ||
    message.includes('not authenticated') ||
    error.code === 'PGRST301' ||
    error.status === 401 ||
    error.status === 403
  );
};

// 세션 갱신 시도
const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return !!data.session;
  } catch (e) {
    console.error('세션 갱신 실패:', e);
    return false;
  }
};

// 재시도 로직이 포함된 쿼리 실행 함수
export const executeWithRetry = async (queryFn, options = {}) => {
  const { maxRetries = 2, retryDelay = 500 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await queryFn();

      // Supabase 쿼리 결과에서 에러 확인
      if (result.error) {
        // 인증 에러면 세션 갱신 시도
        if (isAuthError(result.error) && attempt < maxRetries) {
          console.log(`인증 에러 감지, 세션 갱신 시도... (${attempt + 1}/${maxRetries})`);
          const refreshed = await refreshSession();
          if (refreshed) {
            // 세션 갱신 성공, 재시도
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
        }
        // 마지막 시도이거나 인증 에러가 아니면 에러 반환
        return result;
      }

      return result;
    } catch (error) {
      // AbortError는 StrictMode에서 정상적으로 발생할 수 있음 - 무시
      if (error.name === 'AbortError') {
        return { data: null, error: null };
      }
      // 네트워크 에러 등 예외 발생 시
      if (attempt < maxRetries) {
        console.log(`요청 실패, 재시도... (${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
};

// 페이지 visibility 변경 시 세션 체크
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      // 탭이 다시 활성화되면 세션 상태 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // 세션이 있으면 갱신 시도 (만료 임박 시 자동 갱신)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        // 5분 이내 만료 예정이면 갱신
        if (expiresAt && expiresAt - now < 300) {
          console.log('세션 만료 임박, 갱신 시도...');
          await refreshSession();
        }
      }
    }
  });
}
