-- ============================================
-- BNI 마포 - chapters 자동 업데이트 스케줄
-- ============================================
--
-- Pro 플랜: pg_cron 활성화 후 아래 SQL 실행
-- Free 플랜: 외부 cron 서비스 사용 (아래 주석 참고)
--
-- ============================================
-- [Pro 플랜] pg_cron 설정
-- ============================================
-- pg_cron 확장이 활성화되어 있어야 합니다.
-- Supabase Dashboard > Database > Extensions > pg_cron 활성화 후 실행
--
-- SELECT cron.schedule(
--   'update-chapters-weekly',           -- 잡 이름 (고유해야 함)
--   '0 1 * * 1',                         -- 매주 월요일 01:00 UTC (한국 시간 10:00)
--   $$
--     SELECT net.http_post(
--       url := current_setting('app.supabase_url') || '/functions/v1/update-chapters',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || current_setting('app.update_chapters_secret')
--       ),
--       body := '{}'::jsonb
--     );
--   $$
-- );
--
-- ============================================
-- [Free 플랜] 외부 cron 서비스 설정 안내
-- ============================================
--
-- 다음 외부 서비스 중 하나를 사용하세요:
--
-- 1. GitHub Actions (무료)
--    .github/workflows/update-chapters.yml 참고
--
-- 2. cron-job.org (무료)
--    URL: https://{PROJECT_REF}.supabase.co/functions/v1/update-chapters
--    Method: POST
--    Headers:
--      Authorization: Bearer {UPDATE_CHAPTERS_SECRET}
--      Content-Type: application/json
--    Body: {}
--    Schedule: 매주 월요일 01:00 UTC
--
-- 3. Vercel Cron (프로젝트가 Vercel에 배포된 경우)
--    vercel.json의 crons 설정 사용
--
-- ============================================
-- [관리자 수동 실행] RPC 함수
-- ============================================
-- 관리자가 대시보드에서 수동으로 챕터 업데이트를 트리거할 수 있는 함수

CREATE OR REPLACE FUNCTION public.trigger_chapter_update()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- 관리자 권한 확인
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION '관리자만 챕터 업데이트를 실행할 수 있습니다';
  END IF;

  -- 마지막 업데이트 시간 기록 (settings 테이블 활용)
  UPDATE public.settings
  SET updated_at = now()
  WHERE id = 1;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Edge Function을 별도로 호출해주세요. (update-chapters)',
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
