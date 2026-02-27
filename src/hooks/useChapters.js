import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CHAPTER_DATA } from '../utils/constants';

// CHAPTER_DATA 폴백: DB 조회 실패 시 사용
// chapters 테이블 스키마에 맞게 변환
const CHAPTER_DATA_FALLBACK = CHAPTER_DATA.map((c) => ({
  id: c.id,          // 폴백에서는 slug를 id로 사용
  name: c.nameEn,
  name_ko: c.name,
  meeting_day: c.meeting.split(' ')[0],
  meeting_time: c.meeting.split(' ').slice(1).join(' '),
  meeting_location: c.location,
  member_count: c.members,
  meeting_type: c.type === 'In-Person'
    ? 'IN_PERSON'
    : c.type === 'Hybrid'
    ? 'PERM_HYBRID'
    : 'PERM_ONLINE',
  bni_url: c.bniUrl,
  org_id: null,
  encoded_chapter_id: null,
  is_active: true,
}));

// 드롭다운용 한글 챕터명 배열 (폴백)
const CHAPTER_NAMES_FALLBACK = CHAPTER_DATA.map((c) => c.name).sort();

export const useChapterStore = create((set, get) => ({
  chapters: [],
  chapterNames: [],   // 드롭다운용 한글명 배열: ['나이스', '맥스', ...]
  loading: false,
  error: null,
  initialized: false,

  fetchChapters: async () => {
    // 이미 로드된 경우 재조회 생략
    if (get().initialized) return;

    set({ loading: true, error: null });
    console.log('[Chapters] fetchChapters 시작');
    const t0 = performance.now();

    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log(`[Chapters] 완료: ${data.length}개, ${(performance.now()-t0).toFixed(0)}ms`);
        const chapterNames = data.map((c) => c.name_ko).sort();
        set({ chapters: data, chapterNames, loading: false, error: null, initialized: true });
      } else {
        // DB에 데이터 없으면 폴백 사용
        console.warn('chapters 테이블 데이터 없음, CHAPTER_DATA 폴백 사용');
        set({
          chapters: CHAPTER_DATA_FALLBACK,
          chapterNames: CHAPTER_NAMES_FALLBACK,
          loading: false,
          error: null,
          initialized: true,
        });
      }
    } catch (error) {
      // AbortError는 StrictMode에서 정상 발생
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        set({ loading: false });
        return;
      }

      console.error('chapters 조회 에러:', error?.message || error);

      // DB 오류 시 CHAPTER_DATA 폴백으로 정상 동작 유지
      set({
        chapters: CHAPTER_DATA_FALLBACK,
        chapterNames: CHAPTER_NAMES_FALLBACK,
        loading: false,
        error: null,
        initialized: true,
      });
    }
  },

  reset: () => set({ chapters: [], chapterNames: [], loading: false, error: null, initialized: false }),
}));
