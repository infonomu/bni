-- ============================================
-- 005: BNI 마포홍보관 리브랜딩 마이그레이션
-- ============================================

-- 1. settings 테이블: 기존 데이터 업데이트 + DEFAULT 변경
UPDATE public.settings SET title = '마포홍보관' WHERE id = 1;
ALTER TABLE public.settings ALTER COLUMN title SET DEFAULT '마포홍보관';

-- 2. products 카테고리 변경
-- 중요: 반드시 기존 데이터 UPDATE를 먼저 실행한 뒤 CHECK 제약 변경!
UPDATE public.products SET category = 'professional' WHERE category = 'biz';
UPDATE public.products SET category = 'health' WHERE category = 'living';

-- 기존 CHECK 제약조건 삭제 후 새로 추가
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check
  CHECK (category IN ('food','health','professional','edu','culture','digital','etc'));

-- 3. RLS 정책 보완: 관리자 권한 추가
CREATE POLICY "관리자 전체 상품 읽기" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "관리자 주문 수정" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "관리자 주문 삭제" ON public.orders
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
