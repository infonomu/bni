import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../utils/format';

export default function Admin() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, members: 0 });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      toast.error('관리자 권한이 필요합니다');
      navigate('/');
    }
  }, [authLoading, user, profile, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Promise.all로 병렬 실행 (성능 개선)
        const [
          settingsResult,
          productCountResult,
          orderCountResult,
          memberCountResult,
          productsResult
        ] = await Promise.all([
          supabase.from('settings').select('*').single(),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*, profiles(name)').order('created_at', { ascending: false })
        ]);

        setSettings(settingsResult.data);
        setStats({
          products: productCountResult.count,
          orders: orderCountResult.count,
          members: memberCountResult.count
        });
        setProducts(productsResult.data || []);
      } catch (error) {
        console.error('데이터 조회 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update(settings)
        .eq('id', 1);

      if (error) throw error;
      toast.success('설정이 저장되었습니다');
    } catch (error) {
      toast.error('설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = async (productId, isActive) => {
    try {
      await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_active: !isActive } : p
      ));
      toast.success(isActive ? '상품이 비활성화되었습니다' : '상품이 활성화되었습니다');
    } catch (error) {
      toast.error('상태 변경에 실패했습니다');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold">관리자 대시보드</h2>
        <p className="text-brown/60 mt-1">설선물관 운영 관리</p>
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
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-white'
          }`}
        >
          운영 설정
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'products' ? 'bg-primary-600 text-white' : 'bg-white'
          }`}
        >
          상품 관리
        </button>
      </div>

      {/* 운영 설정 */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">선물관 타이틀</label>
              <input
                type="text"
                value={settings.title || ''}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">공지사항</label>
              <textarea
                value={settings.notice || ''}
                onChange={(e) => setSettings({ ...settings, notice: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">오픈 일시</label>
                <input
                  type="datetime-local"
                  value={settings.open_date?.slice(0, 16) || ''}
                  onChange={(e) => setSettings({ ...settings, open_date: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">마감 일시</label>
                <input
                  type="datetime-local"
                  value={settings.close_date?.slice(0, 16) || ''}
                  onChange={(e) => setSettings({ ...settings, close_date: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
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
              <label htmlFor="is_open" className="font-medium">선물관 오픈</label>
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
    </div>
  );
}
