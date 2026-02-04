import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useProductStore, CATEGORIES } from '../hooks/useProducts';
import ProductForm from '../components/product/ProductForm';
import { compressImage } from '../utils/image';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuthStore();
  const { getProduct, updateProduct, uploadImage } = useProductStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      // 새 이미지 압축 후 병렬 업로드
      let newImageUrls = [];
      if (newImages.length > 0) {
        const compressedImages = await Promise.all(newImages.map((img) => compressImage(img)));
        newImageUrls = await Promise.all(
          compressedImages.map((img) => uploadImage(img, user.id))
        );
      }

      // 기존 이미지 (삭제된 것 제외) + 새 이미지
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
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">✏️</span>
        <h2 className="font-heading text-2xl font-bold mt-4">상품 수정</h2>
        <p className="text-brown/60 text-sm max-w-md mx-auto mt-3 bg-ivory p-3 rounded-xl">
          설 선물관은 멤버들간 연결을 위한 플랫폼이며, 쇼핑몰이 아닙니다.<br />
          쇼핑몰 URL 연결, 또는 이메일로 주문서를 받으실 수 있습니다.
        </p>
      </div>

      <ProductForm
        categories={CATEGORIES.filter(c => c.id !== 'all')}
        profile={profile}
        initialData={product}
        onSubmit={handleSubmit}
        loading={saving}
        isEdit
      />
    </div>
  );
}
