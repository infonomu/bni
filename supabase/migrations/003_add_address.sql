-- profiles 테이블에 주소 관련 컬럼 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS address_detail TEXT;

-- 컬럼 설명 추가
COMMENT ON COLUMN public.profiles.postal_code IS '우편번호';
COMMENT ON COLUMN public.profiles.address IS '기본주소';
COMMENT ON COLUMN public.profiles.address_detail IS '상세주소';
