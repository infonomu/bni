import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
}

// 글로벌 fetch 래퍼: 타임아웃 + 자동 재시도 (cold start 대응)
// Storage 업로드는 45초(최대 2회), 그 외 요청은 30초(최대 3회) 타임아웃
const fetchWithRetry = async (url, options = {}) => {
  const isStorageUpload = url.includes('/storage/') && options?.method === 'POST';
  const MAX_RETRIES = isStorageUpload ? 1 : 2;
  const TIMEOUT_MS = isStorageUpload ? 45000 : 30000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const t0 = performance.now();
      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
      const path = url.replace(/https?:\/\/[^/]+/, '').split('?')[0];
      console.log(`[Fetch] ${options?.method || 'GET'} ${path} → ${response.status} (${(performance.now()-t0).toFixed(0)}ms, attempt:${attempt})`);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      const path = url.replace(/https?:\/\/[^/]+/, '').split('?')[0];
      console.warn(`[Fetch] ${path} 실패 (attempt:${attempt}): ${error.name} ${error.message?.substring(0,60)}`);
      // 외부에서 전달한 signal로 abort된 경우 (StrictMode 등) 재시도하지 않음
      if (options.signal?.aborted) throw error;
      // 마지막 시도면 에러 throw
      if (attempt >= MAX_RETRIES) throw error;
      // 재시도 전 대기 (백오프)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithRetry,
  },
});

// 세션 만료 관련 에러인지 확인
export const isAuthError = (error) => {
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

// 재시도 로직이 포함된 쿼리 실행 함수 (총 대기 시간 60초 캡)
export const executeWithRetry = async (queryFn, options = {}) => {
  const { maxRetries = 2, retryDelay = 500, totalTimeoutMs = 60000 } = options;
  const startTime = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 총 대기 시간 초과 시 즉시 중단
    if (Date.now() - startTime >= totalTimeoutMs) {
      return { data: null, error: { message: '요청 시간이 초과되었습니다.' } };
    }

    try {
      const result = await queryFn();

      // Supabase 쿼리 결과에서 에러 확인
      if (result.error) {
        // 인증 에러면 세션 갱신 시도
        if (isAuthError(result.error) && attempt < maxRetries) {
          // 남은 시간 확인
          if (Date.now() - startTime >= totalTimeoutMs) {
            return result;
          }
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
      // AbortError는 호출자가 처리하도록 re-throw
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        throw error;
      }
      // 네트워크 에러: fetchWithRetry가 이미 재시도하므로 여기서는 즉시 throw
      throw error;
    }
  }
};

// 세션 유효성 검증 + 필요시 갱신
export const ensureValidSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('로그인이 필요합니다.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at;

  // 만료됐거나 5분 이내 만료 예정이면 갱신 시도
  if (expiresAt && expiresAt - now < 300) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  }

  return session;
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
          const refreshed = await refreshSession();
          if (!refreshed) {
            console.warn('세션 갱신 실패: 다음 작업 시 재로그인이 필요할 수 있습니다.');
          }
        }
      }
    }
  });
}
