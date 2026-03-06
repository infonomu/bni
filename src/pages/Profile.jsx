import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import { useChapterStore } from '../hooks/useChapters';
import AddressSearch from '../components/common/AddressSearch';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuthStore();
  const { chapterNames, fetchChapters } = useChapterStore();

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);
  const [formData, setFormData] = useState({
    name: '',
    chapter: '',
    specialty: '',
    company: '',
    phone: '',
    postal_code: '',
    address: '',
    address_detail: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        chapter: profile.chapter || '',
        specialty: profile.specialty || '',
        company: profile.company || '',
        phone: profile.phone || '',
        postal_code: profile.postal_code || '',
        address: profile.address || '',
        address_detail: profile.address_detail || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }
    if (!formData.chapter) {
      toast.error('챕터를 선택해주세요');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('프로필이 저장되었습니다');
      navigate('/my-products');
    } catch (error) {
      const msg = error.message || '';
      if (msg.includes('로그인이 필요합니다') || msg.includes('세션이 만료되었습니다') || msg.includes('jwt') || msg.includes('token') || error.code === 'PGRST301' || error.status === 401) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
        return;
      }
      toast.error(msg || '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="프로필을 불러오는 중..." />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">👤</span>
        <h2 className="font-heading text-2xl font-bold mt-4">프로필 설정</h2>
        <p className="text-brown/60 mt-2">
          상품 등록 및 주문 시 사용될 정보입니다
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            이름 <span className="text-primary-600">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="BNI 멤버 이름"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            챕터명 <span className="text-primary-600">*</span>
          </label>
          <select
            value={formData.chapter}
            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            required
          >
            <option value="">챕터 선택</option>
            {chapterNames.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">전문분야</label>
          <input
            type="text"
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="예: 식품유통, 판촉물, 제조"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">회사/브랜드명</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="소속 회사 또는 브랜드"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">연락처</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-0000-0000"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        {/* 주소 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">배송지 주소</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.postal_code}
              readOnly
              placeholder="우편번호"
              className="w-28 px-4 py-3 border border-brown/20 rounded-lg bg-gray-50 text-brown/70"
            />
            <AddressSearch
              onComplete={({ postalCode, address }) => {
                setFormData({
                  ...formData,
                  postal_code: postalCode,
                  address: address,
                });
              }}
            />
          </div>
          <input
            type="text"
            value={formData.address}
            readOnly
            placeholder="기본주소 (주소 검색으로 입력)"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg bg-gray-50 text-brown/70"
          />
          <input
            type="text"
            value={formData.address_detail}
            onChange={(e) => setFormData({ ...formData, address_detail: e.target.value })}
            placeholder="상세주소 (동/호수 등)"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
