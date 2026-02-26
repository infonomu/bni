import { Link, useLocation } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlinePlusCircle, HiOutlineBookOpen } from 'react-icons/hi2';
import { useAuthStore } from '../../hooks/useAuth';

export default function Header() {
  const { user, profile } = useAuthStore();
  const location = useLocation();

  const pathname = location.pathname;
  const isChapters = pathname === '/chapters';
  const isDream = pathname === '/dream-referral';
  const isProducts = !isChapters && !isDream;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-primary-600 tracking-tight">BNI</span>
              <span className="text-2xl font-semibold text-slate-700 tracking-tight">마포</span>
            </div>
            <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-semibold rounded-full border border-primary-200 tracking-wide">
              홍보관
            </span>
          </Link>

          {/* 메인 탭 네비게이션 */}
          <div className="flex items-center gap-1 mx-4">
            <Link
              to="/"
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isProducts
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:inline">제품홍보관</span>
              <span className="sm:hidden">제품</span>
            </Link>
            <Link
              to="/chapters"
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isChapters
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:inline">챕터홍보관</span>
              <span className="sm:hidden">챕터</span>
            </Link>
            <Link
              to="/dream-referral"
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isDream
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="hidden sm:inline">드림리퍼럴 커넥트</span>
              <span className="sm:hidden">드림</span>
            </Link>
          </div>

          {/* 네비게이션 */}
          <nav className="flex items-center gap-1">
            <Link
              to="/guide"
              className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all text-sm font-medium"
            >
              <HiOutlineBookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">사용방법</span>
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <HiOutlinePlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">상품 등록</span>
            </Link>

            {user ? (
              <Link
                to="/my-products"
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all text-sm font-medium"
              >
                <HiOutlineUserCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{profile?.name || '내 상품'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all text-sm font-medium"
              >
                <HiOutlineUserCircle className="w-5 h-5" />
                <span className="hidden sm:inline">로그인</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
      {/* 하단 그라디언트 라인 */}
      <div className="h-0.5 bg-gradient-to-r from-primary-600 via-primary-400 to-accent-400" />
    </header>
  );
}
