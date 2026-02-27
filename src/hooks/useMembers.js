import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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

    try {
      let query = supabase
        .from('chapter_members')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('chapter_name')
        .order('member_name');

      if (chapterFilter) query = query.eq('chapter_name', chapterFilter);
      if (specialtySearch) query = query.ilike('specialty', `%${specialtySearch}%`);
      query = query.range((page - 1) * pageSize, page * pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      set({
        members: data || [],
        totalCount: count || 0,
        loading: false,
        initialized: true,
        error: null,
      });
    } catch (error) {
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        set({ loading: false });
        return;
      }

      console.error('멤버 조회 에러:', error?.message || error);

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
