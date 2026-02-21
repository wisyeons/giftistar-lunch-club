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
        .maybeSingle();

    if (profileError || !profile) {
        return { success: false, message: '서버에 유저 프로필이 없습니다. 새 계정으로 가입하거나 관리자 문의(update_data.sql 실행 필요)가 필요합니다.' };
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
