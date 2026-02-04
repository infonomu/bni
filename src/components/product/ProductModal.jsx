import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineShare, HiOutlineGlobeAlt } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/format';
import OrderForm from '../order/OrderForm';

export default function ProductModal({ product, onClose }) {
  const [currentImage, setCurrentImage] = useState(0);
  const category = CATEGORIES.find(c => c.id === product.category);
  const images = product.images?.length > 0 ? product.images : [];

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('링크가 복사되었습니다!');
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

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
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-brown/10 px-6 py-4 flex items-center justify-between z-10">
            <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium">
              {category?.emoji} {category?.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-brown/5 rounded-lg transition-colors"
              >
                <HiOutlineShare className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-brown/5 rounded-lg transition-colors"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 이미지 캐러셀 */}
          <div className="relative aspect-video bg-ivory">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
                    >
                      <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white"
                    >
                      <HiOutlineChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentImage ? 'bg-primary-600' : 'bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl opacity-30">{category?.emoji || '🎁'}</span>
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="p-6">
            <h2 className="font-heading text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-primary-600 text-2xl font-bold mb-2">
              {formatPrice(product.price)}
            </p>

            {/* 사이트 URL */}
            {product.site_url && (
              <a
                href={product.site_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline mb-4"
              >
                <HiOutlineGlobeAlt className="w-4 h-4" />
                상품 사이트 바로가기
              </a>
            )}

            {/* 판매자 정보 */}
            <div className="p-4 bg-ivory rounded-xl mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                  {product.profiles?.name?.[0] || '👤'}
                </div>
                <div>
                  <p className="font-medium">{product.profiles?.name}</p>
                  {product.profiles?.chapter && (
                    <p className="text-sm text-primary-600">BNI {product.profiles.chapter} 챕터</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.profiles?.specialty && (
                  <div>
                    <span className="text-brown/50">전문분야</span>
                    <p className="font-medium">{product.profiles.specialty}</p>
                  </div>
                )}
                {product.profiles?.company && (
                  <div>
                    <span className="text-brown/50">회사명</span>
                    <p className="font-medium">{product.profiles.company}</p>
                  </div>
                )}
                {product.profiles?.phone && (
                  <div className="col-span-2">
                    <span className="text-brown/50">연락처</span>
                    <p className="font-medium">
                      <a href={`tel:${product.profiles.phone}`} className="text-primary-600 hover:underline">
                        {product.profiles.phone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 상품 설명 */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">상품 설명</h3>
                <p className="text-brown/70 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* 주문 섹션 */}
            <div className="border-t border-brown/10 pt-6">
              {product.accept_email_order !== false ? (
                <>
                  <h3 className="font-heading text-lg font-bold mb-4">이메일 주문 요청</h3>
                  <OrderForm product={product} onSuccess={onClose} />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-brown/60 mb-4">
                    이 상품은 판매자 사이트에서 직접 주문하실 수 있습니다.
                  </p>
                  {product.site_url ? (
                    <a
                      href={product.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                      <HiOutlineGlobeAlt className="w-5 h-5" />
                      판매자 사이트로 이동
                    </a>
                  ) : (
                    <p className="text-brown/50 text-sm">
                      판매자에게 직접 연락해주세요.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
