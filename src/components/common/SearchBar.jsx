import { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useProductStore } from '../../hooks/useProducts';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, fetchProducts } = useProductStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // 외부 searchQuery 변경 시 동기화
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  // 디바운스된 검색 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
        fetchProducts();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, setSearchQuery, fetchProducts]);

  return (
    <div className="relative mb-4">
      <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="상품명, 설명, 판매자로 검색..."
        className="w-full pl-12 pr-4 py-3 border border-brown/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      />
    </div>
  );
}
