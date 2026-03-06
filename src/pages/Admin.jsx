import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { supabase, isAuthError, ensureValidSession } from '../lib/supabase';
import { formatPrice } from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = [
  { id: 'settings', label: '운영 설정' },
  { id: 'products', label: '상품 관리' },
  { id: 'members', label: '멤버 관리' },
];

export default function Admin() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, members: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  // 멤버 관리 상태
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [suspendedMembers, setSuspendedMembers] = useState([]);
  const [unmappedMembers, setUnmappedMembers] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [mappingId, setMappingId] = useState(null);
  const [mappingValues, setMappingValues] = useState({});

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      toast.error('관리자 권한이 필요합니다');
      navigate('/');
    }
  }, [authLoading, user, profile, navigate]);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        supabase.from('settings').select('*').single(),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*, profiles(name)').order('created_at', { ascending: false })
      ]);

      const [settingsResult, productCountResult, orderCountResult, memberCountResult, productsResult] =
        results.map(r => r.status === 'fulfilled' ? r.value : { data: null, error: r.reason });

      // 인증 에러 확인
      const authErr = results.find(r => r.status === 'fulfilled' && isAuthError(r.value?.error));
      if (authErr) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }

      if (settingsResult.data) setSettings(settingsResult.data);
      setStats({
        products: productCountResult?.count || 0,
        orders: orderCountResult?.count || 0,
        members: memberCountResult?.count || 0
      });
      setProducts(productsResult?.data || []);
    } catch (err) {
      console.error('데이터 조회 에러:', err);
      if (isAuthError(err)) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      setError('fetch_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile?.role, fetchData]);

  const fetchMemberData = useCallback(async () => {
    setMemberLoading(true);
    try {
      const [suspendedResult, unmappedResult, profilesResult] = await Promise.all([
        // 탈퇴 처리된 프로필 목록
        supabase
          .from('profiles')
          .select('id, name, chapter, specialty, company, email')
          .eq('status', 'suspended')
          .order('name'),
        // 미매핑 chapter_members (profile_id = null, is_active = true)
        supabase
          .from('chapter_members')
          .select('id, member_name, chapter_name, specialty, company, last_synced_at')
          .is('profile_id', null)
          .eq('is_active', true)
          .order('chapter_name')
          .order('member_name'),
        // 드롭다운용 전체 프로필 목록
        supabase
          .from('profiles')
          .select('id, name, chapter')
          .eq('status', 'active')
          .order('name'),
      ]);

      setSuspendedMembers(suspendedResult.data || []);
      setUnmappedMembers(unmappedResult.data || []);
      setProfilesList(profilesResult.data || []);
    } catch (error) {
      console.error('멤버 데이터 조회 에러:', error);
      toast.error('멤버 데이터 조회에 실패했습니다');
    } finally {
      setMemberLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'members' && profile?.role === 'admin') {
      fetchMemberData();
    }
  }, [activeTab, profile?.role, fetchMemberData]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await ensureValidSession();
      const { error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', 1);

      if (error) throw error;
      toast.success('설정이 저장되었습니다');
    } catch (error) {
      if (isAuthError(error) || error.message?.includes('세션이 만료')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error('설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = async (productId, isActive) => {
    try {
      await ensureValidSession();
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_active: !isActive } : p
      ));
      toast.success(isActive ? '상품이 비활성화되었습니다' : '상품이 활성화되었습니다');
    } catch (error) {
      if (isAuthError(error) || error.message?.includes('세션이 만료')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error('상태 변경에 실패했습니다');
    }
  };

  // 멤버 동기화 (update-members Edge Function 호출)
  const handleSync = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      await ensureValidSession();
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/update-members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '동기화 실패');
      }

      setSyncResult(result);
      toast.success('멤버 동기화가 완료되었습니다');
      // 동기화 후 멤버 데이터 갱신
      await fetchMemberData();
    } catch (error) {
      console.error('동기화 에러:', error);
      if (isAuthError(error) || error.message?.includes('세션이 만료')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error(`동기화 실패: ${error.message}`);
      setSyncResult({ error: error.message });
    } finally {
      setSyncLoading(false);
    }
  };

  // 탈퇴 멤버 복원 (status → 'active')
  const handleRestoreMember = async (profileId) => {
    setRestoringId(profileId);
    try {
      await ensureValidSession();

      // profiles.status → 'active'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', profileId);

      if (profileError) throw profileError;

      // chapter_members is_active=true, miss_count=0 (해당 profile_id로 매핑된 멤버)
      const { error: memberError } = await supabase
        .from('chapter_members')
        .update({ is_active: true, miss_count: 0 })
        .eq('profile_id', profileId);

      if (memberError) console.error('chapter_members 복원 에러:', memberError);

      setSuspendedMembers((prev) => prev.filter((m) => m.id !== profileId));
      toast.success('멤버가 복원되었습니다. 상품이 자동으로 재노출됩니다.');
    } catch (error) {
      console.error('복원 에러:', error);
      if (isAuthError(error) || error.message?.includes('세션이 만료')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error('복원에 실패했습니다');
    } finally {
      setRestoringId(null);
    }
  };

  // 미매핑 멤버에 profile_id 연결 (수동 매핑)
  const handleMapMember = async (memberId) => {
    const profileId = mappingValues[memberId];
    if (!profileId) {
      toast.error('연결할 프로필을 선택해주세요');
      return;
    }

    setMappingId(memberId);
    try {
      const { error } = await supabase
        .from('chapter_members')
        .update({ profile_id: profileId })
        .eq('id', memberId);

      if (error) throw error;

      setUnmappedMembers((prev) => prev.filter((m) => m.id !== memberId));
      setMappingValues((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
      toast.success('멤버 매핑이 완료되었습니다');
    } catch (error) {
      console.error('매핑 에러:', error);
      if (isAuthError(error) || error.message?.includes('세션이 만료')) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error('매핑에 실패했습니다');
    } finally {
      setMappingId(null);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="관리자 데이터를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <span className="text-6xl">⚠️</span>
        <p className="mt-4 text-brown/60">관리자 데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-brown/40">잠시 후 다시 시도해주세요.</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold">관리자 대시보드</h2>
        <p className="text-brown/60 mt-1">홍보관 운영 관리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.products}</p>
          <p className="text-brown/60">등록 상품</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <p className="text-3xl font-bold text-accent-600">{stats.orders}</p>
          <p className="text-brown/60">총 주문</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <p className="text-3xl font-bold text-green-600">{stats.members}</p>
          <p className="text-brown/60">참여 멤버</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 운영 설정 */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">홍보관 타이틀</label>
              <input
                type="text"
                value={settings.title || ''}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">공지사항</label>
              <textarea
                value={settings.notice || ''}
                onChange={(e) => setSettings({ ...settings, notice: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">오픈 일시</label>
                <input
                  type="datetime-local"
                  value={settings.open_date?.slice(0, 16) || ''}
                  onChange={(e) => setSettings({ ...settings, open_date: e.target.value })}
                  className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">마감 일시</label>
                <input
                  type="datetime-local"
                  value={settings.close_date?.slice(0, 16) || ''}
                  onChange={(e) => setSettings({ ...settings, close_date: e.target.value })}
                  className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_open"
                checked={settings.is_open}
                onChange={(e) => setSettings({ ...settings, is_open: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600"
              />
              <label htmlFor="is_open" className="font-medium">홍보관 오픈</label>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      )}

      {/* 상품 관리 */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-ivory">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">상품명</th>
                <th className="px-4 py-3 text-left text-sm font-medium">판매자</th>
                <th className="px-4 py-3 text-right text-sm font-medium">가격</th>
                <th className="px-4 py-3 text-center text-sm font-medium">주문</th>
                <th className="px-4 py-3 text-center text-sm font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown/10">
              {products.map(product => (
                <tr key={product.id}>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3 text-brown/60">{product.profiles?.name}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-center">{product.order_count}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleProduct(product.id, product.is_active)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 멤버 관리 */}
      {activeTab === 'members' && (
        <div className="space-y-8">
          {/* 동기화 섹션 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-1">멤버 동기화</h3>
            <p className="text-sm text-slate-500 mb-4">
              BNI 마포 사이트에서 전체 챕터 멤버 목록을 가져와 DB를 업데이트합니다.
            </p>

            <button
              onClick={handleSync}
              disabled={syncLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {syncLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  동기화 중...
                </>
              ) : (
                '멤버 동기화 실행'
              )}
            </button>

            {/* 동기화 결과 */}
            {syncResult && !syncResult.error && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm space-y-1">
                <p className="font-semibold text-slate-700">동기화 결과</p>
                {syncResult.synced_at && (
                  <p className="text-slate-500">
                    실행 시간: {new Date(syncResult.synced_at).toLocaleString('ko-KR')}
                  </p>
                )}
                {syncResult.chapters_processed !== undefined && (
                  <p className="text-slate-600">처리된 챕터: <span className="font-semibold">{syncResult.chapters_processed}개</span></p>
                )}
                {syncResult.total_members !== undefined && (
                  <p className="text-slate-600">전체 멤버: <span className="font-semibold">{syncResult.total_members}명</span></p>
                )}
                {syncResult.new_members !== undefined && (
                  <p className="text-green-700">신규 등록: <span className="font-semibold">{syncResult.new_members}명</span></p>
                )}
                {syncResult.updated_members !== undefined && (
                  <p className="text-blue-700">갱신: <span className="font-semibold">{syncResult.updated_members}명</span></p>
                )}
                {syncResult.suspended_members !== undefined && (
                  <p className="text-red-700">탈퇴 처리: <span className="font-semibold">{syncResult.suspended_members}명</span></p>
                )}
              </div>
            )}
            {syncResult?.error && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl text-sm text-red-700">
                오류: {syncResult.error}
              </div>
            )}
          </div>

          {/* 탈퇴 멤버 목록 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">탈퇴 처리된 멤버</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  복원 시 상품이 자동으로 재노출됩니다.
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {memberLoading ? '-' : `${suspendedMembers.length}명`}
              </span>
            </div>

            {memberLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : suspendedMembers.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">탈퇴 처리된 멤버가 없습니다.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {suspendedMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {member.chapter} {member.specialty && `· ${member.specialty}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreMember(member.id)}
                      disabled={restoringId === member.id}
                      className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {restoringId === member.id ? '복원 중...' : '복원'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 미매핑 멤버 수동 매핑 */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">미매핑 멤버</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  홍보관 계정과 연결되지 않은 BNI 멤버 목록입니다.
                </p>
              </div>
              <span className="text-sm font-semibold text-slate-500">
                {memberLoading ? '-' : `${unmappedMembers.length}명`}
              </span>
            </div>

            {memberLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : unmappedMembers.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">미매핑 멤버가 없습니다.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {unmappedMembers.map((member) => (
                  <div key={member.id} className="py-4 space-y-3">
                    <div>
                      <p className="font-semibold text-slate-800">{member.member_name}</p>
                      <p className="text-xs text-slate-500">
                        {member.chapter_name} {member.specialty && `· ${member.specialty}`}
                        {member.company && ` · ${member.company}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={mappingValues[member.id] || ''}
                        onChange={(e) =>
                          setMappingValues((prev) => ({ ...prev, [member.id]: e.target.value }))
                        }
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                      >
                        <option value="">프로필 선택...</option>
                        {profilesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.chapter})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleMapMember(member.id)}
                        disabled={mappingId === member.id || !mappingValues[member.id]}
                        className="shrink-0 px-3 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {mappingId === member.id ? '연결 중...' : '연결'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
