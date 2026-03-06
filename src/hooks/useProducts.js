import { create } from 'zustand';
import { supabase, executeWithRetry, isAuthError, ensureValidSession } from '../lib/supabase';
import { CATEGORIES } from '../utils/constants';

// CATEGORIES는 src/utils/constants.js에서 관리
// 하위 호환을 위해 re-export
export { CATEGORIES };

// 요청 ID 관리 (race condition 방지)
let currentFetchId = 0;


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
    console.log('[Products] fetchProducts 시작, fetchId:', fetchId);
    const t0 = performance.now();
    try {
      const { category, searchQuery, sortBy, sortOrder } = get();

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

      if (fetchId !== currentFetchId) return;

      const { data, error } = result;
      if (error) throw error;

      console.log(`[Products] 완료: ${(data||[]).length}건, ${(performance.now()-t0).toFixed(0)}ms, fetchId:${fetchId}`);
      set({ products: data || [], loading: false, error: null });
    } catch (error) {
      if (fetchId !== currentFetchId) return;

      console.error('[Products] 에러:', error?.message || error?.code || error, `${(performance.now()-t0).toFixed(0)}ms`);

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
    // 세션 사전 검증
    await ensureValidSession();

    try {
      const result = await executeWithRetry(async () => {
        return await supabase
          .from('products')
          .insert(product)
          .select();
      });

      const { data, error } = result;

      if (error) {
        console.error('createProduct 에러:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint);
        throw error;
      }
      return { success: true, data };
    } catch (err) {
      console.error('createProduct 예외:', err.message || JSON.stringify(err));
      throw err;
    }
  },

  updateProduct: async (id, updates) => {
    // 세션 사전 검증
    await ensureValidSession();

    try {
      const result = await executeWithRetry(async () => {
        return await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
      });

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
    // 세션 사전 검증
    await ensureValidSession();

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
