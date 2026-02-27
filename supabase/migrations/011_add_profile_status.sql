-- ============================================
-- 011: profiles 테이블에 status 필드 추가
-- ============================================
-- 계정 상태 관리: active(정상) | suspended(탈퇴/정지) | withdrawn(자진탈퇴)
-- update-members Edge Function이 BNI 사이트 멤버 목록 미확인 시 suspended 처리
-- DEFAULT 'active' → 기존 handle_new_user() 트리거 변경 불필요
-- profiles.status = 'active' 조건은 products RLS에서 활용 (012 마이그레이션)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'withdrawn'));

CREATE INDEX idx_profiles_status ON public.profiles(status);
