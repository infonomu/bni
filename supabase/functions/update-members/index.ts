/**
 * Update Members Edge Function
 * BNI 마포 챕터별 멤버 목록을 파싱하여 chapter_members 테이블에 동기화
 *
 * Authorization: Bearer {UPDATE_CHAPTERS_SECRET} 헤더 필요 (update-chapters와 동일 시크릿)
 *
 * 환경변수:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   UPDATE_CHAPTERS_SECRET - 이 함수 호출 인증 시크릿
 *
 * 옵션 파라미터 (POST body JSON):
 *   includeChapters?: boolean - true 시 update-chapters 먼저 실행 후 멤버 파싱
 *
 * 타임아웃 안전장치:
 *   100초 초과 시 나머지 챕터 스킵하고 부분 결과 반환 (Free 플랜 2분 제한 대응)
 */

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BNI_MEMBER_API_URL = "http://bnimapo.com/bnicms/v3/frontend/chapterdetail/display";
const TIMEOUT_MS = 100_000; // 100초 안전장치
const CHAPTER_DELAY_MS = 1_000; // 챕터 간 요청 간격 (rate limiting 방지)
const MISS_COUNT_THRESHOLD = 2; // 연속 미확인 횟수 임계값
const BNI_WEBSITE_TYPE = "2";
const BNI_WEBSITE_ID = "10538";

interface Chapter {
  id: string;
  name: string;      // 영문명
  name_ko: string;   // 한글명
  encoded_chapter_id: string;
}

interface ParsedMember {
  member_name: string;
  member_name_en: string | null;
  company: string | null;
  specialty: string | null;
  phone: string | null;
  encrypted_member_id: string | null;
}

interface ChapterSyncResult {
  chapter_id: string;
  chapter_name: string;
  total: number;
  upserted: number;
  deactivated: number;
  suspended: number;
  skipped: boolean;
  error?: string;
}

// 이름 정규화: 공백/특수문자 제거 후 소문자 비교용
function normalizeName(name: string): string {
  return name.replace(/[\s\-_.,·]/g, "").toLowerCase();
}

// BNI 챕터 상세 API 호출하여 멤버 목록 파싱
// form-encoded POST로 chapterdetail/display 호출 → HTML 테이블에서 멤버 추출
async function fetchChapterMembers(encodedChapterId: string): Promise<ParsedMember[]> {
  const params = new URLSearchParams({
    pageMode: "Live_Site",
    chapterId: encodedChapterId,
    languageLocaleCode: "ko",
    website_type: BNI_WEBSITE_TYPE,
    website_id: BNI_WEBSITE_ID,
    mappedWidgetSettings: "[]",
    planyourvisit: "y",
  });

  const response = await fetch(BNI_MEMBER_API_URL, {
    method: "POST",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "text/html, */*; q=0.01",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "X-Requested-With": "XMLHttpRequest",
      "Referer": `http://bnimapo.com/ko/chapterdetail?chapterId=${encodeURIComponent(encodedChapterId)}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseMembersFromHtml(html);
}

// HTML 테이블에서 멤버 정보 추출 (정규식 파싱 - deno-dom 불필요)
// 테이블 행 구조:
//   <td><a href="memberdetails?encryptedMemberId=...&name=...">이름 Name</a></td>
//   <td>회사명</td>
//   <td>업종 카테고리 > 세부 업종</td>
//   <td><bdi>전화번호</bdi></td>
function parseMembersFromHtml(html: string): ParsedMember[] {
  const members: ParsedMember[] = [];

  // 테이블 행 추출: <tr role="row" class="even|odd">...</tr>
  const rowRegex = /<tr\s+role="row"\s+class="(?:even|odd)">([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // 첫 번째 <td>: 멤버 이름 + encryptedMemberId 링크
    const nameLink = rowHtml.match(
      /href=["']?memberdetails\?encryptedMemberId=([^&"'\s]+)[^>]*class="linkone"[^>]*>([^<]+)</
    );
    if (!nameLink) continue;

    const encryptedMemberId = decodeURIComponent(nameLink[1]);
    const fullName = nameLink[2].trim();

    // 한글/영문 이름 분리: "김준영 Kim. Joon-young"
    const nameKo = fullName.replace(/\s+[A-Za-z].*$/, "").trim();
    const nameEn = fullName.replace(/^[^\s]*\s+/, "").trim();

    // <td> 내용 추출 (순서: 이름, 회사, 업종, 전화번호)
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const tds: string[] = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      // HTML 태그 제거 후 텍스트만
      const text = tdMatch[1].replace(/<[^>]+>/g, "").trim();
      tds.push(text);
    }

    // tds[0]: 이름 (이미 링크에서 추출), tds[1]: 회사, tds[2]: 업종, tds[3]: 전화번호
    const company = tds[1] || null;
    const specialty = tds[2] || null;
    const phone = tds[3] || null;

    members.push({
      member_name: nameKo || fullName,
      member_name_en: nameEn !== nameKo ? nameEn : null,
      company,
      specialty,
      phone,
      encrypted_member_id: encryptedMemberId,
    });
  }

  return members;
}

// 챕터 멤버 동기화 (upsert + miss_count 관리)
async function syncChapterMembers(
  supabase: any,
  chapter: Chapter,
  parsedMembers: ParsedMember[],
  startTime: number
): Promise<ChapterSyncResult> {
  const result: ChapterSyncResult = {
    chapter_id: chapter.id,
    chapter_name: chapter.name,
    total: parsedMembers.length,
    upserted: 0,
    deactivated: 0,
    suspended: 0,
    skipped: false,
  };

  // 1. 파싱된 멤버 upsert + miss_count 초기화
  for (const member of parsedMembers) {
    if (member.member_name === "") continue;

    const upsertData: any = {
      chapter_id: chapter.id,
      chapter_name: chapter.name,
      member_name: member.member_name,
      member_name_en: member.member_name_en,
      company: member.company,
      specialty: member.specialty,
      phone: member.phone,
      encrypted_member_id: member.encrypted_member_id,
      is_active: true,
      miss_count: 0,
      last_synced_at: new Date().toISOString(),
    };

    // encrypted_member_id가 있으면 그걸로 upsert, 없으면 chapter_id + member_name 기준
    let upsertError: any;
    if (member.encrypted_member_id) {
      const { error } = await supabase
        .from("chapter_members")
        .upsert(upsertData, { onConflict: "encrypted_member_id", ignoreDuplicates: false });
      upsertError = error;
    } else {
      // chapter_id + member_name 기준 upsert (encrypted_member_id IS NULL인 경우만)
      const { data: existing } = await supabase
        .from("chapter_members")
        .select("id")
        .eq("chapter_id", chapter.id)
        .eq("member_name", member.member_name)
        .is("encrypted_member_id", null)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("chapter_members")
          .update({ ...upsertData })
          .eq("id", existing.id);
        upsertError = error;
      } else {
        const { error } = await supabase
          .from("chapter_members")
          .insert(upsertData);
        upsertError = error;
      }
    }

    if (upsertError) {
      console.error(`멤버 upsert 실패 (${member.member_name}):`, upsertError);
    } else {
      result.upserted++;
    }
  }

  // 2. 이번 파싱에 없는 기존 멤버 → miss_count 증가
  // 파싱된 이름 Set 구성 (정규화 버전)
  const parsedNamesNorm = new Set(parsedMembers.map((m) => normalizeName(m.member_name)));
  const parsedEncIds = new Set(
    parsedMembers
      .filter((m) => m.encrypted_member_id)
      .map((m) => m.encrypted_member_id!)
  );

  const { data: existingMembers, error: fetchErr } = await supabase
    .from("chapter_members")
    .select("id, member_name, encrypted_member_id, miss_count, profile_id, is_active")
    .eq("chapter_id", chapter.id)
    .eq("is_active", true);

  if (fetchErr) {
    console.error(`기존 멤버 조회 실패 (${chapter.name}):`, fetchErr);
    return result;
  }

  for (const existing of existingMembers ?? []) {
    // 파싱된 목록에 있으면 스킵 (이미 upsert에서 miss_count=0 처리됨)
    const matchedByEncId = existing.encrypted_member_id && parsedEncIds.has(existing.encrypted_member_id);
    const matchedByName = parsedNamesNorm.has(normalizeName(existing.member_name));
    if (matchedByEncId || matchedByName) continue;

    const newMissCount = (existing.miss_count ?? 0) + 1;
    const shouldDeactivate = newMissCount >= MISS_COUNT_THRESHOLD;

    const { error: updateErr } = await supabase
      .from("chapter_members")
      .update({
        miss_count: newMissCount,
        is_active: !shouldDeactivate,
      })
      .eq("id", existing.id);

    if (updateErr) {
      console.error(`miss_count 업데이트 실패 (${existing.member_name}):`, updateErr);
      continue;
    }

    if (shouldDeactivate) {
      result.deactivated++;
      console.log(`탈퇴 처리: ${existing.member_name} (miss_count=${newMissCount})`);

      // profile_id가 있으면 profiles.status를 'suspended'로 변경
      if (existing.profile_id) {
        const { error: suspendErr } = await supabase
          .from("profiles")
          .update({ status: "suspended" })
          .eq("id", existing.profile_id)
          .eq("status", "active"); // 이미 suspended/withdrawn인 경우 불필요한 업데이트 방지

        if (suspendErr) {
          console.error(`profiles suspended 처리 실패 (${existing.member_name}):`, suspendErr);
        } else {
          result.suspended++;
        }
      }
    }
  }

  return result;
}

// @ts-ignore
serve(async (req: any) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "POST 메서드만 허용됩니다" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // @ts-ignore
    const expectedSecret = Deno.env.get("UPDATE_CHAPTERS_SECRET") ?? "";

    // Authorization 헤더 검증: UPDATE_CHAPTERS_SECRET 또는 admin 사용자 JWT 허용
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    let isAuthorized = false;

    // 1차: UPDATE_CHAPTERS_SECRET 일치 확인 (CI/cron용)
    if (expectedSecret && token === expectedSecret) {
      isAuthorized = true;
    }

    // 2차: JWT 토큰이면 service_role 또는 admin 사용자인지 확인
    if (!isAuthorized && token) {
      try {
        // JWT payload 디코딩 (서명 검증은 Supabase가 처리)
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "service_role") {
          isAuthorized = true;
        } else {
          // 일반 사용자 JWT: admin role 확인 (Admin 페이지용)
          const authClient = createClient(supabaseUrl, supabaseServiceKey);
          const { data: { user }, error: userErr } = await authClient.auth.getUser(token);
          if (!userErr && user) {
            const { data: profile } = await authClient
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .single();
            if (profile?.role === "admin") {
              isAuthorized = true;
            }
          }
        }
      } catch {
        // JWT 디코딩 실패 → 인증 실패
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: "인증 실패: 관리자 권한이 필요합니다" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 요청 바디 파싱
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body 없거나 파싱 실패 시 기본값 사용
    }

    const startTime = Date.now();

    // 활성 챕터 목록 조회 (encoded_chapter_id 포함)
    const { data: chapters, error: chaptersErr } = await supabase
      .from("chapters")
      .select("id, name, name_ko, encoded_chapter_id")
      .eq("is_active", true)
      .not("encoded_chapter_id", "is", null);

    if (chaptersErr) {
      throw new Error(`챕터 목록 조회 실패: ${chaptersErr.message}`);
    }

    if (!chapters || chapters.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "처리할 활성 챕터가 없습니다" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`총 ${chapters.length}개 챕터 멤버 동기화 시작`);

    const results: ChapterSyncResult[] = [];
    let processedChapters = 0;
    let totalUpserted = 0;
    let totalDeactivated = 0;
    let totalSuspended = 0;
    let skippedChapters = 0;

    for (const chapter of chapters) {
      // 타임아웃 안전장치: 100초 초과 시 나머지 스킵
      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        console.warn(`타임아웃 안전장치 작동 (${elapsed}ms): 나머지 ${chapters.length - processedChapters}개 챕터 스킵`);
        for (let i = processedChapters; i < chapters.length; i++) {
          results.push({
            chapter_id: chapters[i].id,
            chapter_name: chapters[i].name,
            total: 0,
            upserted: 0,
            deactivated: 0,
            suspended: 0,
            skipped: true,
          });
          skippedChapters++;
        }
        break;
      }

      console.log(`[${processedChapters + 1}/${chapters.length}] ${chapter.name} 멤버 파싱 중...`);

      let chapterResult: ChapterSyncResult;

      try {
        const parsedMembers = await fetchChapterMembers(chapter.encoded_chapter_id);
        console.log(`  → ${parsedMembers.length}명 파싱됨`);

        chapterResult = await syncChapterMembers(supabase, chapter, parsedMembers, startTime);
        console.log(
          `  → upserted=${chapterResult.upserted}, deactivated=${chapterResult.deactivated}, suspended=${chapterResult.suspended}`
        );
      } catch (err: any) {
        console.error(`  → ${chapter.name} 처리 실패:`, err.message);
        chapterResult = {
          chapter_id: chapter.id,
          chapter_name: chapter.name,
          total: 0,
          upserted: 0,
          deactivated: 0,
          suspended: 0,
          skipped: false,
          error: err.message,
        };
      }

      results.push(chapterResult);
      totalUpserted += chapterResult.upserted;
      totalDeactivated += chapterResult.deactivated;
      totalSuspended += chapterResult.suspended;
      processedChapters++;

      // 챕터 간 요청 간격 (마지막 챕터 제외)
      if (processedChapters < chapters.length) {
        await new Promise((resolve) => setTimeout(resolve, CHAPTER_DELAY_MS));
      }
    }

    const totalElapsed = Date.now() - startTime;
    console.log(
      `동기화 완료: ${processedChapters}개 처리, ${totalElapsed}ms 소요`
    );

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total_chapters: chapters.length,
          processed_chapters: processedChapters,
          skipped_chapters: skippedChapters,
          total_upserted: totalUpserted,
          total_deactivated: totalDeactivated,
          total_suspended: totalSuspended,
          elapsed_ms: totalElapsed,
        },
        chapters: results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Edge Function 오류:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
