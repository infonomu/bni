import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth 초기화 에러:', error);
    } finally {
      set({ loading: false });
    }

    // 인증 상태 변경 리스너
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile(session.user.id);
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('프로필 조회 에러:', error);
    }
  },

  // 회원가입 (이메일/비밀번호)
  signUp: async (email, password, profileData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: profileData.name,
          chapter: profileData.chapter,
          specialty: profileData.specialty,
          company: profileData.company,
          phone: profileData.phone,
        },
      },
    });
    if (error) throw error;

    // profiles 테이블에 추가 정보 저장
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          name: profileData.name,
          email: email,
          chapter: profileData.chapter,
          specialty: profileData.specialty,
          company: profileData.company,
          phone: profileData.phone,
          postal_code: profileData.postal_code,
          address: profileData.address,
          address_detail: profileData.address_detail,
        });
      if (profileError) console.error('프로필 저장 에러:', profileError);
    }

    return data;
  },

  // 로그인 (이메일/비밀번호)
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('로그인이 필요합니다');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    set({ profile: data });
    return data;
  },
}));
