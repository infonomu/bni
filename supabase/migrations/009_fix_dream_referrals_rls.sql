-- ============================================
-- 009: dream_referrals UPDATE RLS 정책 수정
-- ============================================
-- 문제: 006_dream_referrals.sql의 "본인 드림리퍼럴 수정" 정책에
--       WITH CHECK 조건이 없어서 is_active: false 업데이트 시 403 에러 발생
--       (업데이트 결과 행이 USING 조건을 여전히 만족해야 하므로 실패)
-- 해결: 기존 정책 삭제 후 WITH CHECK 조건을 포함한 정책 재생성

-- 기존 UPDATE 정책 삭제
DROP POLICY IF EXISTS "본인 드림리퍼럴 수정" ON public.dream_referrals;

-- WITH CHECK 조건 포함한 새 UPDATE 정책
CREATE POLICY "본인 드림리퍼럴 수정" ON public.dream_referrals
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
