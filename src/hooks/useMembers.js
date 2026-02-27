import { create } from 'zustand';
import { supabase, executeWithRetry } from '../lib/supabase';

export const useMemberStore = create((set, get) => ({
  members: [],
  loading: false,
  initialized: false,
  error: null,
  chapterFilter: '',
  specialtySearch: '',
  page: 1,
  pageSize: 30,
  totalCount: 0,

  fetchMembers: async () => {
    const { chapterFilter, specialtySearch, page, pageSize } = get();

    set({ loading: true, error: null });
    console.log('[Members] fetchMembers 시작, filter:', chapterFilter || '전체', 'search:', specialtySearch || '없음');
    const t0 = performance.now();

    try {
      // executeWithRetry로 자동 재시도 및 세션 갱신
      const { data, error, count } = await executeWithRetry(async () => {
        let query = supabase
          .from('chapter_members')
          .select('*', { count: 'exact' })
          .eq('is_active', true)
          .order('chapter_name')
          .order('member_name');

        if (chapterFilter) query = query.eq('chapter_name', chapterFilter);
        if (specialtySearch) query = query.ilike('specialty', `%${specialtySearch}%`);
        query = query.range((page - 1) * pageSize, page * pageSize - 1);

        return await query;
      });

      if (error) throw error;

      console.log(`[Members] 완료: ${(data||[]).length}건 (총 ${count}), ${(performance.now()-t0).toFixed(0)}ms`);
      set({
        members: data || [],
        totalCount: count || 0,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        console.log(`[Members] AbortError (무시)`);
        set({ loading: false });
        return;
      }

      console.error('[Members] 에러:', error?.message || error, `${(performance.now()-t0).toFixed(0)}ms`);

      set({
        members: [],
        loading: false,
        initialized: true,
        error: 'fetch_error',
      });
    }
  },

  setChapterFilter: (chapter) => {
    set({ chapterFilter: chapter, page: 1, initialized: false });
    get().fetchMembers();
  },

  setSpecialtySearch: (search) => {
    set({ specialtySearch: search, page: 1, initialized: false });
  },

  setPage: (page) => {
    set({ page, initialized: false });
    get().fetchMembers();
  },

  reset: () =>
    set({
      members: [],
      loading: false,
      initialized: false,
      error: null,
      chapterFilter: '',
      specialtySearch: '',
      page: 1,
      totalCount: 0,
    }),
}));
