import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineBuildingOffice, HiOutlinePhone, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuth';

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

    if (isSignUp && !formData.chapter) {
      toast.error('챕터명을 입력해주세요');
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
        });
        toast.success('회원가입 완료! 로그인해주세요.');
        setIsSignUp(false);
        setFormData({ ...formData, password: '' });
      } else {
        await signIn(formData.email, formData.password);
        toast.success('로그인 성공!');
        navigate('/register');
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
              <label className="block text-sm font-medium mb-2">챕터명 <span className="text-primary-600">*</span></label>
              <div className="relative">
                <HiOutlineUserGroup className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brown/40" />
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="예: 마포"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
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
            setFormData({ email: '', password: '', name: '', chapter: '', specialty: '', company: '', phone: '' });
          }}
          className="text-primary-600 hover:underline"
        >
          {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  );
}
