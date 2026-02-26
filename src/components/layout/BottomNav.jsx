import { Link, useLocation } from 'react-router-dom';
import { HiOutlineBuildingStorefront, HiOutlineUserGroup, HiOutlineStar } from 'react-icons/hi2';

const tabs = [
  { path: '/', label: '제품홍보관', icon: HiOutlineBuildingStorefront, matchExact: true },
  { path: '/chapters', label: '챕터홍보관', icon: HiOutlineUserGroup },
  { path: '/dream-referral', label: '드림리퍼럴', icon: HiOutlineStar },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (tab) => {
    if (tab.matchExact) {
      return pathname === tab.path;
    }
    return pathname.startsWith(tab.path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const isDream = tab.path === '/dream-referral';
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active
                  ? isDream
                    ? 'text-amber-600'
                    : 'text-primary-600'
                  : 'text-slate-400'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* iOS safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
