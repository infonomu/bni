import { useEffect, useState } from 'react';
import { useProductStore } from '../hooks/useProducts';
import { CATEGORIES } from '../utils/constants';
import ProductCard from '../components/product/ProductCard';
import ProductModal from '../components/product/ProductModal';
import CategoryFilter from '../components/product/CategoryFilter';
import SearchBar from '../components/common/SearchBar';

export default function Home() {
  const { products, loading, error, fetchProducts, category, setCategory, clearError } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [category, fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12 py-10">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          마포홍보관
        </h2>
        <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8">
          BNI 마포 멤버들의 비즈니스를 만나보세요.
          <br />
          멤버 간 비즈니스 연결로 함께 성장합니다.
        </p>
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-left">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">안내</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5 shrink-0">•</span>
              <span>홍보관은 쇼핑몰이 아닙니다. 멤버들의 쇼핑몰에 바로 연결하거나 이메일로 주문서를 전송할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5 shrink-0">•</span>
              <span>비회원 주문도 가능합니다.</span>
            </li>
          </ul>
        </div>
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
