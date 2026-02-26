import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../hooks/useAuth';
import { useDreamReferralStore } from '../../hooks/useDreamReferrals';
import { CATEGORIES } from '../../utils/constants';

const DREAM_LIMIT = 3;

export default function DreamForm({ show, onClose }) {
  const { user, profile } = useAuthStore();
  const { createDreamReferral } = useDreamReferralStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount_hint: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim()) {
      toast.error('제목을 입력하세요');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('상세 설명을 입력하세요');
      return;
    }
    if (!formData.category) {
      toast.error('분야를 선택하세요');
      return;
    }

    setLoading(true);
    try {
      await createDreamReferral({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        amount_hint: formData.amount_hint.trim() || null,
      });
      toast.success('드림리퍼럴이 등록되었습니다!');
      setFormData({ title: '', description: '', category: '', amount_hint: '' });
      onClose();
    } catch (error) {
      console.error('드림리퍼럴 등록 에러:', error);
      toast.error('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-amber-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="font-bold text-lg text-slate-800">나의 드림리퍼럴</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* 안내 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 text-sm text-slate-600">
                <p className="font-medium text-amber-700 mb-1">
                  어떤 고객을 만나면 샴페인을 터뜨리고 싶으신가요? 🍾
                </p>
                <p className="text-xs text-slate-500">
                  구체적일수록 멤버들이 매칭해드리기 쉬워요!
                </p>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  어떤 리퍼럴을 받고 싶나요? <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 사무실 인테리어를 고민하는 중소기업 대표님"
                  maxLength={60}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white placeholder:text-slate-300"
                  required
                />
                <p className="text-xs text-slate-400 mt-1.5">{formData.title.length}/60자</p>
              </div>

              {/* 분야 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  어떤 분야인가요? <span className="text-amber-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white text-slate-700"
                  required
                >
                  <option value="">분야를 선택하세요</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 상세 설명 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  조금 더 자세히 알려주세요 <span className="text-amber-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="예: 30평 이상 사무실 인테리어를 계획 중인 기업. 특히 IT 스타트업이나 디자인 에이전시처럼 창의적인 공간을 원하는 곳이면 좋겠습니다."
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white resize-none placeholder:text-slate-300 leading-relaxed"
                  required
                />
                <p className="text-xs text-slate-400 mt-1.5">{formData.description.length}/500자</p>
              </div>

              {/* 예상 규모 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  예상 거래 규모 <span className="text-slate-400 text-xs font-normal">(선택)</span>
                </label>
                <input
                  type="text"
                  value={formData.amount_hint}
                  onChange={(e) => setFormData({ ...formData, amount_hint: e.target.value })}
                  placeholder="예: 건당 3,000만원 이상"
                  maxLength={50}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white placeholder:text-slate-300"
                />
              </div>

              {/* 작성자 정보 */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-2">작성자 정보 (프로필에서 자동 연동)</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {profile?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-700">{profile?.name || '이름 미설정'}</p>
                    <p className="text-xs text-slate-400">
                      {profile?.chapter && `${profile.chapter} 챕터`}{profile?.specialty && ` · ${profile.specialty}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* 제출 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '등록 중...' : '✨ 드림리퍼럴 등록하기'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
