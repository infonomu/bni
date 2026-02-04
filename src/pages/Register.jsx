import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useProductStore, CATEGORIES } from '../hooks/useProducts';
import ProductForm from '../components/product/ProductForm';

export default function Register() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const { createProduct, uploadImage } = useProductStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (formData, images, _existingImages) => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('상품 등록 시작', { formData, images, userId: user.id });

      // 이미지 업로드
      const imageUrls = [];
      for (const image of images) {
        console.log('이미지 업로드 중...', image.name);
        const url = await uploadImage(image, user.id);
        console.log('이미지 업로드 완료', url);
        imageUrls.push(url);
      }

      console.log('상품 생성 중...', { ...formData, seller_id: user.id, images: imageUrls });

      // 상품 생성
      const result = await createProduct({
        ...formData,
        seller_id: user.id,
        images: imageUrls,
      });

      console.log('상품 생성 완료', result);

      toast.success('상품이 등록되었습니다!');
      navigate('/my-products');
    } catch (error) {
      console.error('상품 등록 에러:', error);
      toast.error(error.message || '상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">🎁</span>
        <h2 className="font-heading text-2xl font-bold mt-4">상품 등록</h2>
        <p className="text-brown/60 mt-2">
          설 선물관에 상품을 등록하세요
        </p>
        <p className="text-brown/60 text-sm max-w-md mx-auto mt-3 bg-ivory p-3 rounded-xl">
          설 선물관은 멤버들간 연결을 위한 플랫폼이며, 쇼핑몰이 아닙니다.<br />
          쇼핑몰 URL 연결, 또는 이메일로 주문서를 받으실 수 있습니다.
        </p>
      </div>

      <ProductForm
        categories={CATEGORIES.filter(c => c.id !== 'all')}
        profile={profile}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
