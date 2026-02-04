import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    chapter: '',
    specialty: '',
    company: '',
    phone: '',
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
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }
    if (!formData.chapter.trim()) {
      toast.error('챕터명을 입력해주세요');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success('프로필이 저장되었습니다');
      navigate('/my-products');
    } catch (error) {
      toast.error(error.message || '저장에 실패했습니다');
    } finally {
      setSaving(false);
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
          <input
            type="text"
            value={formData.chapter}
            onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
            placeholder="예: 마포"
            className="w-full px-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            required
          />
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
