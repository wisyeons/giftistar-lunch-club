import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import WalletClient from "./WalletClient";

export const dynamic = 'force-dynamic';

export default async function WalletPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?message=지갑을 보려면 로그인이 필요합니다.');
    }

    const { data: profile } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

    const walletBalance = profile?.wallet_balance ?? 50000;

    return (
        <main className="flex-1 flex flex-col pt-8 pb-10 px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-50">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">내 지갑</h1>
                </div>
            </header>

            <WalletClient initialBalance={walletBalance} />
        </main>
    );
}
