const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// === 배경: 다크 슬레이트 그라디언트 ===
const bgGradient = ctx.createLinearGradient(0, 0, width, height);
bgGradient.addColorStop(0, '#0F172A');
bgGradient.addColorStop(0.6, '#1E293B');
bgGradient.addColorStop(1, '#0F172A');
ctx.fillStyle = bgGradient;
ctx.fillRect(0, 0, width, height);

// === 장식: 글로우 원 (rose-red, 블러 효과) ===
// 좌측 상단 글로우
const glow1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 350);
glow1.addColorStop(0, 'rgba(225, 29, 72, 0.15)');
glow1.addColorStop(1, 'rgba(225, 29, 72, 0)');
ctx.fillStyle = glow1;
ctx.fillRect(0, 0, 500, 500);

// 우측 하단 글로우
const glow2 = ctx.createRadialGradient(1050, 480, 0, 1050, 480, 400);
glow2.addColorStop(0, 'rgba(251, 113, 133, 0.12)');
glow2.addColorStop(1, 'rgba(251, 113, 133, 0)');
ctx.fillStyle = glow2;
ctx.fillRect(650, 200, 550, 430);

// 중앙 은은한 글로우
const glow3 = ctx.createRadialGradient(600, 280, 0, 600, 280, 300);
glow3.addColorStop(0, 'rgba(225, 29, 72, 0.06)');
glow3.addColorStop(1, 'rgba(225, 29, 72, 0)');
ctx.fillStyle = glow3;
ctx.fillRect(300, 0, 600, 560);

// === 상단 그라디언트 라인 ===
const topLine = ctx.createLinearGradient(0, 0, width, 0);
topLine.addColorStop(0, '#E11D48');
topLine.addColorStop(0.5, '#FB7185');
topLine.addColorStop(1, '#64748B');
ctx.fillStyle = topLine;
ctx.fillRect(0, 0, width, 4);

// === 하단 그라디언트 라인 ===
ctx.fillStyle = topLine;
ctx.fillRect(0, height - 4, width, 4);

// === 기하학적 장식 ===
// 좌측 세로선
ctx.strokeStyle = 'rgba(225, 29, 72, 0.15)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(80, 80);
ctx.lineTo(80, 550);
ctx.stroke();

// 우측 세로선
ctx.beginPath();
ctx.moveTo(1120, 80);
ctx.lineTo(1120, 550);
ctx.stroke();

// 코너 장식 (좌상단)
ctx.strokeStyle = 'rgba(225, 29, 72, 0.25)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(60, 40);
ctx.lineTo(60, 80);
ctx.lineTo(100, 80);
ctx.stroke();

// 코너 장식 (우하단)
ctx.beginPath();
ctx.moveTo(1140, 550);
ctx.lineTo(1140, 590);
ctx.lineTo(1100, 590);
ctx.stroke();

// === "BNI 마포 홍보관" 한 줄 ===
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// "BNI" (rose-red)
ctx.fillStyle = '#E11D48';
ctx.font = 'bold 110px sans-serif';
const bniWidth = ctx.measureText('BNI').width;

// "마포 홍보관" (white)
ctx.fillStyle = '#F8FAFC';
ctx.font = 'bold 110px sans-serif';
const mapoWidth = ctx.measureText('마포 홍보관').width;

const totalWidth = bniWidth + 30 + mapoWidth;
const startX = (width - totalWidth) / 2;

ctx.fillStyle = '#E11D48';
ctx.font = 'bold 110px sans-serif';
ctx.textAlign = 'left';
ctx.fillText('BNI', startX, height / 2 - 45);

ctx.fillStyle = '#F8FAFC';
ctx.fillText('마포 홍보관', startX + bniWidth + 30, height / 2 - 45);

// === 구분선 ===
const dividerGrad = ctx.createLinearGradient(400, 0, 800, 0);
dividerGrad.addColorStop(0, 'rgba(225, 29, 72, 0)');
dividerGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.3)');
dividerGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
ctx.fillStyle = dividerGrad;
ctx.fillRect(400, height / 2 + 10, 400, 1);

// === 서브 타이틀 ===
ctx.fillStyle = '#94A3B8';
ctx.font = '28px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('제품 · 챕터 · 드림리퍼럴', width / 2, height / 2 + 55);

// === 태그라인 ===
ctx.fillStyle = '#64748B';
ctx.font = '20px sans-serif';
ctx.fillText('멤버 간 비즈니스 연결로 함께 성장합니다', width / 2, height / 2 + 110);

// === 좌하단 도메인 ===
ctx.fillStyle = '#475569';
ctx.font = '16px sans-serif';
ctx.textAlign = 'left';
ctx.fillText('www.bnilink.shop', 100, height - 30);

// === 우하단 Givers Gain ===
ctx.fillStyle = '#475569';
ctx.font = 'italic 16px sans-serif';
ctx.textAlign = 'right';
ctx.fillText('Givers Gain', 1100, height - 30);

// JPEG로 저장
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
const outputPath = path.join(__dirname, '..', 'public', 'og-image.jpg');
fs.writeFileSync(outputPath, buffer);

console.log('OG 이미지 생성 완료:', outputPath);
