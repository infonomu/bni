-- ============================================
-- 006: 드림리퍼럴 커넥트
-- ============================================

CREATE TABLE public.dream_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 60),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 500),
  category TEXT NOT NULL CHECK (
    category IN ('food','health','professional','edu','culture','digital','etc')
  ),
  amount_hint TEXT CHECK (char_length(amount_hint) <= 50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_dream_referrals_created_at ON public.dream_referrals(created_at DESC);
CREATE INDEX idx_dream_referrals_user_id ON public.dream_referrals(user_id);
CREATE INDEX idx_dream_referrals_category ON public.dream_referrals(category) WHERE is_active = true;

-- RLS
ALTER TABLE public.dream_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "활성 드림리퍼럴 공개 읽기" ON public.dream_referrals
  FOR SELECT USING (is_active = true);

CREATE POLICY "관리자 전체 드림리퍼럴 읽기" ON public.dream_referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "인증 사용자 드림리퍼럴 등록" ON public.dream_referrals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "본인 드림리퍼럴 수정" ON public.dream_referrals
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "본인 드림리퍼럴 삭제" ON public.dream_referrals
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- updated_at 트리거 (기존 함수 재사용)
CREATE TRIGGER dream_referrals_updated_at
  BEFORE UPDATE ON public.dream_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
