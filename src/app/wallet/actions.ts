'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function processRecharge(amount: number) {
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

    // 2. Add balance
    const newBalance = profile.wallet_balance + amount;

    const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: newBalance })
        .eq('id', user.id);

    if (updateError) {
        return { success: false, message: '충전 처리 중 오류가 발생했습니다.' };
    }

    revalidatePath('/wallet');
    revalidatePath('/mypage');
    revalidatePath('/');

    return { success: true, message: '충전 성공!', newBalance };
}
