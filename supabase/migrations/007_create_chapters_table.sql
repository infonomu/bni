-- ============================================
-- BNI 마포 - chapters 테이블
-- ============================================

CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                          -- 영문 챕터명: 'Nice', 'Max', 'Present' 등
  name_ko TEXT NOT NULL,                       -- 한글 챕터명: '나이스', '맥스', '프레즌트' 등
  meeting_day TEXT NOT NULL,                   -- 미팅 요일: '화요일'
  meeting_time TEXT NOT NULL,                  -- 미팅 시간: '7:00 AM'
  meeting_location TEXT NOT NULL,              -- 미팅 장소: '서울가든호텔'
  member_count INTEGER NOT NULL DEFAULT 0,     -- 멤버 수
  meeting_type TEXT NOT NULL DEFAULT 'IN_PERSON', -- 미팅 타입: 'IN_PERSON', 'PERM_HYBRID', 'PERM_ONLINE'
  bni_url TEXT,                                -- BNI 챕터 상세 URL
  org_id TEXT,                                 -- BNI 조직 ID (스크래핑용)
  encoded_chapter_id TEXT,                     -- BNI 인코딩된 챕터 ID (스크래핑용)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- SELECT: 모든 사용자 공개 읽기
CREATE POLICY "챕터 공개 읽기" ON public.chapters
  FOR SELECT USING (true);

-- INSERT/UPDATE/DELETE: service_role 키만 가능
CREATE POLICY "서비스 키 챕터 등록" ON public.chapters
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "서비스 키 챕터 수정" ON public.chapters
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "서비스 키 챕터 삭제" ON public.chapters
  FOR DELETE USING (auth.role() = 'service_role');

-- updated_at 자동 갱신 트리거 (기존 함수 재사용)
CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 초기 데이터 11개 챕터 INSERT (CHAPTER_DATA 기반)
-- ============================================

INSERT INTO public.chapters
  (name, name_ko, meeting_day, meeting_time, meeting_location, member_count, meeting_type, bni_url, org_id, encoded_chapter_id)
VALUES
  (
    'Nice', '나이스', '화요일', '7:00 AM', '서울가든호텔', 22, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=IOjXUxcMPfRvrPdFwNDc5w%3D%3D',
    '23401', 'IOjXUxcMPfRvrPdFwNDc5w=='
  ),
  (
    'Max', '맥스', '목요일', '7:00 AM', '라이즈호텔', 64, 'IN_PERSON',
    'http://bnimapo.com/ko/chapterdetail?chapterId=553QnInYlNYtPSVZVnd5Ag%3D%3D',
    '23400', '553QnInYlNYtPSVZVnd5Ag=='
  ),
  (
    'Present', '프레즌트', '수요일', '7:00 AM', '어반크리에이터스유닛 신촌점', 32, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=Rzm%2BnwvWZ5t5FdJOuia9Yw%3D%3D',
    '26699', 'Rzm+nwvWZ5t5FdJOuia9Yw=='
  ),
  (
    'Attitude', '애티튜드', '금요일', '7:00 AM', '라이즈호텔', 25, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=u6QrkYWFPh1qPE2bltWslw%3D%3D',
    '29534', 'u6QrkYWFPh1qPE2bltWslw=='
  ),
  (
    'Matrix', '매트릭스', '수요일', '7:00 AM', 'BNI 마포사무실', 34, 'PERM_ONLINE',
    'http://bnimapo.com/ko/chapterdetail?chapterId=q6wfNR6uQ7lMZlHnkvsGrg%3D%3D',
    '34083', 'q6wfNR6uQ7lMZlHnkvsGrg=='
  ),
  (
    'Unicorn', '유니콘', '화요일', '7:00 AM', '라이즈호텔', 46, 'IN_PERSON',
    'http://bnimapo.com/ko/chapterdetail?chapterId=6%2FDN%2FflvfPt5H%2B7KJGTquw%3D%3D',
    '34297', '6/DN/flvfPt5H+7KJGTquw=='
  ),
  (
    'Topclass', '탑클래스', '목요일', '7:00 AM', 'BNI 마포사무실', 21, 'PERM_ONLINE',
    'http://bnimapo.com/ko/chapterdetail?chapterId=qTOaVbnJQ0zPNT1yLaxLrA%3D%3D',
    '34608', 'qTOaVbnJQ0zPNT1yLaxLrA=='
  ),
  (
    'Zeus', '제우스', '수요일', '6:30 AM', 'BNI Mapo Online', 24, 'PERM_ONLINE',
    'http://bnimapo.com/ko/chapterdetail?chapterId=AeIqYmE5On3TzqrBLGsRKA%3D%3D',
    '40578', 'AeIqYmE5On3TzqrBLGsRKA=='
  ),
  (
    'K', '케이', '수요일', '6:30 AM', '라이즈호텔', 30, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=NSKAjYGXFYQoNRyohxerFQ%3D%3D',
    '42184', 'NSKAjYGXFYQoNRyohxerFQ=='
  ),
  (
    'TITAN', '타이탄', '화요일', '6:30 AM', '서울가든호텔', 12, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=On9%2F56iiFJ1fn63Gm5zeuw%3D%3D',
    '43861', 'On9/56iiFJ1fn63Gm5zeuw=='
  ),
  (
    'Stoneworks', '스톤웍스', '수요일', '6:30 AM', '라이즈호텔', 20, 'PERM_HYBRID',
    'http://bnimapo.com/ko/chapterdetail?chapterId=gyhZil0X5Y3El%2FGmsSsFvg%3D%3D',
    '44603', 'gyhZil0X5Y3El/GmsSsFvg=='
  );
