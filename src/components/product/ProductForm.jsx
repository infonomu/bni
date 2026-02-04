import { useState, useRef } from 'react';
import { HiOutlinePhoto, HiOutlineXMark, HiOutlineGlobeAlt } from 'react-icons/hi2';

export default function ProductForm({
  categories,
  profile,
  initialData,
  onSubmit,
  loading,
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    category: initialData?.category || 'food',
    site_url: initialData?.site_url || '',
    accept_email_order: initialData?.accept_email_order ?? true,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + existingImages.length + files.length;

    if (totalImages > 3) {
      alert('이미지는 최대 3장까지 업로드할 수 있습니다.');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}은 5MB를 초과합니다.`);
        return false;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert(`${file.name}은 지원하지 않는 형식입니다.`);
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(
      {
        ...formData,
        price: parseInt(formData.price, 10),
      },
      images,
      existingImages
    );
  };

  const formatPrice = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 상품명 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          상품명 <span className="text-primary-600">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="상품명을 입력하세요"
          maxLength={50}
          className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          required
        />
        <p className="text-xs text-brown/50 mt-1">{formData.name.length}/50자</p>
      </div>

      {/* 상품 설명 */}
      <div>
        <label className="block text-sm font-medium mb-2">상품 설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="상품에 대한 설명을 입력하세요"
          maxLength={500}
          rows={4}
          className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white resize-none"
        />
        <p className="text-xs text-brown/50 mt-1">{formData.description.length}/500자</p>
      </div>

      {/* 가격 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          가격 <span className="text-primary-600">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formatPrice(String(formData.price))}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, '');
              setFormData({ ...formData, price: numericValue });
            }}
            placeholder="0"
            className="w-full px-4 py-3 pr-12 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brown/50">원</span>
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          카테고리 <span className="text-primary-600">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 사이트 URL */}
      <div>
        <label className="block text-sm font-medium mb-2">
          상품 사이트 URL
        </label>
        <div className="relative">
          <HiOutlineGlobeAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
          <input
            type="url"
            value={formData.site_url}
            onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <p className="text-xs text-brown/50 mt-1">상품 상세 페이지나 쇼핑몰 링크</p>
      </div>

      {/* 이메일 주문 수신 여부 */}
      <div className="p-4 bg-ivory rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.accept_email_order}
            onChange={(e) => setFormData({ ...formData, accept_email_order: e.target.checked })}
            className="w-5 h-5 rounded border-brown/30 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <span className="font-medium">이메일 주문서 받기</span>
            <p className="text-xs text-brown/50 mt-0.5">
              체크하면 고객이 이메일로 주문서를 보낼 수 있습니다.<br />
              체크 해제하면 사이트 URL만 표시됩니다.
            </p>
          </div>
        </label>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          상품 이미지 (최대 3장, 각 5MB 이하)
        </label>
        <div className="flex flex-wrap gap-3">
          {/* 기존 이미지 */}
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative w-24 h-24">
              <img
                src={url}
                alt={`상품 이미지 ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* 새 이미지 미리보기 */}
          {images.map((file, index) => (
            <div key={`new-${index}`} className="relative w-24 h-24">
              <img
                src={URL.createObjectURL(file)}
                alt={`새 이미지 ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* 업로드 버튼 */}
          {existingImages.length + images.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-brown/20 rounded-lg flex flex-col items-center justify-center text-brown/40 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <HiOutlinePhoto className="w-6 h-6 mb-1" />
              <span className="text-xs">추가</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* 판매자 정보 (읽기 전용) */}
      <div className="p-4 bg-ivory rounded-lg">
        <p className="text-sm text-brown/60 mb-2">판매자 정보</p>
        <p className="font-medium">{profile?.name || '이름 미설정'}</p>
        <p className="text-sm text-brown/60">{profile?.company || ''}</p>
        <p className="text-sm text-brown/60">{profile?.email}</p>
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '처리 중...' : isEdit ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}
