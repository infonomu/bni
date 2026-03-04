import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useProductStore } from '../hooks/useProducts';
import { CATEGORIES } from '../utils/constants';
import ProductForm from '../components/product/ProductForm';
import { compressImage } from '../utils/image';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const { getProduct, updateProduct, uploadImage } = useProductStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        if (data.seller_id !== user?.id && profile?.role !== 'admin') {
          toast.error('수정 권한이 없습니다');
          navigate('/');
          return;
        }
        setProduct(data);
      } catch (error) {
        toast.error('상품을 찾을 수 없습니다');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProduct();
    }
  }, [id, user, authLoading]);

  const handleSubmit = async (formData, newImages, existingImages) => {
    setSaving(true);
    try {
      let newImageUrls = [];
      if (newImages.length > 0) {
        // 1단계: 이미지 압축
        const compressedImages = [];
        for (let i = 0; i < newImages.length; i++) {
          try {
            compressedImages.push(await compressImage(newImages[i], (p) => setLoadingStep(`이미지 압축 중... (${i + 1}/${newImages.length}) ${p}%`)));
          } catch (err) {
            toast.error(`이미지 "${newImages[i].name}" 압축 실패: ${err.message}`);
            setSaving(false);
            setLoadingStep('');
            return;
          }
        }

        // 2단계: 이미지 업로드
        for (let i = 0; i < compressedImages.length; i++) {
          setLoadingStep(`이미지 업로드 중... (${i + 1}/${compressedImages.length})`);
          try {
            newImageUrls.push(await uploadImage(compressedImages[i], user.id));
          } catch (err) {
            const errMsg = err.message || '';
            if (errMsg.includes('시간 초과')) {
              toast.error(`이미지 "${newImages[i].name}" 업로드 시간 초과. 파일 크기를 줄이거나 네트워크를 확인해주세요.`);
            } else {
              toast.error(`이미지 "${newImages[i].name}" 업로드 실패: ${errMsg}`);
            }
            setSaving(false);
            setLoadingStep('');
            return;
          }
        }
      }

      // 3단계: 상품 수정
      setLoadingStep('상품 수정 중...');
      const allImages = [...(existingImages || []), ...newImageUrls];

      await updateProduct(id, {
        ...formData,
        images: allImages,
      });

      toast.success('상품이 수정되었습니다!');
      navigate('/my-products');
    } catch (error) {
      toast.error(error.message || '상품 수정에 실패했습니다.');
    } finally {
      setSaving(false);
      setLoadingStep('');
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner message="상품 정보를 불러오는 중..." />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">✏️</span>
        <h2 className="font-heading text-2xl font-bold mt-4">상품 수정</h2>
        <p className="text-brown/60 text-sm max-w-md mx-auto mt-3 bg-ivory p-3 rounded-xl">
          홍보관은 멤버들간 연결을 위한 플랫폼이며, 쇼핑몰이 아닙니다.<br />
          쇼핑몰 URL 연결, 또는 이메일로 주문서를 받으실 수 있습니다.
        </p>
      </div>

      <ProductForm
        categories={CATEGORIES.filter(c => c.id !== 'all')}
        profile={profile}
        initialData={product}
        onSubmit={handleSubmit}
        loading={saving}
        loadingStep={loadingStep}
        isEdit
      />
    </div>
  );
}
