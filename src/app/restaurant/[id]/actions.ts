'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processCheckout(restaurantId: string, restaurantName: string, cartItems: any[], totalCost: number) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    // 1. Get current user balance
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { success: false, message: '유저 정보를 불러올 수 없습니다.' };
    }

    if (profile.wallet_balance < totalCost) {
        return { success: false, message: '잔액이 부족합니다.' };
    }

    // 2. Generate new coupon
    const couponId = `CUP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 3. Deduct balance & insert coupon & items via discrete calls (Supabase doesn't easily support multi-table transactions without custom RPCs, so we do it sequentially here for MVP)

    // Deduct balance
    const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: profile.wallet_balance - totalCost })
        .eq('id', user.id);

    if (updateError) {
        return { success: false, message: '결제 처리 중 오류가 발생했습니다.' };
    }

    // Insert coupon
    const { error: couponError } = await supabase
        .from('coupons')
        .insert({
            id: couponId,
            user_id: user.id,
            restaurant_id: restaurantId,
            restaurant_name: restaurantName,
            status: 'Unused',
            total_price: totalCost,
            expiration_date: expirationDate
        });

    if (couponError) {
        // Ideally revert balance here in a real production system
        return { success: false, message: '쿠폰 생성 중 오류가 발생했습니다.' };
    }

    // Insert coupon items
    const itemsToInsert = cartItems.map(item => ({
        coupon_id: couponId,
        menu_id: item.menuId,
        menu_name: item.menuName,
        price: item.price,
        quantity: item.quantity,
        options: item.options.length > 0 ? item.options : null
    }));

    const { error: itemsError } = await supabase
        .from('coupon_items')
        .insert(itemsToInsert);

    if (itemsError) {
        console.error('Coupon items insert error', itemsError);
        return { success: false, message: '쿠폰 항목 저장 중 오류가 발생했습니다.' };
    }

    revalidatePath('/coupons');
    revalidatePath('/mypage');
    revalidatePath('/wallet');

    return { success: true, message: '결제 성공!' };
}
