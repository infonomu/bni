-- ============================================
-- 010: chapter_members 테이블 생성
-- ============================================
-- BNI 마포 챕터별 전체 멤버 정보를 저장하는 테이블
-- update-members Edge Function이 BNI 사이트에서 파싱하여 동기화
-- miss_count: 연속 2회 미확인 시 탈퇴 처리 (is_active = false)
-- encrypted_member_id: BNI 사이트 멤버 고유 ID (UNIQUE, nullable)
-- profile_id: 홍보관 계정과의 매핑 (nullable - 미가입 멤버는 NULL)

CREATE TABLE public.chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  chapter_name TEXT NOT NULL,           -- 챕터 영문명 (비정규화, 조인 편의)
  member_name TEXT NOT NULL,            -- BNI 멤버 이름 (한글)
  member_name_en TEXT,                  -- BNI 멤버 이름 (영문)
  company TEXT,                         -- 회사명
  specialty TEXT,                       -- 업종/전문분야
  phone TEXT,                           -- 전화번호 (프론트엔드 미노출)
  encrypted_member_id TEXT,             -- BNI 사이트 멤버 고유 ID (링크용)
  profile_id UUID REFERENCES public.profiles(id), -- 홍보관 계정 매핑 (nullable)
  is_active BOOLEAN NOT NULL DEFAULT true,
  miss_count INTEGER NOT NULL DEFAULT 0, -- 연속 미확인 횟수 (2회 이상이면 탈퇴 처리)
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 인덱스
-- ============================================

-- UNIQUE 제약: encrypted_member_id 우선, 없으면 chapter_id + member_name 폴백
CREATE UNIQUE INDEX idx_chapter_members_bni_id
  ON chapter_members(encrypted_member_id)
  WHERE encrypted_member_id IS NOT NULL;

CREATE UNIQUE INDEX idx_chapter_members_fallback_unique
  ON chapter_members(chapter_id, member_name)
  WHERE encrypted_member_id IS NULL;

CREATE INDEX idx_chapter_members_chapter_id ON chapter_members(chapter_id);
CREATE INDEX idx_chapter_members_chapter_name ON chapter_members(chapter_name);
CREATE INDEX idx_chapter_members_specialty ON chapter_members(specialty);
CREATE INDEX idx_chapter_members_active ON chapter_members(is_active) WHERE is_active = true;
CREATE INDEX idx_chapter_members_profile ON chapter_members(profile_id) WHERE profile_id IS NOT NULL;

-- ============================================
-- RLS
-- ============================================

ALTER TABLE chapter_members ENABLE ROW LEVEL SECURITY;

-- SELECT: 모든 사용자 공개 읽기
CREATE POLICY "멤버 목록 공개 읽기" ON chapter_members
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: service_role 키만 가능
CREATE POLICY "서비스 키 멤버 등록" ON chapter_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "서비스 키 멤버 수정" ON chapter_members
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "서비스 키 멤버 삭제" ON chapter_members
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================
-- updated_at 자동 갱신 트리거
-- ============================================

CREATE TRIGGER chapter_members_updated_at
  BEFORE UPDATE ON public.chapter_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
