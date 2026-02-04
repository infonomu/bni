-- profiles 테이블에 chapter와 specialty 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS chapter TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- 인덱스 추가 (챕터별 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_chapter ON public.profiles(chapter);

-- orders 테이블에 buyer_email과 buyer_chapter 필드 추가
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS buyer_chapter TEXT;
