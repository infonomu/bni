import { create } from 'zustand';
import { supabase, executeWithRetry } from '../lib/supabase';

export const CATEGORIES = [
  { id: 'all', name: '전체', emoji: '🎁' },
  { id: 'food', name: '식품/음료', emoji: '🍱' },
  { id: 'living', name: '생활/뷰티', emoji: '🧴' },
  { id: 'health', name: '건강/웰빙', emoji: '💪' },
  { id: 'culture', name: '문화/체험', emoji: '🎭' },
  { id: 'biz', name: '기업서비스', emoji: '💼' },
  { id: 'etc', name: '기타', emoji: '✨' },
];

// 요청 ID 관리 (race condition 방지)
let currentFetchId = 0;

// 타임아웃 유틸리티 함수
const withTimeout = (promise, ms, message) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]);
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

      // executeWithRetry로 자동 재시도 및 세션 갱신 (15초 타임아웃)
      const result = await withTimeout(
        executeWithRetry(async () => {
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
        }),
        15000,
        '상품 조회 시간 초과'
      );

      const { data, error } = result;

      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      if (error) throw error;

      set({ products: data || [], loading: false, error: null });
    } catch (error) {
      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      // AbortError는 StrictMode에서 정상적으로 발생할 수 있음
      if (error.name === 'AbortError') {
        set({ loading: false });
        return;
      }

      console.error('상품 조회 에러:', error);

      // 세션/인증 관련 에러 확인 (재시도 후에도 실패한 경우)
      const isAuthError = error.message?.includes('JWT') ||
                          error.message?.includes('token') ||
                          error.message?.includes('session') ||
                          error.code === 'PGRST301' ||
                          error.status === 401 ||
                          error.status === 403;

      set({
        products: [],
        loading: false,
        error: isAuthError ? 'session_expired' : 'fetch_error'
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
    console.log('createProduct 호출:', product);

    try {
      const insertPromise = supabase
        .from('products')
        .insert(product)
        .select();

      console.log('Supabase insert 요청 시작...');

      // withTimeout 유틸리티 사용 (타임아웃 시에도 올바른 에러 처리)
      const result = await withTimeout(
        insertPromise,
        10000,
        'Supabase 요청 타임아웃 (10초)'
      );

      const { data, error } = result;

      console.log('createProduct 응답:', { data, error });

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
    console.log('updateProduct 호출:', { id, updates });

    try {
      const updatePromise = supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      // withTimeout 유틸리티 사용 (타임아웃 시에도 올바른 에러 처리)
      const result = await withTimeout(
        updatePromise,
        10000,
        'Supabase 요청 타임아웃 (10초)'
      );

      const { data, error } = result;

      console.log('updateProduct 응답:', { data, error });

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

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },
}));
