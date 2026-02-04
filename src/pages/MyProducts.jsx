import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlusCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useProductStore } from '../hooks/useProducts';
import { useOrders } from '../hooks/useOrders';
import { formatPrice } from '../utils/format';

export default function MyProducts() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuthStore();
  const { deleteProduct } = useProductStore();
  const { getSellerOrders } = useOrders();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 내 상품 조회
        const { supabase } = await import('../lib/supabase');
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        setProducts(productsData || []);

        // 내 상품에 대한 주문 조회
        const ordersData = await getSellerOrders(user.id);
        setOrders(ordersData || []);
      } catch (error) {
        console.error('데이터 조회 에러:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (productId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('상품이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 프로필 헤더 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl">
              {profile?.name?.[0] || '👤'}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">{profile?.name || '멤버'}</h2>
              <p className="text-brown/60">{profile?.company || ''}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/profile"
              className="px-4 py-2 text-sm border border-brown/20 rounded-lg hover:bg-brown/5"
            >
              프로필 수정
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-brown/70 hover:bg-brown/5'
          }`}
        >
          내 상품 ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'orders'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-brown/70 hover:bg-brown/5'
          }`}
        >
          받은 주문 ({orders.length})
        </button>
      </div>

      {/* 내 상품 목록 */}
      {activeTab === 'products' && (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <span className="text-5xl">📦</span>
              <p className="mt-4 text-brown/60">등록한 상품이 없습니다</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <HiOutlinePlusCircle className="w-5 h-5" />
                상품 등록하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="w-20 h-20 bg-ivory rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🎁
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <p className="text-primary-600 font-bold">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-sm text-brown/50">
                      주문 {product.order_count}건 · 조회 {product.view_count}회
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/edit/${product.id}`}
                      className="p-2 text-brown/60 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-brown/60 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 받은 주문 목록 */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <span className="text-5xl">📋</span>
              <p className="mt-4 text-brown/60">받은 주문이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{order.products?.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.email_status === 'sent'
                        ? 'bg-green-100 text-green-700'
                        : order.email_status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.email_status === 'sent' ? '발송완료' : order.email_status === 'failed' ? '발송실패' : '대기중'}
                    </span>
                  </div>
                  <p className="text-sm text-brown/70">
                    주문자: {order.buyer_name} ({order.buyer_phone})
                  </p>
                  <p className="text-sm text-brown/70">
                    수량: {order.quantity}개 · 총액: {formatPrice(order.products?.price * order.quantity)}
                  </p>
                  {order.buyer_address && (
                    <p className="text-sm text-brown/70">배송지: {order.buyer_address}</p>
                  )}
                  {order.message && (
                    <p className="text-sm text-brown/50 mt-2">요청: {order.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
