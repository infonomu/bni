import { useState, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef(null);

  // 컴포넌트 언마운트 시 진행 중인 작업 취소
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setSaving(false);
    setLoadingStep('');
    toast('수정이 취소되었습니다.', { icon: '⚠️' });
  };

  const handleSubmit = async (formData, newImages, existingImages) => {
    // AbortController 생성
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 90초 글로벌 타임아웃
    const globalTimeout = setTimeout(() => {
      controller.abort();
    }, 90000);

    setSaving(true);
    try {
      let newImageUrls = [];
      if (newImages.length > 0) {
        // 1단계: 이미지 압축
        const compressedImages = [];
        for (let i = 0; i < newImages.length; i++) {
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          setLoadingStep(`이미지 압축 중... (${i + 1}/${newImages.length})`);
          try {
            compressedImages.push(await compressImage(newImages[i]));
          } catch (err) {
            if (controller.signal.aborted) throw err;
            toast.error(`이미지 "${newImages[i].name}" 압축 실패: ${err.message}`);
            return;
          }
        }

        // 2단계: 이미지 업로드
        for (let i = 0; i < compressedImages.length; i++) {
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          setLoadingStep(`이미지 업로드 중... (${i + 1}/${compressedImages.length})`);
          try {
            newImageUrls.push(await uploadImage(compressedImages[i], user.id, { signal: controller.signal }));
          } catch (err) {
            if (controller.signal.aborted) throw err;
            const errMsg = err.message || '';
            if (errMsg.includes('시간 초과')) {
              toast.error(`이미지 "${newImages[i].name}" 업로드 시간 초과. 파일 크기를 줄이거나 네트워크를 확인해주세요.`);
            } else if (errMsg.includes('Payload too large') || errMsg.includes('413')) {
              toast.error(`이미지 "${newImages[i].name}"이 너무 큽니다. 5MB 이하의 이미지를 사용해주세요.`);
            } else {
              toast.error(`이미지 "${newImages[i].name}" 업로드 실패: ${errMsg}`);
            }
            return;
          }
        }
      }

      // 3단계: 상품 수정
      if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
      setLoadingStep('상품 수정 중...');
      const allImages = [...(existingImages || []), ...newImageUrls];

      await updateProduct(id, {
        ...formData,
        images: allImages,
      });

      toast.success('상품이 수정되었습니다!');
      navigate('/my-products');
    } catch (error) {
      // AbortError (취소 또는 타임아웃)
      if (error.name === 'AbortError') {
        if (!abortControllerRef.current) {
          // 사용자가 수동 취소한 경우 - handleCancel에서 이미 toast 표시
          return;
        }
        // 글로벌 타임아웃에 의한 자동 취소
        toast.error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        return;
      }

      console.error('상품 수정 에러:', error);
      const msg = error.message || '';
      // 세션 만료 관련 에러 감지
      if (
        msg.includes('로그인이 필요합니다') ||
        msg.includes('세션이 만료되었습니다') ||
        msg.includes('jwt') ||
        msg.includes('token') ||
        msg.includes('not authenticated') ||
        error.code === 'PGRST301' ||
        error.status === 401
      ) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error(msg || '상품 수정에 실패했습니다.');
    } finally {
      clearTimeout(globalTimeout);
      abortControllerRef.current = null;
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
        onCancel={handleCancel}
      />
    </div>
  );
}
