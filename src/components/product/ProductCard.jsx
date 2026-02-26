import { motion } from 'framer-motion';
import { CATEGORIES } from '../../utils/constants';
import { formatPriceRange } from '../../utils/format';

const CATEGORY_GRADIENTS = {
  food: 'from-orange-100 to-amber-50',
  living: 'from-purple-100 to-pink-50',
  health: 'from-green-100 to-emerald-50',
  culture: 'from-blue-100 to-indigo-50',
  biz: 'from-gray-100 to-slate-50',
  etc: 'from-rose-100 to-red-50',
};

export default function ProductCard({ product, index, onClick }) {
  const category = CATEGORIES.find(c => c.id === product.category);
  const gradientClass = CATEGORY_GRADIENTS[product.category] || 'from-gray-100 to-slate-50';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
    >
      {/* 이미지 */}
      <div className="aspect-square bg-ivory relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center gap-2`}>
            <span className="text-4xl opacity-60">{category?.emoji || '📦'}</span>
            {product.profiles?.name && (
              <span className="text-xs text-gray-500 font-medium">{product.profiles.name}</span>
            )}
          </div>
        )}
        {/* 카테고리 뱃지 */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
          {category?.emoji} {category?.name}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-brown/60 text-sm mb-3 line-clamp-2">
          {product.description || '상품 설명이 없습니다.'}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-primary-600 font-bold text-lg">
            {formatPriceRange(product.price, product.price_max)}
          </p>
          <p className="text-sm text-brown/50">
            {product.profiles?.name} · {product.profiles?.company}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
