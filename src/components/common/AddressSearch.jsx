import { useState, useCallback } from 'react';

const KAKAO_POSTCODE_SDK = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

export default function AddressSearch({ onComplete, className = '' }) {
  const [loading, setLoading] = useState(false);

  const loadScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      // 이미 로드되어 있으면 바로 resolve
      if (window.daum && window.daum.Postcode) {
        resolve();
        return;
      }

      // 이미 스크립트 태그가 있는지 확인
      const existingScript = document.querySelector(`script[src="${KAKAO_POSTCODE_SDK}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
      }

      // 스크립트 동적 로드
      const script = document.createElement('script');
      script.src = KAKAO_POSTCODE_SDK;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('카카오 주소 검색 SDK 로드 실패'));
      document.head.appendChild(script);
    });
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadScript();

      new window.daum.Postcode({
        oncomplete: (data) => {
          // 도로명 주소 우선, 없으면 지번 주소
          const address = data.roadAddress || data.jibunAddress;
          const postalCode = data.zonecode;

          onComplete?.({
            postalCode,
            address,
          });
          // 팝업 완료 시 로딩 해제
          setLoading(false);
        },
        onclose: () => {
          // 팝업 닫힐 때 로딩 해제
          setLoading(false);
        },
      }).open();
    } catch (error) {
      console.error('주소 검색 에러:', error);
      alert('주소 검색을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
    // finally 블록에서 setLoading(false) 제거 - 비동기 팝업이므로 콜백에서 처리
  };

  return (
    <button
      type="button"
      onClick={handleSearch}
      disabled={loading}
      className={`px-4 py-2.5 bg-brown/10 text-brown font-medium rounded-lg hover:bg-brown/20 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? '로딩...' : '주소 검색'}
    </button>
  );
}
