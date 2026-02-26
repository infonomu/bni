export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-white font-black text-lg tracking-tight">BNI</span>
          <span className="text-slate-300 font-semibold text-lg">마포 홍보관</span>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          멤버 간 비즈니스 연결을 위한 플랫폼
        </p>
        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} BNI 마포 정보람 디렉터. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
