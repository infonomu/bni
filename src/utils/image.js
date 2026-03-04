/**
 * 이미지 압축 함수
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비 (기본 800px)
 * @param {number} quality - 압축 품질 0-1 (기본 0.6)
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export function compressImage(file, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    // 지원하지 않는 형식 사전 차단 (HEIF/HEIC 등)
    const ext = file.name.split('.').pop().toLowerCase();
    if (['heif', 'heic', 'tiff', 'bmp', 'svg'].includes(ext)) {
      reject(new Error(`${ext.toUpperCase()} 형식은 지원하지 않습니다. JPG, PNG, WebP로 변환해주세요.`));
      return;
    }

    // 이미 작은 파일은 압축하지 않음
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('이미지 압축 시간 초과 (30초)'));
    }, 30000);

    const reader = new FileReader();
    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('이미지 파일을 읽을 수 없습니다'));
    };
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('이미지를 로드할 수 없습니다'));
      };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            clearTimeout(timeoutId);
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`압축: ${(file.size / 1024).toFixed(0)}KB → ${(compressedFile.size / 1024).toFixed(0)}KB`);
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
