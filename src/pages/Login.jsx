import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineBuildingOffice, HiOutlinePhone, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';
import AddressSearch from '../components/common/AddressSearch';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    chapter: '',
    specialty: '',
    company: '',
    phone: '',
    postal_code: '',
    address: '',
    address_detail: '',
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error('올바른 이메일 형식을 입력해주세요');
      return;
    }

    if (isSignUp && !formData.name) {
      toast.error('이름을 입력해주세요');
      return;
    }


    if (formData.password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, {
          name: formData.name,
          chapter: formData.chapter,
          specialty: formData.specialty,
          company: formData.company,
          phone: formData.phone,
          postal_code: formData.postal_code,
          address: formData.address,
          address_detail: formData.address_detail,
        });
        toast.success('회원가입 완료!');
        navigate('/profile');
      } else {
        await signIn(formData.email, formData.password);
        toast.success('로그인 성공!');
        navigate('/my-products');
      }
    } catch (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다');
      } else if (error.message.includes('already registered')) {
        toast.error('이미 가입된 이메일입니다');
      } else {
        toast.error(error.message || '오류가 발생했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <span className="text-5xl">🏮</span>
        <h2 className="font-heading text-2xl font-bold mt-4">
          {isSignUp ? '회원가입' : '로그인'}
        </h2>
        <p className="text-brown/60 mt-2">
          상품 등록을 위해 {isSignUp ? '가입' : '로그인'}하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 회원가입 필드들 */}
        {isSignUp && (
          <>
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2">이름 <span className="text-primary-600">*</span></label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="BNI 멤버 이름"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            {/* 챕터명 */}
            <div>
              <label className="block text-sm font-medium mb-2">챕터명</label>
              <div className="relative">
                <HiOutlineUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <select
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white appearance-none"
                >
                  <option value="">챕터 선택</option>
                  <option value="나이스">나이스</option>
                  <option value="매트릭스">매트릭스</option>
                  <option value="맥스">맥스</option>
                  <option value="스톤웍스">스톤웍스</option>
                  <option value="애티튜드">애티튜드</option>
                  <option value="유니콘">유니콘</option>
                  <option value="제우스">제우스</option>
                  <option value="케이">케이</option>
                  <option value="타이탄">타이탄</option>
                  <option value="탑클래스">탑클래스</option>
                  <option value="프레즌트">프레즌트</option>
                </select>
              </div>
            </div>

            {/* 전문분야 */}
            <div>
              <label className="block text-sm font-medium mb-2">전문분야</label>
              <div className="relative">
                <HiOutlineBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="예: 식품유통, 판촉물, 제조"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            {/* 회사명 */}
            <div>
              <label className="block text-sm font-medium mb-2">회사명</label>
              <div className="relative">
                <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="회사/상호명"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium mb-2">연락처</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>
            </div>

            {/* 주소 */}
            <div className="space-y-2">
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
          </>
        )}

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium mb-2">이메일</label>
          <div className="relative">
            <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="이메일 주소"
              className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              required
            />
          </div>
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium mb-2">비밀번호</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="비밀번호 (6자 이상)"
              className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setFormData({ email: '', password: '', name: '', chapter: '', specialty: '', company: '', phone: '', postal_code: '', address: '', address_detail: '' });
          }}
          className="text-primary-600 hover:underline"
        >
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  );
}
