import { HiOutlineArrowTopRightOnSquare, HiOutlineUsers } from 'react-icons/hi2';

const DAY_COLORS = {
  '월': 'bg-purple-100 text-purple-700',
  '화': 'bg-blue-100 text-blue-700',
  '수': 'bg-green-100 text-green-700',
  '목': 'bg-orange-100 text-orange-700',
  '금': 'bg-red-100 text-red-700',
};

function getDayColor(meeting) {
  const day = meeting[0];
  return DAY_COLORS[day] || 'bg-slate-100 text-slate-700';
}

export default function ChapterCard({ chapter, index }) {
  const dayColorClass = getDayColor(chapter.meeting);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden animate-fadeInUp flex flex-col"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* 상단 그라디언트 악센트 바 */}
      <div className="h-1.5 bg-gradient-to-r from-primary-600 to-primary-400" />

      <div className="p-6 flex flex-col flex-1">
        {/* 챕터명 */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {chapter.name}
          </h3>
          <p className="text-sm text-slate-400 font-medium mt-1">BNI {chapter.nameEn}</p>
        </div>

        {/* 미팅 정보 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dayColorClass}`}>
              {chapter.meeting}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-base shrink-0">📍</span>
            <span className="text-sm text-slate-600">{chapter.location}</span>
          </div>
        </div>

        {/* 멤버 수 + 미팅 타입 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5">
            <HiOutlineUsers className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">
              멤버 <span className="font-bold text-slate-700">{chapter.members}</span>명
            </span>
          </div>
          {chapter.type && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              chapter.type === 'In-Person' ? 'bg-emerald-100 text-emerald-700' :
              chapter.type === 'Hybrid' ? 'bg-violet-100 text-violet-700' :
              'bg-sky-100 text-sky-700'
            }`}>
              {chapter.type === 'In-Person' ? '대면' :
               chapter.type === 'Hybrid' ? '하이브리드' : '온라인'}
            </span>
          )}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="mt-auto flex gap-2">
          <a
            href={chapter.bniUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
            챕터 방문
          </a>
          {chapter.website && (
            <a
              href={chapter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors"
              title="챕터 홈페이지"
            >
              <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
