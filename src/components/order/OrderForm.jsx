import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../utils/format';

export default function OrderForm({ product, onSuccess }) {
  const { user, profile } = useAuthStore();
  const { createOrder } = useOrders();
  const [formData, setFormData] = useState({
    buyer_name: profile?.name || '',
    buyer_email: profile?.email || '',
    buyer_phone: profile?.phone || '',
    buyer_chapter: profile?.chapter || '',
    buyer_address: '',
    quantity: 1,
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.buyer_name.trim()) {
      toast.error('주문자 성함을 입력해주세요');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.buyer_email)) {
      toast.error('올바른 이메일을 입력해주세요');
      return;
    }

    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(formData.buyer_phone.replace(/-/g, ''))) {
      toast.error('올바른 연락처를 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        product_id: product.id,
        buyer_id: user?.id || null,
        buyer_name: formData.buyer_name,
        buyer_email: formData.buyer_email,
        buyer_phone: formData.buyer_phone,
        buyer_chapter: formData.buyer_chapter,
        buyer_address: formData.buyer_address,
        quantity: formData.quantity,
        message: formData.message,
      });

      toast.success('주문이 요청되었습니다! 확인 이메일이 발송됩니다.');
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || '주문 요청에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = product.price * formData.quantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 주문자 성함 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          주문자 성함 <span className="text-primary-600">*</span>
        </label>
        <input
          type="text"
          value={formData.buyer_name}
          onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
          placeholder="주문자 이름"
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          required
        />
      </div>

      {/* 이메일 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          이메일 <span className="text-primary-600">*</span>
        </label>
        <input
          type="email"
          value={formData.buyer_email}
          onChange={(e) => setFormData({ ...formData, buyer_email: e.target.value })}
          placeholder="주문 확인 이메일 수신용"
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          required
        />
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          연락처 <span className="text-primary-600">*</span>
        </label>
        <input
          type="tel"
          value={formData.buyer_phone}
          onChange={(e) => setFormData({ ...formData, buyer_phone: e.target.value })}
          placeholder="010-0000-0000"
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          required
        />
      </div>

      {/* 챕터명 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          챕터명
        </label>
        <input
          type="text"
          value={formData.buyer_chapter}
          onChange={(e) => setFormData({ ...formData, buyer_chapter: e.target.value })}
          placeholder="예: 마포 (BNI 멤버인 경우)"
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* 수량 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          수량 <span className="text-primary-600">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
            className="w-10 h-10 rounded-lg border border-brown/20 flex items-center justify-center hover:bg-brown/5"
          >
            -
          </button>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({
              ...formData,
              quantity: Math.min(99, Math.max(1, parseInt(e.target.value) || 1))
            })}
            min={1}
            max={99}
            className="w-20 px-4 py-2.5 border border-brown/20 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
          <button
            type="button"
            onClick={() => setFormData({ ...formData, quantity: Math.min(99, formData.quantity + 1) })}
            className="w-10 h-10 rounded-lg border border-brown/20 flex items-center justify-center hover:bg-brown/5"
          >
            +
          </button>
        </div>
      </div>

      {/* 배송지 주소 */}
      <div>
        <label className="block text-sm font-medium mb-1">배송지 주소</label>
        <input
          type="text"
          value={formData.buyer_address}
          onChange={(e) => setFormData({ ...formData, buyer_address: e.target.value })}
          placeholder="실물 배송이 필요한 경우 입력"
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* 요청사항 */}
      <div>
        <label className="block text-sm font-medium mb-1">요청사항</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="판매자에게 전달할 메시지"
          maxLength={300}
          rows={2}
          className="w-full px-4 py-2.5 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white resize-none"
        />
        <p className="text-xs text-brown/50 mt-1">{formData.message.length}/300자</p>
      </div>

      {/* 총 금액 */}
      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
        <span className="font-medium">총 금액</span>
        <span className="text-xl font-bold text-primary-600">
          {formatPrice(totalPrice)}
        </span>
      </div>

      {/* 주문 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '주문 요청 중...' : '주문 요청하기'}
      </button>

      <p className="text-xs text-center text-brown/50">
        주문 요청 시 판매자와 주문자에게 이메일이 자동 발송됩니다
      </p>
    </form>
  );
}
