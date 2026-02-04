/**
 * Send Order Email Edge Function
 * Resend를 통한 주문 알림 이메일 발송
 * - 판매자에게 새 주문 알림
 * - 주문자에게 주문 확인 이메일
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

// Resend API로 이메일 발송
async function sendEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend Error:", errorData);
      return { success: false, error: errorData.message || "Resend API error" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Resend Request Error:", error);
    return { success: false, error: error.message };
  }
}

// 판매자용 이메일 템플릿
function getSellerEmailHtml(order: any, product: any, totalPrice: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Noto Sans KR', -apple-system, sans-serif; background-color: #FDF6ED; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #C41E3A, #a01830); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-box { background: #FDF6ED; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; }
    .info-value { font-weight: 600; color: #2D1B14; }
    .total { background: #C41E3A; color: white; padding: 15px 20px; border-radius: 12px; text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
    .footer { background: #2D1B14; color: #FDF6ED; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px;">🏮🧧</div>
      <h1>BNI 마포 설선물관</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">새로운 주문이 접수되었습니다!</p>
    </div>
    <div class="content">
      <h2 style="margin-top: 0; color: #2D1B14;">📦 주문 상품</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">상품명</span>
          <span class="info-value">${product.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">단가</span>
          <span class="info-value">${product.price.toLocaleString("ko-KR")}원</span>
        </div>
        <div class="info-row">
          <span class="info-label">수량</span>
          <span class="info-value">${order.quantity}개</span>
        </div>
      </div>

      <div class="total">총 금액: ${totalPrice}원</div>

      <h2 style="color: #2D1B14;">👤 주문자 정보</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">이름</span>
          <span class="info-value">${order.buyer_name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">이메일</span>
          <span class="info-value">${order.buyer_email || "-"}</span>
        </div>
        <div class="info-row">
          <span class="info-label">연락처</span>
          <span class="info-value">${order.buyer_phone}</span>
        </div>
        ${order.buyer_address ? `
        <div class="info-row">
          <span class="info-label">배송지</span>
          <span class="info-value">${order.buyer_address}</span>
        </div>
        ` : ""}
        ${order.message ? `
        <div class="info-row">
          <span class="info-label">요청사항</span>
          <span class="info-value">${order.message}</span>
        </div>
        ` : ""}
      </div>

      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        주문 일시: ${new Date(order.created_at).toLocaleString("ko-KR")}
      </p>
    </div>
    <div class="footer">
      이 주문은 BNI 마포 설선물관을 통해 접수되었습니다.<br>
      © 2026 BNI 마포 정보람 디렉터
    </div>
  </div>
</body>
</html>
  `;
}

// 주문자용 이메일 템플릿
function getBuyerEmailHtml(order: any, product: any, seller: any, totalPrice: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Noto Sans KR', -apple-system, sans-serif; background-color: #FDF6ED; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #C41E3A, #a01830); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .info-box { background: #FDF6ED; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #666; }
    .info-value { font-weight: 600; color: #2D1B14; }
    .total { background: #C41E3A; color: white; padding: 15px 20px; border-radius: 12px; text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
    .footer { background: #2D1B14; color: #FDF6ED; padding: 20px; text-align: center; font-size: 12px; }
    .notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 40px;">🏮✨</div>
      <h1>BNI 마포 설선물관</h1>
      <p style="margin: 10px 0 0; opacity: 0.9;">주문이 접수되었습니다!</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #2D1B14;">
        <strong>${order.buyer_name}</strong>님, 주문해주셔서 감사합니다! 🙏
      </p>

      <h2 style="color: #2D1B14;">📦 주문 내역</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">상품명</span>
          <span class="info-value">${product.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">수량</span>
          <span class="info-value">${order.quantity}개</span>
        </div>
        <div class="info-row">
          <span class="info-label">단가</span>
          <span class="info-value">${product.price.toLocaleString("ko-KR")}원</span>
        </div>
      </div>

      <div class="total">총 금액: ${totalPrice}원</div>

      <h2 style="color: #2D1B14;">🏪 판매자 정보</h2>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">판매자</span>
          <span class="info-value">${seller.name}</span>
        </div>
        ${seller.company ? `
        <div class="info-row">
          <span class="info-label">회사/브랜드</span>
          <span class="info-value">${seller.company}</span>
        </div>
        ` : ""}
      </div>

      <div class="notice">
        <strong>📌 안내사항</strong><br>
        판매자가 곧 연락드릴 예정입니다. 문의사항이 있으시면 판매자에게 직접 연락해주세요.
      </div>

      <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
        주문 일시: ${new Date(order.created_at).toLocaleString("ko-KR")}
      </p>
    </div>
    <div class="footer">
      BNI 마포 설선물관을 이용해주셔서 감사합니다.<br>
      © 2026 BNI 마포 정보람 디렉터
    </div>
  </div>
</body>
</html>
  `;
}

// @ts-ignore
serve(async (req: any) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // @ts-ignore
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    // @ts-ignore
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "BNI 마포 설선물관 <noreply@resend.dev>";

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Resend API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 주문 + 상품 + 판매자 정보 조회
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*, profiles(name, company, email))")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order fetch error:", orderError);
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const seller = order.products.profiles;
    const product = order.products;
    const totalPrice = (product.price * order.quantity).toLocaleString("ko-KR");

    let sellerEmailSent = false;
    let buyerEmailSent = false;

    // 1. 판매자에게 이메일 발송
    if (seller.email) {
      const sellerResult = await sendEmail(
        resendApiKey,
        fromEmail,
        seller.email,
        `[BNI 마포 설선물관] 새 주문 - ${product.name}`,
        getSellerEmailHtml(order, product, totalPrice)
      );
      sellerEmailSent = sellerResult.success;
      if (!sellerResult.success) {
        console.error("판매자 이메일 발송 실패:", sellerResult.error);
      }
    }

    // 2. 주문자에게 이메일 발송
    if (order.buyer_email) {
      const buyerResult = await sendEmail(
        resendApiKey,
        fromEmail,
        order.buyer_email,
        `[BNI 마포 설선물관] 주문 확인 - ${product.name}`,
        getBuyerEmailHtml(order, product, seller, totalPrice)
      );
      buyerEmailSent = buyerResult.success;
      if (!buyerResult.success) {
        console.error("주문자 이메일 발송 실패:", buyerResult.error);
      }
    }

    // 상태 업데이트
    const emailStatus = sellerEmailSent || buyerEmailSent ? "sent" : "failed";
    await supabase
      .from("orders")
      .update({
        email_status: emailStatus,
        email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", order_id);

    return new Response(
      JSON.stringify({
        success: sellerEmailSent || buyerEmailSent,
        sellerEmailSent,
        buyerEmailSent,
        order_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
