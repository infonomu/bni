export default function Footer() {
  return (
    <footer className="bg-brown text-ivory/80 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">🏮</span>
          <span className="font-heading text-lg">BNI 마포 설선물관</span>
          <span className="text-2xl">🧧</span>
        </div>
        <p className="text-sm mb-2">
          멤버 간 비즈니스 연결을 위한 설 선물관
        </p>
        <p className="text-xs text-ivory/50">
          &copy; {new Date().getFullYear()} BNI 마포 정보람 디렉터. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
