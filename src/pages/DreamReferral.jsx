import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../hooks/useAuth';
import { useDreamReferralStore } from '../hooks/useDreamReferrals';
import { CATEGORIES } from '../utils/constants';
import DreamCard from '../components/dream/DreamCard';
import DreamForm from '../components/dream/DreamForm';
import DreamDetailModal from '../components/dream/DreamDetailModal';
import CategoryFilter from '../components/product/CategoryFilter';
import SearchBar from '../components/common/SearchBar';

export default function DreamReferral() {
  const { user } = useAuthStore();
  const {
    dreamReferrals, loading, error,
    fetchDreamReferrals, category, setCategory, clearError
  } = useDreamReferralStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedDream, setSelectedDream] = useState(null);

  useEffect(() => {
    fetchDreamReferrals();
  }, [category, fetchDreamReferrals]);

  const uniqueMembers = new Set(dreamReferrals.map(d => d.user_id)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12 py-10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-2 h-2 bg-amber-300 rounded-full floating-decoration opacity-60" />
          <div className="absolute top-20 right-1/3 w-3 h-3 bg-orange-200 rounded-full floating-decoration opacity-40" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 left-1/3 w-1.5 h-1.5 bg-rose-300 rounded-full floating-decoration opacity-50" style={{ animationDelay: '2s' }} />
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-6xl mb-6"
        >
          🌟
        </motion.div>

        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          드림리퍼럴 커넥트
        </h2>
        <p className="text-slate-600 text-lg max-w-xl mx-auto mb-6">
          인생을 바꿔줄 리퍼럴, 당신은 무엇을 꿈꾸시나요?
          <br />
          나의 드림리퍼럴을 공유하고, 멤버들과 연결하세요.
        </p>

        {/* 드림리퍼럴 정의 카드 */}
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border border-amber-100 rounded-3xl p-6 shadow-sm text-left mb-8">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3">
            Dream Referral이란?
          </p>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0 text-base">✨</span>
              <span>1년 실적을 만들어주는 <strong className="text-slate-800">인생 역전급 리퍼럴</strong></span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0 text-base">🚀</span>
              <span>사업을 크게 확장시키고, 새 직원 고용이 필요할 정도의 수요를 만드는 소개</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0 text-base">🍾</span>
              <span>샴페인을 터뜨릴 만한 순간을 선사하는 비즈니스 연결</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0 text-base">🤝</span>
              <span>전문 서비스에 대한 신뢰할 수 있는 전문가를 찾는 고객과의 매칭</span>
            </li>
          </ul>
        </div>

        {/* 통계 뱃지 */}
        {dreamReferrals.length > 0 && (
          <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
            <div className="flex items-center gap-2 bg-white border border-amber-100 rounded-full px-4 py-2 shadow-sm">
              <span className="text-amber-600 font-black text-lg">{dreamReferrals.length}</span>
              <span className="text-sm text-slate-500 font-medium">드림리퍼럴</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-amber-100 rounded-full px-4 py-2 shadow-sm">
              <span className="text-amber-600 font-black text-lg">{uniqueMembers}</span>
              <span className="text-sm text-slate-500 font-medium">참여 멤버</span>
            </div>
          </div>
        )}

        {/* 등록 CTA */}
        {user ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all text-base"
          >
            <span className="text-lg">✨</span>
            나의 드림리퍼럴 등록하기
          </motion.button>
        ) : (
          <div className="inline-flex flex-col items-center gap-2">
            <p className="text-sm text-slate-500">드림리퍼럴을 등록하려면 로그인이 필요합니다</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm"
            >
              로그인하기
            </Link>
          </div>
        )}
      </section>

      {/* 필터 */}
      {dreamReferrals.length > 0 && (
        <section className="mb-8">
          <CategoryFilter
            categories={CATEGORIES}
            selected={category}
            onSelect={setCategory}
          />
        </section>
      )}

      {/* 카드 그리드 */}
      <section>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
            <p className="mt-4 text-slate-500">드림리퍼럴을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <span className="text-6xl">⚠️</span>
            <p className="mt-4 text-slate-500">드림리퍼럴을 불러오는 중 오류가 발생했습니다.</p>
            <button
              onClick={() => { clearError(); fetchDreamReferrals(); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : dreamReferrals.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">🌟</span>
            <p className="mt-4 text-slate-500">아직 등록된 드림리퍼럴이 없습니다.</p>
            <p className="text-sm text-slate-400">첫 번째 드림리퍼럴을 등록해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreamReferrals.map((dream, index) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                index={index}
                onClick={() => setSelectedDream(dream)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 등록 모달 */}
      <DreamForm show={showForm} onClose={() => setShowForm(false)} />

      {/* 상세 모달 */}
      {selectedDream && (
        <DreamDetailModal
          dream={selectedDream}
          onClose={() => setSelectedDream(null)}
        />
      )}
    </div>
  );
}
