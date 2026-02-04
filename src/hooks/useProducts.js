import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  category: 'all',
  searchQuery: '',
  sortBy: 'created_at',
  sortOrder: 'desc',

  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),

  fetchProducts: async () => {
    const fetchId = ++currentFetchId;
    set({ loading: true });
    try {
      let query = supabase
        .from('products')
        .select('*, profiles(name, company, chapter, specialty, phone)')
        .eq('is_active', true);

      const { category, searchQuery, sortBy, sortOrder } = get();

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      if (error) throw error;

      set({ products: data || [], loading: false });
    } catch (error) {
      // 이 요청이 가장 최신 요청인지 확인
      if (fetchId !== currentFetchId) return;

      console.error('상품 조회 에러:', error);
      set({ products: [], loading: false });
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
      // 타임아웃 설정 (10초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase 요청 타임아웃 (10초)')), 10000);
      });

      const insertPromise = supabase
        .from('products')
        .insert(product)
        .select();

      console.log('Supabase insert 요청 시작...');

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

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
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase 요청 타임아웃 (10초)')), 10000);
      });

      const updatePromise = supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      const { data, error } = await Promise.race([updatePromise, timeoutPromise]);

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
