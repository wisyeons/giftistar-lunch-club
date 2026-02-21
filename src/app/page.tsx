"use client";

import { useAppStore } from "@/lib/store";
import { MOCK_RESTAURANTS } from "@/lib/mockData";
import { Wallet, Ticket, Utensils, ChevronRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const walletBalance = useAppStore((state) => state.walletBalance);

  return (
    <main className="flex-1 flex flex-col pt-8 pb-24 px-6 relative bg-white min-h-screen">
      {/* Header & Wallet */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-2xl font-black tracking-tight text-orange-600">기프티런치클럽</h1>
        <Link href="/wallet" className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full shadow-sm hover:bg-orange-100 transition-colors cursor-pointer">
          <Wallet className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm text-orange-800">
            {walletBalance.toLocaleString()} <span className="text-orange-600/70 font-normal">원</span>
          </span>
        </Link>
      </motion.header>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-orange-500 to-orange-400 text-white p-6 rounded-3xl mb-10 shadow-lg shadow-orange-500/20 relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <h2 className="text-xl font-bold mb-2 relative z-10">런치 클럽 패스</h2>
        <p className="text-orange-50 text-sm relative z-10 font-medium">내 주변 맛집에서 최대 20% 할인받아 식사해보세요.</p>
      </motion.div>

      {/* Restaurant List */}
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <Utensils className="w-5 h-5 text-orange-500" />
        역삼역 주변 {MOCK_RESTAURANTS.length}곳 맛집 모아보기
      </h3>

      <div className="space-y-4">
        {MOCK_RESTAURANTS.map((restaurant, idx) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            <Link href={`/restaurant/${restaurant.id}`}>
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer flex flex-col hover:border-orange-300 hover:shadow-md">

                {/* Header: Name and Image */}
                <div className="flex gap-4 items-start mb-4">
                  <div className="text-5xl bg-orange-50 rounded-2xl w-20 h-20 flex items-center justify-center border border-orange-100 flex-shrink-0">
                    {restaurant.image}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">{restaurant.name}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{restaurant.description}</p>
                  </div>
                </div>

                {/* Sub info: Address and Time */}
                <div className="space-y-1.5 mb-5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{restaurant.openTime}</span>
                  </div>
                </div>

                {/* Footer: Discount and Tickets */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-orange-600 font-bold bg-orange-50 px-3 py-1.5 text-sm rounded-lg border border-orange-200 shadow-sm">
                      {restaurant.discountRate}% 할인
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
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
