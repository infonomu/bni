import { create } from 'zustand';
import { supabase, executeWithRetry, isAuthError, ensureValidSession } from '../lib/supabase';

// 요청 ID 관리 (race condition 방지)
let currentFetchId = 0;

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
    console.log('[DreamReferrals] fetchDreamReferrals 시작, fetchId:', fetchId);
    const t0 = performance.now();
    try {
      const { category, searchQuery } = get();

      const result = await executeWithRetry(async () => {
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
      });

      if (fetchId !== currentFetchId) return;

      const { data, error } = result;
      if (error) throw error;

      console.log(`[DreamReferrals] 완료: ${(data||[]).length}건, ${(performance.now()-t0).toFixed(0)}ms, fetchId:${fetchId}`);
      set({ dreamReferrals: data || [], loading: false, error: null });
    } catch (error) {
      if (fetchId !== currentFetchId) return;

      console.error('[DreamReferrals] 에러:', error?.message || error?.code || error, `${(performance.now()-t0).toFixed(0)}ms`);
      set({
        dreamReferrals: [],
        loading: false,
        error: isAuthError(error) ? 'session_expired' : 'fetch_error'
      });
    }
  },

  createDreamReferral: async (data) => {
    await ensureValidSession();

    const result = await executeWithRetry(
      () => supabase.from('dream_referrals').insert(data).select()
    );
    const { error } = result;
    if (error) throw error;
    await get().fetchDreamReferrals();
  },

  updateDreamReferral: async (id, updates) => {
    await ensureValidSession();

    const result = await executeWithRetry(
      () => supabase.from('dream_referrals').update(updates).eq('id', id).select().single()
    );
    const { data, error } = result;
    if (error) throw error;
    return data;
  },

  deleteDreamReferral: async (id) => {
    await ensureValidSession();

    const { error } = await supabase
      .from('dream_referrals')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
    await get().fetchDreamReferrals();
  },
}));
