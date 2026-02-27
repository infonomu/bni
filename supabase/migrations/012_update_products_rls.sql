-- ============================================
-- 012: products RLS 정책 수정 - suspended 회원 상품 필터링
-- ============================================
-- 변경 이유: 탈퇴/정지 회원(profiles.status != 'active')의 상품을
--   products.is_active를 직접 변경하지 않고 RLS 정책으로 자동 필터링
-- 복원 시 profiles.status를 'active'로 변경하면 상품 자동 노출됨
-- 관리자는 별도 "관리자 전체 상품 읽기" 정책(005)으로 suspended 상품도 조회 가능

-- 기존 "활성 상품 공개 읽기" 정책 교체
DROP POLICY IF EXISTS "활성 상품 공개 읽기" ON public.products;

CREATE POLICY "활성 상품 공개 읽기" ON public.products
  FOR SELECT USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = products.seller_id
        AND profiles.status = 'active'
    )
  );
