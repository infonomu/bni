/**
 * Update Chapters Edge Function
 * BNI 마포 챕터 정보를 BNI 웹사이트에서 스크래핑하여 chapters 테이블에 upsert
 *
 * Authorization: Bearer {UPDATE_CHAPTERS_SECRET} 헤더 필요
 *
 * 환경변수:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   UPDATE_CHAPTERS_SECRET - 이 함수 호출 인증 시크릿
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

// 챕터 영문명 → 한글명 매핑
const CHAPTER_KR_NAME_MAP: Record<string, string> = {
  "Nice": "나이스",
  "Max": "맥스",
  "Present": "프레즌트",
  "Attitude": "애티튜드",
  "Matrix": "매트릭스",
  "Unicorn": "유니콘",
  "Topclass": "탑클래스",
  "Zeus": "제우스",
  "K": "케이",
  "TITAN": "타이탄",
  "Stoneworks": "스톤웍스",
};

// 마포 챕터 영문명 목록
const MAPO_CHAPTER_NAMES = new Set(Object.keys(CHAPTER_KR_NAME_MAP));

interface ChapterUpsert {
  name: string;
  name_ko: string;
  meeting_day: string;
  meeting_time: string;
  meeting_location: string;
  member_count: number;
  meeting_type: string;
  bni_url: string;
  org_id: string;
  encoded_chapter_id: string;
}

// BNI bnimapo.com 사이트에서 챕터 목록 조회
async function fetchChaptersFromMapoSite(): Promise<ChapterUpsert[]> {
  const MAPO_API_URL = "http://bnimapo.com/ko/chapterlist";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9",
    "Referer": "http://bnimapo.com/",
  };

  const response = await fetch(MAPO_API_URL, { headers });

  if (!response.ok) {
    throw new Error(`마포사이트 요청 실패: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("마포사이트에서 JSON 응답을 받지 못했습니다");
  }

  const data = await response.json();
  const rawChapters: any[] = Array.isArray(data) ? data : (data.chapters ?? data.data ?? []);

  const results: ChapterUpsert[] = [];

  for (const raw of rawChapters) {
    const nameEn: string = raw.name ?? "";
    if (!MAPO_CHAPTER_NAMES.has(nameEn)) continue;

    const rawType: string = raw.meetingType ?? "IN_PERSON";
    const meetingType = ["IN_PERSON", "PERM_HYBRID", "PERM_ONLINE"].includes(rawType)
      ? rawType
      : "IN_PERSON";

    results.push({
      name: nameEn,
      name_ko: CHAPTER_KR_NAME_MAP[nameEn] ?? nameEn,
      meeting_day: raw.meetingDay ?? "",
      meeting_time: raw.meetingTime ?? "",
      meeting_location: raw.locationName ?? "",
      member_count: raw.totalMemberCount ?? 0,
      meeting_type: meetingType,
      bni_url: raw.chapterDetailUrl ?? "",
      org_id: String(raw.orgId ?? ""),
      encoded_chapter_id: raw.encodedChapterId ?? "",
    });
  }

  return results;
}

// BNI Korea 공식 API에서 챕터 목록 조회 (fallback)
async function fetchChaptersFromBniApi(): Promise<ChapterUpsert[]> {
  const BNI_API_URL = "https://www.bnikorea.com/api/v1/chapters";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Referer": "https://www.bnikorea.com/",
  };

  const response = await fetch(`${BNI_API_URL}?status=ACTIVE`, { headers });

  if (!response.ok) {
    throw new Error(`BNI API 요청 실패: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawChapters: any[] = Array.isArray(data) ? data : (data.chapters ?? []);

  const results: ChapterUpsert[] = [];

  for (const raw of rawChapters) {
    const nameEn: string = raw.name ?? raw.chapterName ?? "";
    if (!MAPO_CHAPTER_NAMES.has(nameEn)) continue;

    const rawType: string = raw.meetingType ?? "IN_PERSON";
    const meetingType = ["IN_PERSON", "PERM_HYBRID", "PERM_ONLINE"].includes(rawType)
      ? rawType
      : "IN_PERSON";

    results.push({
      name: nameEn,
      name_ko: CHAPTER_KR_NAME_MAP[nameEn] ?? nameEn,
      meeting_day: raw.meetingDay ?? "",
      meeting_time: raw.meetingTime ?? "",
      meeting_location: raw.locationName ?? "",
      member_count: raw.totalMemberCount ?? 0,
      meeting_type: meetingType,
      bni_url: raw.chapterDetailUrl ?? "",
      org_id: String(raw.orgId ?? ""),
      encoded_chapter_id: raw.encodedChapterId ?? "",
    });
  }

  return results;
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

    // Authorization 헤더 검증
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!expectedSecret || token !== expectedSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "인증 실패: 유효하지 않은 시크릿" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 마포사이트 1차 시도 → 실패 시 BNI Korea API fallback
    let chapters: ChapterUpsert[] = [];
    let dataSource = "mapo_site";

    try {
      chapters = await fetchChaptersFromMapoSite();
      console.log(`마포사이트에서 ${chapters.length}개 챕터 조회 성공`);
    } catch (mapoError: any) {
      console.warn("마포사이트 조회 실패, BNI Korea API로 fallback:", mapoError.message);
      dataSource = "bni_api";

      // 요청 간격 조절 (500ms 대기)
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        chapters = await fetchChaptersFromBniApi();
        console.log(`BNI Korea API에서 ${chapters.length}개 챕터 조회 성공`);
      } catch (bniError: any) {
        console.error("BNI Korea API도 조회 실패:", bniError.message);
        return new Response(
          JSON.stringify({
            success: false,
            error: `챕터 데이터 조회 실패: ${bniError.message}`,
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (chapters.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "업데이트할 챕터 데이터가 없습니다" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // chapters 테이블에 name 기준으로 업데이트 (uuid PK이므로 name으로 조회 후 update/insert)
    let updatedCount = 0;
    const updatedNames: string[] = [];

    for (const chapter of chapters) {
      const { data: existing } = await supabase
        .from("chapters")
        .select("id")
        .eq("name", chapter.name)
        .single();

      if (existing) {
        // 기존 챕터 업데이트
        const { error } = await supabase
          .from("chapters")
          .update({
            name_ko: chapter.name_ko,
            meeting_day: chapter.meeting_day,
            meeting_time: chapter.meeting_time,
            meeting_location: chapter.meeting_location,
            member_count: chapter.member_count,
            meeting_type: chapter.meeting_type,
            bni_url: chapter.bni_url,
            org_id: chapter.org_id,
            encoded_chapter_id: chapter.encoded_chapter_id,
          })
          .eq("id", existing.id);

        if (error) {
          console.error(`챕터 업데이트 실패 (${chapter.name}):`, error);
        } else {
          updatedCount++;
          updatedNames.push(chapter.name);
        }
      } else {
        // 신규 챕터 INSERT
        const { error } = await supabase
          .from("chapters")
          .insert(chapter);

        if (error) {
          console.error(`챕터 INSERT 실패 (${chapter.name}):`, error);
        } else {
          updatedCount++;
          updatedNames.push(chapter.name);
        }
      }
    }

    console.log(`${updatedCount}개 챕터 업데이트 완료`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        chapters: updatedNames,
        source: dataSource,
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
