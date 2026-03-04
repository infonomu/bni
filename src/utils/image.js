import imageCompression from 'browser-image-compression';

/**
 * 이미지 압축 함수
 * @param {File} file - 원본 이미지 파일
 * @param {Function} onProgress - 압축 진행률 콜백 (0-100)
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export async function compressImage(file, onProgress) {
  // 지원하지 않는 형식 사전 차단 (HEIF/HEIC 등)
  const ext = file.name.split('.').pop().toLowerCase();
  if (['heif', 'heic', 'tiff', 'bmp', 'svg'].includes(ext)) {
    throw new Error(`${ext.toUpperCase()} 형식은 지원하지 않습니다. JPG, PNG, WebP로 변환해주세요.`);
  }

  // 이미 작은 파일은 압축하지 않음
  if (file.size < 500 * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 800,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
    onProgress,
  };

  const compressedFile = await imageCompression(file, options);
  console.log(`압축: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
  return compressedFile;
}
