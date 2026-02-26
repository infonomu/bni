import { create } from 'zustand';
import { supabase, executeWithRetry, isAuthError } from '../lib/supabase';

// 요청 ID 관리 (race condition 방지)
let currentFetchId = 0;

// 타임아웃 유틸리티 함수
const withTimeout = (promise, ms, message) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]);
};

export const useDreamReferralStore = create((set, get) => ({
  dreamReferrals: [],
  loading: false,
  error: null,
  category: 'all',
  searchQuery: '',

  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearError: () => set({ error: null }),

  fetchDreamReferrals: async () => {
    const fetchId = ++currentFetchId;
    set({ loading: true, error: null });
    try {
      const { category, searchQuery } = get();

      const result = await withTimeout(
        executeWithRetry(async () => {
          let query = supabase
            .from('dream_referrals')
            .select('*, profiles(name, company, chapter, specialty, phone)')
            .eq('is_active', true);

          if (category && category !== 'all') {
            query = query.eq('category', category);
          }

          if (searchQuery) {
            query = query.or(
              `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
            );
          }

          query = query.order('created_at', { ascending: false });

          return await query;
        }),
        15000,
        '드림리퍼럴 조회 시간 초과'
      );

      if (fetchId !== currentFetchId) return;

      const { data, error } = result;
      if (error) throw error;

      set({ dreamReferrals: data || [], loading: false, error: null });
    } catch (error) {
      if (fetchId !== currentFetchId) return;

      if (error.name === 'AbortError') {
        set({ loading: false });
        return;
      }

      console.error('드림리퍼럴 조회 에러:', error);
      set({
        dreamReferrals: [],
        loading: false,
        error: isAuthError(error) ? 'session_expired' : 'fetch_error'
      });
    }
  },

  createDreamReferral: async (data) => {
    const result = await withTimeout(
      supabase.from('dream_referrals').insert(data).select(),
      10000,
      '드림리퍼럴 등록 시간 초과'
    );
    const { error } = result;
    if (error) throw error;
    await get().fetchDreamReferrals();
  },

  updateDreamReferral: async (id, updates) => {
    const result = await withTimeout(
      supabase.from('dream_referrals').update(updates).eq('id', id).select().single(),
      10000,
      '드림리퍼럴 수정 시간 초과'
    );
    const { data, error } = result;
    if (error) throw error;
    return data;
  },

  deleteDreamReferral: async (id) => {
    const { error } = await supabase
      .from('dream_referrals')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
    await get().fetchDreamReferrals();
  },
}));
