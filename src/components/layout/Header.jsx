import { Link } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlinePlusCircle, HiOutlineBookOpen } from 'react-icons/hi2';
import { useAuthStore } from '../../hooks/useAuth';

export default function Header() {
  const { user, profile } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-accent-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🏮</span>
            <div>
              <h1 className="font-heading text-xl font-bold text-primary-600">
                BNI 마포
              </h1>
              <p className="text-sm text-accent-600 font-medium">설선물관</p>
            </div>
          </Link>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-3">
            <Link
              to="/guide"
              className="flex items-center gap-1 px-3 py-2 text-brown hover:text-primary-600 transition-colors"
            >
              <HiOutlineBookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">사용방법</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <HiOutlinePlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">상품 등록</span>
            </Link>

            {user ? (
              <Link
                to="/my-products"
                className="flex items-center gap-1 px-3 py-2 text-brown hover:text-primary-600 transition-colors"
              >
                <HiOutlineUserCircle className="w-6 h-6" />
                <span className="hidden sm:inline">{profile?.name || '내 상품'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-2 text-brown hover:text-primary-600 transition-colors"
              >
                <HiOutlineUserCircle className="w-6 h-6" />
                <span className="hidden sm:inline">로그인</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
