import { motion } from 'framer-motion';
import { CATEGORIES, CHAPTERS } from '../../utils/constants';

const CHAPTER_GRADIENTS = {
  '나이스': 'from-violet-400 to-purple-500',
  '매트릭스': 'from-cyan-400 to-blue-500',
  '맥스': 'from-rose-400 to-red-500',
  '스톤웍스': 'from-slate-400 to-gray-500',
  '애티튜드': 'from-emerald-400 to-green-500',
  '유니콘': 'from-pink-400 to-fuchsia-500',
  '제우스': 'from-amber-400 to-yellow-500',
  '케이': 'from-indigo-400 to-blue-500',
  '타이탄': 'from-orange-400 to-amber-500',
  '탑클래스': 'from-teal-400 to-cyan-500',
  '프레즌트': 'from-lime-400 to-green-500',
};

export default function DreamCard({ dream, index, onClick }) {
  const chapter = dream.profiles?.chapter;
  const gradientClass = CHAPTER_GRADIENTS[chapter] || 'from-amber-400 to-orange-500';
  const category = CATEGORIES.find(c => c.id === dream.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 150,
        damping: 20
      }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-50 hover:border-amber-200 transition-all cursor-pointer group"
    >
      {/* 상단 그라디언트 바 */}
      <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />

      <div className="p-6">
        {/* 멤버 정보 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0`}>
            {dream.profiles?.name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">
              {dream.profiles?.name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {chapter && `${chapter} 챕터`}{dream.profiles?.specialty && ` · ${dream.profiles.specialty}`}
            </p>
          </div>
          <span className="text-amber-400 text-lg group-hover:animate-pulse shrink-0">⭐</span>
        </div>

        {/* 카테고리 뱃지 */}
        {category && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium mb-3">
            {category.emoji} {category.name}
          </span>
        )}

        {/* 드림리퍼럴 내용 */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-base text-slate-800 mb-2 line-clamp-2 leading-snug">
            &ldquo;{dream.title}&rdquo;
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {dream.description}
          </p>
        </div>

        {/* 하단 메타 */}
        <div className="flex items-center justify-between">
          {dream.amount_hint && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
              💰 {dream.amount_hint}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-auto">
            {new Date(dream.created_at).toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
