/**
 * 이미지 압축 함수
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비 (기본 1200px)
 * @param {number} quality - 압축 품질 0-1 (기본 0.8)
 * @returns {Promise<File>} 압축된 이미지 파일
 */
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    // 이미 작은 파일은 압축하지 않음
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
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
