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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FDF6ED; margin: 0; padding: 20px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Header -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #C41E3A, #a01830); border-radius: 16px 16px 0 0;">
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="font-size: 40px; line-height: 1;">🏢📋</div>
              <h1 style="margin: 10px 0 0; font-size: 24px; color: white;">BNI 마포홍보관</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">새로운 주문이 접수되었습니다!</p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white;">
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 15px; color: #2D1B14; font-size: 18px;">📦 주문 상품</h2>

              <!-- Product Info Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FDF6ED; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">상품명</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${product.name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">단가</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${product.price.toLocaleString("ko-KR")}원</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">수량</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.quantity}개</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #C41E3A; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
                    총 금액: ${totalPrice}원
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 15px; color: #2D1B14; font-size: 18px;">👤 주문자 정보</h2>

              <!-- Buyer Info Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FDF6ED; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">이름</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.buyer_name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">이메일</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.buyer_email || "-"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;${order.buyer_address || order.message ? ' border-bottom: 1px solid #eee;' : ''}">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">연락처</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.buyer_phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${order.buyer_address ? `
                <tr>
                  <td style="padding: 15px 20px;${order.message ? ' border-bottom: 1px solid #eee;' : ''}">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">배송지</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.buyer_address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
                ${order.message ? `
                <tr>
                  <td style="padding: 15px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">요청사항</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.message}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
              </table>

              <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0;">
                주문 일시: ${new Date(order.created_at).toLocaleString("ko-KR")}
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #2D1B14; border-radius: 0 0 16px 16px;">
          <tr>
            <td style="padding: 20px; text-align: center; color: #FDF6ED; font-size: 12px;">
              이 주문은 BNI 마포홍보관을 통해 접수되었습니다.<br>
              © 2026 BNI 마포 정보람 디렉터
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FDF6ED; margin: 0; padding: 20px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        <!-- Header -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: linear-gradient(135deg, #C41E3A, #a01830); border-radius: 16px 16px 0 0;">
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="font-size: 40px; line-height: 1;">🏢✨</div>
              <h1 style="margin: 10px 0 0; font-size: 24px; color: white;">BNI 마포홍보관</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">주문이 접수되었습니다!</p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: white;">
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 16px; color: #2D1B14; margin: 0 0 20px;">
                <strong>${order.buyer_name}</strong>님, 주문해주셔서 감사합니다! 🙏
              </p>

              <h2 style="margin: 0 0 15px; color: #2D1B14; font-size: 18px;">📦 주문 내역</h2>

              <!-- Order Info Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FDF6ED; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">상품명</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${product.name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">수량</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${order.quantity}개</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">단가</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${product.price.toLocaleString("ko-KR")}원</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Total -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #C41E3A; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px 20px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
                    총 금액: ${totalPrice}원
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 15px; color: #2D1B14; font-size: 18px;">🏪 판매자 정보</h2>

              <!-- Seller Info Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #FDF6ED; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">판매자</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${seller.name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${seller.company ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">회사/브랜드</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${seller.company}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
                ${seller.email ? `
                <tr>
                  <td style="padding: 15px 20px; border-bottom: 1px solid #eee;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">이메일</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${seller.email}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
                ${seller.phone ? `
                <tr>
                  <td style="padding: 15px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #666; font-size: 14px;">연락처</td>
                        <td style="text-align: right; font-weight: 600; color: #2D1B14;">${seller.phone}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}
              </table>

              <!-- Notice -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px;">
                    <strong style="color: #856404;">📌 안내사항</strong><br>
                    <span style="color: #856404; font-size: 14px;">판매자가 곧 연락드릴 예정입니다. 문의사항이 있으시면 판매자에게 직접 연락해주세요.</span>
                  </td>
                </tr>
              </table>

              <p style="color: #666; font-size: 14px; text-align: center; margin: 20px 0 0;">
                주문 일시: ${new Date(order.created_at).toLocaleString("ko-KR")}
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #2D1B14; border-radius: 0 0 16px 16px;">
          <tr>
            <td style="padding: 20px; text-align: center; color: #FDF6ED; font-size: 12px;">
              BNI 마포홍보관을 이용해주셔서 감사합니다.<br>
              © 2026 BNI 마포 정보람 디렉터
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
    const fromEmail = "BNI 마포홍보관 <onboarding@resend.dev>";

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
      .select("*, products(*, profiles(name, company, email, phone))")
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
        `[BNI 마포홍보관] 새 주문 - ${product.name}`,
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
        `[BNI 마포홍보관] 주문 확인 - ${product.name}`,
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
