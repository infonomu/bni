import imageCompression from 'browser-image-compression';

/**
 * 이미지 압축 함수 (browser-image-compression 기반)
 * - Web Worker에서 처리하여 메인 스레드 블로킹 방지
 * - EXIF 자동 회전 보정
 * - 모바일 대용량 이미지 안정적 처리
 *
 * @param {File} file - 원본 이미지 파일
 * @param {Object} options - 추가 옵션
 * @param {AbortSignal} options.signal - 취소 시그널
 * @param {Function} options.onProgress - 진행률 콜백 (0~100)
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export async function compressImage(file, options = {}) {
  // 지원하지 않는 형식 사전 차단 (HEIF/HEIC 등)
  const ext = file.name.split('.').pop().toLowerCase();
  if (['heif', 'heic', 'tiff', 'bmp', 'svg'].includes(ext)) {
    throw new Error(`${ext.toUpperCase()} 형식은 지원하지 않습니다. JPG, PNG, WebP로 변환해주세요.`);
  }

  // 이미 작은 파일은 압축하지 않음 (300KB 이하)
  if (file.size < 300 * 1024) {
    console.log(`압축 스킵 (${(file.size / 1024).toFixed(0)}KB, 300KB 이하)`);
    return file;
  }

  const compressionOptions = {
    maxSizeMB: 0.3,           // 최대 300KB
    maxWidthOrHeight: 800,    // 최대 800px
    useWebWorker: true,       // Web Worker 사용 (메인 스레드 블로킹 방지)
    fileType: 'image/jpeg',   // JPEG 출력
    initialQuality: 0.7,      // 초기 품질
    signal: options.signal,   // AbortController signal
    onProgress: options.onProgress,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log(`압축: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
    return compressedFile;
  } catch (err) {
    // 취소된 경우 그대로 throw
    if (err.name === 'AbortError') throw err;

    // 라이브러리 압축 실패 시 원본 파일 반환 (업로드는 시도)
    console.warn('이미지 압축 실패, 원본 사용:', err.message);
    return file;
  }
}
