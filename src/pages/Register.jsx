import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useProductStore } from '../hooks/useProducts';
import { CATEGORIES } from '../utils/constants';
import ProductForm from '../components/product/ProductForm';
import { compressImage } from '../utils/image';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Register() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const { createProduct, uploadImage } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  // 챕터명 없으면 상품등록 불가
  const canRegister = profile?.chapter;

  if (!authLoading && user && !canRegister) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <span className="text-5xl">⚠️</span>
        <h2 className="font-heading text-xl font-bold mt-4">챕터 정보가 필요합니다</h2>
        <p className="text-brown/60 mt-2">
          상품을 등록하려면 챕터 정보가 필요합니다.<br />
          프로필에서 챕터를 선택해주세요.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="mt-6 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          프로필 수정하기
        </button>
      </div>
    );
  }

  const handleSubmit = async (formData, images, _existingImages) => {
    if (!user) return;

    // 클라이언트 측 유효성 검사
    if (!formData.name || formData.name.length > 50) {
      toast.error('상품명은 1~50자 이내로 입력해주세요.');
      return;
    }
    if (formData.description && formData.description.length > 500) {
      toast.error('설명은 500자 이내로 입력해주세요.');
      return;
    }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      toast.error('올바른 가격을 입력해주세요.');
      return;
    }
    if (formData.price_max !== null && formData.price_max !== undefined && formData.price_max < formData.price) {
      toast.error('최대 가격은 최소 가격 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = [];

      if (images.length > 0) {
        // 1단계: 이미지 압축
        const compressedImages = [];
        for (let i = 0; i < images.length; i++) {
          try {
            compressedImages.push(await compressImage(images[i], (p) => setLoadingStep(`이미지 압축 중... (${i + 1}/${images.length}) ${p}%`)));
          } catch (err) {
            toast.error(`이미지 "${images[i].name}" 압축 실패: ${err.message}`);
            setLoading(false);
            setLoadingStep('');
            return;
          }
        }

        // 2단계: 이미지 업로드
        for (let i = 0; i < compressedImages.length; i++) {
          setLoadingStep(`이미지 업로드 중... (${i + 1}/${compressedImages.length})`);
          try {
            imageUrls.push(await uploadImage(compressedImages[i], user.id));
          } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('시간 초과')) {
              toast.error(`이미지 "${images[i].name}" 업로드 시간 초과. 파일 크기를 줄이거나 네트워크를 확인해주세요.`);
            } else if (errMsg.includes('Payload too large') || errMsg.includes('413')) {
              toast.error(`이미지 "${images[i].name}"이 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.`);
            } else {
              toast.error(`이미지 "${images[i].name}" 업로드 실패: ${errMsg}`);
            }
            setLoading(false);
            setLoadingStep('');
            return;
          }
        }
      }

      // 3단계: 상품 등록
      setLoadingStep('상품 등록 중...');
      await createProduct({
        ...formData,
        site_url: formData.site_url || null,
        seller_id: user.id,
        images: imageUrls,
      });

      toast.success('상품이 등록되었습니다!');
      navigate('/my-products');
    } catch (error) {
      console.error('상품 등록 에러:', error);
      const msg = error.message || '상품 등록에 실패했습니다.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">📦</span>
        <h2 className="font-heading text-2xl font-bold mt-4">상품 등록</h2>
        <p className="text-brown/60 mt-2">
          홍보관에 상품을 등록하세요
        </p>
        <p className="text-brown/60 text-sm max-w-md mx-auto mt-3 bg-ivory p-3 rounded-xl">
          홍보관은 멤버들간 연결을 위한 플랫폼이며, 쇼핑몰이 아닙니다.<br />
          쇼핑몰 URL 연결, 또는 이메일로 주문서를 받으실 수 있습니다.
        </p>
      </div>

      <ProductForm
        categories={CATEGORIES.filter(c => c.id !== 'all')}
        profile={profile}
        onSubmit={handleSubmit}
        loading={loading}
        loadingStep={loadingStep}
      />
    </div>
  );
}
