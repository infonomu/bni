/**
 * 숫자를 원화 형식으로 포맷팅
 * @param {number} price - 가격
 * @returns {string} 포맷팅된 가격 문자열
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '가격 미정';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * 가격 범위를 포맷팅
 * @param {number} price - 최소 가격
 * @param {number|null} priceMax - 최대 가격 (없으면 단일 가격)
 * @returns {string} 포맷팅된 가격 문자열
 */
export function formatPriceRange(price, priceMax) {
  if (!price && price !== 0) return '가격 미정';
  const minPrice = formatPrice(price);
  if (!priceMax || priceMax === price) {
    return minPrice;
  }
  const maxPrice = formatPrice(priceMax);
  return `${minPrice} ~ ${maxPrice}`;
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * 전화번호 포맷팅
 * @param {string} phone - 전화번호
 * @returns {string} 포맷팅된 전화번호
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}
