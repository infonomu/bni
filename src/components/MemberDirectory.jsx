import { useEffect, useState, useCallback } from 'react';
import { HiOutlineSearch, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { useMemberStore } from '../hooks/useMembers';
import { useChapterStore } from '../hooks/useChapters';

export default function MemberDirectory() {
  const {
    members,
    loading,
    error,
    chapterFilter,
    specialtySearch,
    page,
    pageSize,
    totalCount,
    fetchMembers,
    setChapterFilter,
    setSpecialtySearch,
    setPage,
  } = useMemberStore();

  const { chapterNames, fetchChapters } = useChapterStore();

  const [searchInput, setSearchInput] = useState(specialtySearch);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== specialtySearch) {
        setSpecialtySearch(searchInput);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, specialtySearch, setSpecialtySearch]);

  // 검색어 변경 후 멤버 재조회
  useEffect(() => {
    if (specialtySearch !== undefined) {
      fetchMembers();
    }
  }, [specialtySearch, fetchMembers]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const uniqueChapters = chapterNames.length > 0 ? chapterNames : [];

  const handleChapterChange = useCallback(
    (e) => {
      setChapterFilter(e.target.value);
    },
    [setChapterFilter]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [setPage, totalPages]
  );

  return (
    <div>
      {/* 통계 뱃지 */}
      <div className="flex items-center gap-4 flex-wrap mb-6">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
          <span className="text-primary-600 font-black text-lg">{totalCount}</span>
          <span className="text-sm text-slate-500 font-medium">전체 멤버</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
          <span className="text-primary-600 font-black text-lg">{uniqueChapters.length}</span>
          <span className="text-sm text-slate-500 font-medium">챕터</span>
        </div>
      </div>

      {/* 필터/검색 영역 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* 챕터 필터 드롭다운 */}
        <select
          value={chapterFilter}
          onChange={handleChapterChange}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
        >
          <option value="">전체 챕터</option>
          {uniqueChapters.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* 업종 검색 */}
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="업종/전문분야 검색..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
          />
        </div>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24" />
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-4 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded flex-1" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="text-slate-500 text-lg mb-2">멤버 정보를 불러오는 중 오류가 발생했습니다.</p>
          <button
            onClick={() => fetchMembers()}
            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <p className="text-slate-400 text-base">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="hidden sm:grid grid-cols-4 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">이름</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">챕터</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">업종/전문분야</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">회사명</span>
          </div>

          {/* 테이블 바디 */}
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-1 sm:gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-800">{member.member_name}</span>
                <span className="text-sm text-slate-500">
                  <span className="sm:hidden text-xs text-slate-400 mr-1">챕터:</span>
                  {member.chapter_name}
                </span>
                <span className="text-sm text-slate-600">
                  <span className="sm:hidden text-xs text-slate-400 mr-1">업종:</span>
                  {member.specialty || '-'}
                </span>
                <span className="text-sm text-slate-600">
                  <span className="sm:hidden text-xs text-slate-400 mr-1">회사:</span>
                  {member.company_name || '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <span className="text-sm text-slate-500">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
            {' '}/ {totalCount}명
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>

            {/* 페이지 번호 버튼 */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
