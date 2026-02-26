const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 배경: 쿨 화이트 → 슬레이트 그라디언트
const bgGradient = ctx.createLinearGradient(0, 0, width, height);
bgGradient.addColorStop(0, '#F8FAFC');
bgGradient.addColorStop(1, '#E2E8F0');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

// 좌상단 장식: 큰 원 (rose-red, 투명)
ctx.globalAlpha = 0.06;
ctx.fillStyle = '#E11D48';
ctx.beginPath();
ctx.arc(-60, -40, 300, 0, Math.PI * 2);
ctx.fill();

// 우하단 장식: 큰 원
ctx.beginPath();
ctx.arc(1260, 670, 280, 0, Math.PI * 2);
ctx.fill();

// 우상단 장식: 작은 원
ctx.globalAlpha = 0.04;
ctx.beginPath();
ctx.arc(1050, 80, 120, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

// 하단 그라디언트 바
const barGradient = ctx.createLinearGradient(0, 0, width, 0);
barGradient.addColorStop(0, '#E11D48');
barGradient.addColorStop(0.5, '#FB7185');
barGradient.addColorStop(1, '#94A3B8');
ctx.fillStyle = barGradient;
ctx.fillRect(0, height - 6, width, 6);

// 상단 얇은 라인
ctx.fillStyle = '#E11D48';
ctx.fillRect(0, 0, width, 3);

// "BNI" 텍스트 (bold, rose-red)
ctx.fillStyle = '#E11D48';
ctx.font = 'bold 84px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('BNI', width / 2 - 120, height / 2 - 60);

// "마포" 텍스트 (semibold, dark slate)
ctx.fillStyle = '#1E293B';
ctx.font = '600 84px sans-serif';
ctx.fillText('마포', width / 2 + 80, height / 2 - 60);

// 홍보관 뱃지
const badgeText = '홍보관';
ctx.font = '600 28px sans-serif';
const badgeWidth = ctx.measureText(badgeText).width + 32;
const badgeX = width / 2 + 200;
const badgeY = height / 2 - 80;

ctx.fillStyle = '#FFF1F2';
ctx.beginPath();
ctx.roundRect(badgeX, badgeY, badgeWidth, 40, 20);
ctx.fill();
ctx.strokeStyle = '#FECDD3';
ctx.lineWidth = 1.5;
ctx.stroke();

ctx.fillStyle = '#E11D48';
ctx.font = '600 22px sans-serif';
ctx.textAlign = 'center';
ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 25);

// 서브 타이틀
ctx.fillStyle = '#64748B';
ctx.font = '32px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('제품 · 챕터 · 드림리퍼럴', width / 2, height / 2 + 30);

// 하단 태그라인
ctx.fillStyle = '#94A3B8';
ctx.font = '22px sans-serif';
ctx.fillText('멤버 간 비즈니스 연결로 함께 성장합니다', width / 2, height / 2 + 100);

// 좌하단 URL
ctx.fillStyle = '#CBD5E1';
ctx.font = '18px sans-serif';
ctx.textAlign = 'left';
ctx.fillText('bni-orcin.vercel.app', 40, height - 30);

// JPEG로 저장
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
const outputPath = path.join(__dirname, '..', 'public', 'og-image.jpg');
fs.writeFileSync(outputPath, buffer);

console.log('OG 이미지 생성 완료:', outputPath);
