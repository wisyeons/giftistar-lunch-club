import { getRestaurants } from "@/lib/supabase/queries";
import { Wallet, Ticket, Utensils, ChevronRight, MapPin, Clock, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Page must be fully dynamic to grab fresh session
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get wallet balance from DB if logged in, else fallback to 50000
  let walletBalance = 50000;
  if (user) {
    const { data: profile } = await supabase.from('users').select('wallet_balance').eq('id', user.id).single();
    if (profile && profile.wallet_balance !== null) {
      walletBalance = profile.wallet_balance;
    }
  }

  // Get real restaurants from Supabase
  const restaurants = await getRestaurants();

  return (
    <main className="flex-1 flex flex-col pt-8 pb-10 px-6 max-w-md mx-auto w-full relative min-h-screen">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black tracking-tight text-orange-600">기프티런치클럽</h1>
        <div className="flex items-center gap-3">
          <Link href="/wallet" className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full shadow-sm hover:bg-orange-100 transition-colors cursor-pointer">
            <Wallet className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm text-orange-800">
              {walletBalance.toLocaleString()} <span className="text-orange-600/70 font-normal">원</span>
            </span>
          </Link>
          <Link href="/mypage" className="p-2.5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
            <User className="w-5 h-5 text-slate-700" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] p-8 mb-8 relative overflow-hidden text-center shadow-xl shadow-orange-500/20 hover:shadow-2xl transition-shadow duration-300">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-20" />
        <div className="relative z-10 flex flex-col items-center">
          <Utensils className="w-8 h-8 text-white mb-4" />
          <h2 className="text-white text-2xl font-black mb-2 tracking-tight">기프티 런치클럽 패스</h2>
          <p className="text-orange-50 font-medium text-sm">내 주변 맛집에서 최대 20% 할인받아 식사해보세요.</p>
        </div>
      </div>

      <h2 className="font-bold text-lg mb-4 text-slate-800 px-1">역삼역 주변 {restaurants.length}곳 맛집 모아보기</h2>

      {/* Restaurant List */}
      <div className="space-y-4">
        {restaurants.map((restaurant: any) => (
          <Link href={`/restaurant/${restaurant.id}`} key={restaurant.id}>
            <div className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-orange-300 transition-all shadow-sm hover:shadow-md cursor-pointer group active:scale-[0.98] mb-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    {restaurant.image}
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="font-black text-lg text-slate-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors">{restaurant.name}</h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">{restaurant.description}</p>
                    <span className="inline-block mt-1 text-orange-600 font-black bg-orange-50 px-2.5 py-1 text-xs rounded-lg border border-orange-200">
                      {restaurant.discount_rate}% 할인
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{restaurant.open_time}</span>
                </div>
              </div>

              {/* Sample Menu Items Summary */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between group-hover:bg-slate-50 -mx-5 -mb-5 px-5 py-4 rounded-b-3xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">메뉴 보러가기</span>
                </div>
                <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:shadow-md transition-shadow group-hover:text-orange-500 border border-slate-100">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}
        {restaurants.length === 0 && (
          <div className="text-center text-slate-500 p-8 border border-dashed rounded-2xl bg-slate-50">
            등록된 식당이 없습니다.
          </div>
        )}
      </div>

      {/* Bottom Nav Placeholder (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-8 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <Link href="/" className="flex flex-col items-center gap-1 text-orange-500">
          <Utensils className="w-6 h-6" />
          <span className="text-[10px] font-bold">홈</span>
        </Link>
        <Link href="/coupons" className="flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors">
          <Ticket className="w-6 h-6" />
          <span className="text-[10px] font-medium">내 쿠폰</span>
        </Link>
      </div>
    </main>
  );
}
