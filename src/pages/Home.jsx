import { useEffect, useState } from 'react';
import { useProductStore, CATEGORIES } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import ProductModal from '../components/product/ProductModal';
import CategoryFilter from '../components/product/CategoryFilter';
import SearchBar from '../components/common/SearchBar';

export default function Home() {
  const { products, loading, error, fetchProducts, category, setCategory, clearError } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <div className="flex justify-center gap-4 mb-4">
          <span className="text-4xl floating-decoration" style={{ animationDelay: '0s' }}>🏮</span>
          <span className="text-4xl floating-decoration" style={{ animationDelay: '0.5s' }}>🧧</span>
          <span className="text-4xl floating-decoration" style={{ animationDelay: '1s' }}>✨</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-600 mb-4">
          2026 설선물관
        </h2>
        <p className="text-brown/70 max-w-2xl mx-auto">
          BNI 마포 멤버들의 특별한 설 선물을 만나보세요.
          <br />
          멤버 간 비즈니스 연결로 함께 성장합니다.
        </p>
        <p className="text-brown/60 text-sm max-w-2xl mx-auto mt-4 bg-ivory p-4 rounded-xl">
          설선물관은 쇼핑몰이 아닙니다.<br />
          멤버들의 쇼핑몰에 바로 연결 주문하시거나,<br />
          이메일로 주문서를 전송하실 수 있습니다.<br />
          비회원 주문도 가능합니다.
        </p>
      </section>

      {/* 검색 및 필터 */}
      <section className="mb-8">
        <SearchBar />
        <CategoryFilter
          categories={CATEGORIES}
          selected={category}
          onSelect={setCategory}
        />
      </section>

      {/* 상품 그리드 */}
      <section>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-brown/60">상품을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="text-6xl">⚠️</span>
            {error === 'session_expired' ? (
              <>
                <p className="mt-4 text-brown/60">세션이 만료되었습니다.</p>
                <p className="text-sm text-brown/40">페이지를 새로고침하거나 다시 로그인해주세요.</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-brown/60">상품을 불러오는 중 오류가 발생했습니다.</p>
                <p className="text-sm text-brown/40">잠시 후 다시 시도해주세요.</p>
              </>
            )}
            <button
              onClick={() => {
                clearError();
                fetchProducts();
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">📭</span>
            <p className="mt-4 text-brown/60">등록된 상품이 없습니다.</p>
            <p className="text-sm text-brown/40">첫 번째 상품을 등록해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 상품 상세 모달 */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
