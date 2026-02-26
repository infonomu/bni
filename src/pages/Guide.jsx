import { Link } from 'react-router-dom';
import { HiOutlineHome, HiOutlinePlusCircle } from 'react-icons/hi2';

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-12">
        <div className="flex justify-center gap-4 mb-4">
          <span className="text-4xl floating-decoration" style={{ animationDelay: '0s' }}>🏢</span>
          <span className="text-4xl floating-decoration" style={{ animationDelay: '0.5s' }}>🤝</span>
          <span className="text-4xl floating-decoration" style={{ animationDelay: '1s' }}>✨</span>
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-600 mb-6">
          홍보관 이용 안내
        </h2>

        {/* 핵심 메시지 박스 */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-left max-w-2xl mx-auto">
          <h3 className="font-bold text-primary-700 mb-3 text-center">📌 알아두세요!</h3>
          <ul className="space-y-2 text-brown/80">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>정식 쇼핑몰이 아닙니다</strong> - BNI 마포 멤버들의 비즈니스를 소개하고 연결해드리는 플랫폼입니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>문의/주문 시</strong> - 결제는 판매 멤버와 별도로 연락하여 진행합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 mt-1">•</span>
              <span><strong>모든 마포 멤버</strong>가 비즈니스 아이템을 등록할 수 있습니다.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 안내 섹션들 */}
      <div className="space-y-8">
        {/* 상품등록방법 */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-heading text-xl font-bold text-primary-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            아이템 등록 방법
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-brown">회원가입 / 로그인</h4>
                <p className="text-brown/70 text-sm">이메일로 회원가입 후 로그인합니다.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-brown">프로필 설정</h4>
                <p className="text-brown/70 text-sm">멤버 이름, 회사명, 연락처를 설정합니다. (내 상품 &gt; 프로필 관리)</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-brown">상품 등록 클릭</h4>
                <p className="text-brown/70 text-sm">상단의 "상품 등록" 버튼을 클릭합니다.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center shrink-0">4</div>
              <div>
                <h4 className="font-semibold text-brown">상품 정보 입력</h4>
                <p className="text-brown/70 text-sm">아이템명, 가격, 설명, 이미지, 카테고리 등을 입력하고 등록합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 주문방법 */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-heading text-xl font-bold text-primary-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            문의 및 주문 방법
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 방법 A */}
            <div className="bg-accent-50 rounded-xl p-4">
              <h4 className="font-bold text-accent-700 mb-3">방법 A: 사이트 직접 방문</h4>
              <ol className="space-y-2 text-sm text-brown/80">
                <li className="flex gap-2">
                  <span className="font-bold text-accent-600">1.</span>
                  <span>원하는 아이템을 클릭합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-accent-600">2.</span>
                  <span>"사이트 바로가기" 버튼이 있으면 클릭합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-accent-600">3.</span>
                  <span>멤버의 공식 사이트에서 직접 문의하거나 주문합니다.</span>
                </li>
              </ol>
              <p className="mt-3 text-xs text-accent-600 bg-accent-100 rounded-lg p-2">
                💡 멤버의 공식 채널에서 안전하게 거래!
              </p>
            </div>

            {/* 방법 B */}
            <div className="bg-primary-50 rounded-xl p-4">
              <h4 className="font-bold text-primary-700 mb-3">방법 B: 이메일 주문서 전송</h4>
              <ol className="space-y-2 text-sm text-brown/80">
                <li className="flex gap-2">
                  <span className="font-bold text-primary-600">1.</span>
                  <span>원하는 아이템을 클릭합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary-600">2.</span>
                  <span>"이메일 주문하기" 버튼을 클릭합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary-600">3.</span>
                  <span>주문 정보를 입력하고 전송합니다.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary-600">4.</span>
                  <span>멤버가 연락하면 세부 사항을 협의합니다.</span>
                </li>
              </ol>
              <p className="mt-3 text-xs text-primary-600 bg-primary-100 rounded-lg p-2">
                ⚠️ 이메일 주문 시 결제는 멤버와 별도 진행!
              </p>
            </div>
          </div>
        </section>

        {/* 주문확인방법 */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-heading text-xl font-bold text-primary-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            주문 확인 방법
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 구매자 */}
            <div className="border border-accent-200 rounded-xl p-4">
              <h4 className="font-bold text-brown mb-3">🛍️ 구매자</h4>
              <ul className="space-y-2 text-sm text-brown/80">
                <li className="flex items-start gap-2">
                  <span className="text-accent-600">•</span>
                  <span>이메일 주문 시, 입력한 이메일로 주문 확인 메일이 발송됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-600">•</span>
                  <span>멤버가 별도로 연락하여 결제 및 배송을 안내합니다.</span>
                </li>
              </ul>
            </div>

            {/* 판매자 */}
            <div className="border border-primary-200 rounded-xl p-4">
              <h4 className="font-bold text-brown mb-3">📦 멤버(판매자)</h4>
              <ul className="space-y-2 text-sm text-brown/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">•</span>
                  <span>프로필에 등록한 이메일로 주문서가 수신됩니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">•</span>
                  <span>주문서를 확인하고 구매자에게 연락합니다.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600">•</span>
                  <span>결제 방법 협의 후 상품을 배송합니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 하단 CTA */}
      <section className="mt-12 text-center">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-100 text-accent-700 rounded-xl hover:bg-accent-200 transition-all hover:-translate-y-0.5"
          >
            <HiOutlineHome className="w-5 h-5" />
            홈으로 돌아가기
          </Link>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <HiOutlinePlusCircle className="w-5 h-5" />
            아이템 등록하기
          </Link>
        </div>
      </section>
    </div>
  );
}
