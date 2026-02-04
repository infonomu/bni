-- price_max 컬럼 추가 (가격 범위 지원)
ALTER TABLE public.products
ADD COLUMN price_max INTEGER CHECK (price_max IS NULL OR price_max >= price);

COMMENT ON COLUMN public.products.price_max IS '최대 가격 (범위 가격인 경우). NULL이면 단일 가격';
