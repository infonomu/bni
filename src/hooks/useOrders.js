import { supabase } from '../lib/supabase';

export const useOrders = () => {
  const createOrder = async (orderData) => {
    // 주문 생성
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Edge Function 호출하여 이메일 발송 (백그라운드로 처리, 주문 완료를 블로킹하지 않음)
    supabase.functions.invoke('send-order-email', {
      body: { order_id: order.id },
    }).then(({ data, error }) => {
      if (error) {
        console.error('이메일 발송 에러:', error);
      } else {
        console.log('이메일 발송 완료:', data);
      }
    }).catch((e) => {
      console.error('이메일 함수 호출 에러:', e);
    });

    return order;
  };

  const getMyOrders = async (buyerId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(name, price, images)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const getSellerOrders = async (sellerId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products!inner(name, price, seller_id)')
      .eq('products.seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    createOrder,
    getMyOrders,
    getSellerOrders,
  };
};
