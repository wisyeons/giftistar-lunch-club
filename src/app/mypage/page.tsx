import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Wallet, Ticket, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';

export default async function MyPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Fetch extra user details from public.users table (like wallet_balance, role)
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    const balance = profile?.wallet_balance || 0;
    const role = profile?.role || 'user';

    return (
        <main className="flex-1 flex flex-col pt-8 pb-32 px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-50">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">내 정보</h1>
            </header>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 mb-1">가입된 이메일</p>
                    <p className="text-lg font-bold text-slate-900 truncate">{user.email}</p>
                    {role === 'admin' && (
                        <span className="inline-block mt-2 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            관리자
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Link href="/wallet" className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl text-white shadow-lg active:scale-95 transition-transform flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                    <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-orange-400" />
                        <span className="text-sm text-slate-300 font-medium">내 지갑</span>
                    </div>
                    <div className="text-xl font-black tracking-tight mt-auto">{balance.toLocaleString()} <span className="text-sm font-normal text-slate-400">원</span></div>
                </Link>
                <Link href="/coupons" className="bg-white border border-slate-200 p-5 rounded-3xl text-slate-800 shadow-sm active:scale-95 transition-transform flex flex-col justify-between h-32 hover:border-orange-200 hover:bg-orange-50/30">
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-slate-500 font-medium">내 쿠폰함</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xl font-black tracking-tight text-slate-900">보러가기</span>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                </Link>
            </div>
            {/* Menu List */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 mb-8 shadow-sm">
                {role === 'admin' && (
                    <Link href="/admin" className="flex items-center justify-between p-5 border-b border-slate-100 active:bg-slate-50 transition-colors">
                        <span className="font-bold text-purple-600">관리자 대시보드</span>
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                    </Link>
                )}
                <form action={logout}>
                    <button type="submit" className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-rose-500" />
                            <span className="font-bold text-slate-700">로그아웃</span>
                        </div>
                    </button>
                </form>
            </div>

        </main>
    );
}
