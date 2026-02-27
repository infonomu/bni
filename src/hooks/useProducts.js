import { create } from 'zustand';
import { supabase, executeWithRetry, isAuthError } from '../lib/supabase';
import { CATEGORIES } from '../utils/constants';

// CATEGORIES는 src/utils/constants.js에서 관리
// 하위 호환을 위해 re-export
export { CATEGORIES };

// 요청 ID 관리 (race condition 방지)
let currentFetchId = 0;

// 타임아웃 유틸리티 함수 (타이머 정리 포함)
const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,
  category: 'all',
  searchQuery: '',
  sortBy: 'created_at',
  sortOrder: 'desc',

  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearError: () => set({ error: null }),

  fetchProducts: async () => {
    const fetchId = ++currentFetchId;
    set({ loading: true, error: null });
    try {
      const { category, searchQuery, sortBy, sortOrder } = get();

      // executeWithRetry로 자동 재시도 및 세션 갱신
      // (글로벌 fetchWithRetry가 30초 타임아웃 + 2회 재시도 처리)
      const result = await executeWithRetry(async () => {
        let query = supabase
          .from('products')
          .select('*, profiles(name, company, chapter, specialty, phone)')
          .eq('is_active', true);

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        if (searchQuery) {
          query = query.or(
            `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
          );
        }

        query = query.order(sortBy, { ascending: sortOrder === 'asc' });

        return await query;
      });

      const { data, error } = result;

      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      if (error) throw error;

      set({ products: data || [], loading: false, error: null });
    } catch (error) {
      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      // AbortError는 StrictMode 이중 마운트에서 정상적으로 발생
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        set({ loading: false });
        return;
      }

      console.error('상품 조회 에러:', error?.message || error?.code || error);

      set({
        products: [],
        loading: false,
        error: isAuthError(error) ? 'session_expired' : 'fetch_error'
      });
    }
  },

  getProduct: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(name, company, chapter, specialty, email, phone)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // 조회수 증가
    await supabase.rpc('increment_view_count', { p_product_id: id });

    return data;
  },

  createProduct: async (product) => {
    try {
      const result = await withTimeout(
        executeWithRetry(async () => {
          return await supabase
            .from('products')
            .insert(product)
            .select();
        }),
        30000,
        '상품 등록 요청 시간 초과'
      );

      const { data, error } = result;

      if (error) {
        console.error('createProduct 에러:', error);
        throw error;
      }
      return { success: true, data };
    } catch (err) {
      console.error('createProduct 예외:', err);
      throw err;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const result = await withTimeout(
        executeWithRetry(async () => {
          return await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        }),
        30000,
        '상품 수정 요청 시간 초과'
      );

      const { data, error } = result;

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('updateProduct 예외:', err);
      throw err;
    }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  uploadImage: async (file, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await withTimeout(
      supabase.storage
        .from('product-images')
        .upload(fileName, file),
      90000,
      '이미지 업로드 시간 초과'
    );

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
}));
