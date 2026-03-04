import { useEffect, useState } from 'react';
import { useChapterStore } from '../hooks/useChapters';
import ChapterCard from '../components/chapter/ChapterCard';
import MemberDirectory from '../components/MemberDirectory';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TABS = [
  { id: 'chapters', label: '챕터 정보' },
  { id: 'members', label: '멤버 디렉터리' },
];

export default function Chapters() {
  const { chapters, loading, error, fetchChapters } = useChapterStore();
  const [activeTab, setActiveTab] = useState('chapters');

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const totalMembers = chapters.reduce((sum, c) => sum + (c.member_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 히어로 섹션 */}
      <section className="text-center mb-10 py-10">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          마포 챕터
        </h2>
        <p className="text-slate-600 text-lg max-w-xl mx-auto mb-8">
          BNI 마포 지역의 {chapters.length}개 챕터를 만나보세요.
          <br />
          총 {totalMembers}명의 멤버가 함께 성장하고 있습니다.
        </p>

        {/* 통계 뱃지 */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span className="text-primary-600 font-black text-lg">{chapters.length}</span>
            <span className="text-sm text-slate-500 font-medium">챕터</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
            <span className="text-primary-600 font-black text-lg">{totalMembers}</span>
            <span className="text-sm text-slate-500 font-medium">멤버</span>
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'chapters' ? (
        <section>
          {loading ? (
            <LoadingSpinner message="챕터 정보를 불러오는 중..." />
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg mb-2">챕터 정보를 불러오는 중 오류가 발생했습니다.</p>
              <p className="text-slate-400 text-sm mb-6">폴백 데이터를 사용하고 있습니다.</p>
              <button
                onClick={() => useChapterStore.getState().reset()}
                className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <MemberDirectory />
        </section>
      )}
    </div>
  );
}
