"use client";

import { useAppStore } from "@/lib/store";
import { Ticket, Utensils, QrCode } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyCoupons() {
    const coupons = useAppStore((state) => state.coupons);

    const unusedCoupons = coupons.filter(c => c.status === 'Unused');
    const usedCoupons = coupons.filter(c => c.status === 'Used');

    return (
        <main className="flex-1 flex flex-col pt-8 pb-24 px-6 bg-white min-h-screen">
            <header className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">내 쿠폰함</h1>
                <p className="text-slate-500 text-sm font-medium">사용 가능한 쿠폰이 <span className="text-orange-500 font-bold">{unusedCoupons.length}개</span> 있습니다.</p>
            </header>

            {coupons.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                    <Ticket className="w-16 h-16 mb-4 text-slate-300" />
                    <p className="text-slate-600 font-medium">보유한 쿠폰이 없습니다.</p>
                    <p className="text-sm text-slate-400 mt-1">홈 화면에서 맛있는 식사를 할인받아 구매해보세요.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Unused Section */}
                    {unusedCoupons.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-orange-500 mb-4 uppercase tracking-widest pl-1">사용 가능한 쿠폰</h2>
                            <div className="space-y-4">
                                {unusedCoupons.map((coupon, idx) => (
                                    <motion.div
                                        key={coupon.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <Link href={`/coupons/${coupon.id}`}>
                                            <div className="relative bg-orange-50/50 border border-orange-200 rounded-2xl p-5 overflow-hidden flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm">
                                                {/* Decorative Circle */}
                                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-200/50 rounded-full blur-2xl group-hover:bg-orange-300/50 transition-all" />

                                                <div className="relative z-10">
                                                    <p className="text-xs text-orange-600 font-medium mb-1">{coupon.restaurantName}</p>
                                                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                                                        {coupon.items[0]?.menuName}
                                                        {coupon.items.length > 1 && ` 외 ${coupon.items.length - 1}건`}
                                                    </h3>
                                                    <div className="inline-block px-2 py-1 bg-white border border-orange-100 rounded text-[10px] font-mono text-slate-500 font-medium shadow-sm">
                                                        {coupon.id}
                                                    </div>
                                                </div>

                                                <div className="relative z-10 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
                                                    <QrCode className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Used Section */}
                    {usedCoupons.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest pl-1">사용 완료 쿠폰</h2>
                            <div className="space-y-3">
                                {usedCoupons.map((coupon, idx) => (
                                    <motion.div
                                        key={coupon.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between grayscale opacity-80"
                                    >
                                        <div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium mb-0.5">{coupon.restaurantName}</p>
                                                <h3 className="font-bold text-sm text-slate-700">
                                                    {coupon.items[0]?.menuName}
                                                    {coupon.items.length > 1 && ` 외 ${coupon.items.length - 1}건`}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black tracking-wider text-slate-400 bg-slate-200 px-2 py-1 rounded">사용됨</span>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Bottom Nav Placeholder (Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-8 flex justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-orange-500 transition-colors">
                    <Utensils className="w-6 h-6" />
                    <span className="text-[10px] font-medium">홈</span>
                </Link>
                <Link href="/coupons" className="flex flex-col items-center gap-1 text-orange-500">
                    <Ticket className="w-6 h-6" />
                    <span className="text-[10px] font-bold">내 쿠폰</span>
                </Link>
            </div>
        </main>
    );
}
