import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark } from 'react-icons/hi2';
import { CATEGORIES } from '../../utils/constants';

export default function DreamDetailModal({ dream, onClose }) {
  if (!dream) return null;

  const category = CATEGORIES.find(c => c.id === dream.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-amber-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-3xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <span className="text-sm font-medium text-amber-600">드림리퍼럴</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* 카테고리 */}
            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4">
                {category.emoji} {category.name}
              </span>
            )}

            {/* 제목 */}
            <h2 className="text-2xl font-bold text-slate-800 mb-4 leading-snug">
              &ldquo;{dream.title}&rdquo;
            </h2>

            {/* 상세 설명 */}
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-2xl p-5 mb-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {dream.description}
              </p>
            </div>

            {/* 예상 규모 */}
            {dream.amount_hint && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-amber-500">💰</span>
                <span className="text-sm font-semibold text-slate-700">예상 거래 규모:</span>
                <span className="text-sm text-slate-600">{dream.amount_hint}</span>
              </div>
            )}

            {/* 작성자 정보 */}
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold">
                  {dream.profiles?.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{dream.profiles?.name}</p>
                  {dream.profiles?.chapter && (
                    <p className="text-sm text-amber-600">BNI {dream.profiles.chapter} 챕터</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {dream.profiles?.specialty && (
                  <div>
                    <span className="text-slate-400">전문분야</span>
                    <p className="font-medium text-slate-700">{dream.profiles.specialty}</p>
                  </div>
                )}
                {dream.profiles?.company && (
                  <div>
                    <span className="text-slate-400">회사명</span>
                    <p className="font-medium text-slate-700">{dream.profiles.company}</p>
                  </div>
                )}
                {dream.profiles?.phone && (
                  <div className="col-span-2">
                    <span className="text-slate-400">연락처</span>
                    <p className="font-medium">
                      <a href={`tel:${dream.profiles.phone}`} className="text-amber-600 hover:underline">
                        {dream.profiles.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 등록일 */}
            <p className="text-xs text-slate-400 mt-4 text-right">
              {new Date(dream.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 등록
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
