'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function useCouponAction(couponId: string) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, message: '로그인이 필요합니다.' };
    }

    // Update coupon status to Used
    const { error } = await supabase
        .from('coupons')
        .update({ status: 'Used' })
        .eq('id', couponId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Coupon update error', error);
        return { success: false, message: '쿠폰 사용 처리 중 오류가 발생했습니다.' };
    }

    revalidatePath('/coupons');
    revalidatePath(`/coupons/${couponId}`);

    return { success: true, message: '쿠폰을 사용했습니다.' };
}
