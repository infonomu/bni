const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// OG 이미지 권장 사이즈: 1200x630
const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 배경 그라데이션 (홍보관 테마)
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#DC2626');  // red-600
gradient.addColorStop(0.5, '#B91C1C'); // red-700
gradient.addColorStop(1, '#991B1B');  // red-800
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// 장식 원형들 (복주머니/전통 느낌)
ctx.globalAlpha = 0.1;
ctx.fillStyle = '#FEF3C7'; // amber-100
ctx.beginPath();
ctx.arc(100, 100, 150, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(1100, 530, 200, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(1050, 80, 100, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

// 중앙 장식 배경
ctx.fillStyle = 'rgba(254, 243, 199, 0.15)';
ctx.beginPath();
ctx.roundRect(100, 150, 1000, 330, 30);
ctx.fill();

// 이모지 (건물)
ctx.font = '120px serif';
ctx.textAlign = 'center';
ctx.fillText('🏢', width / 2, 260);

// 메인 타이틀
ctx.fillStyle = '#FEF3C7'; // amber-100
ctx.font = 'bold 72px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('BNI 마포홍보관', width / 2, 370);

// 서브 타이틀
ctx.fillStyle = '#FBBF24'; // amber-400
ctx.font = '32px sans-serif';
ctx.fillText('BNI 마포 멤버들의 특별한 상품 홍보관', width / 2, 430);

// 하단 태그라인
ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
ctx.font = '24px sans-serif';
ctx.fillText('멤버 간 비즈니스 연결 | Givers Gain', width / 2, 550);

// JPEG로 저장
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
const outputPath = path.join(__dirname, '..', 'public', 'og-image.jpg');
fs.writeFileSync(outputPath, buffer);

console.log('OG 이미지 생성 완료:', outputPath);
