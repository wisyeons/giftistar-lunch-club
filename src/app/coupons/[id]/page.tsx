"use client";

import { useAppStore } from "@/lib/store";
import { ArrowLeft, CheckCircle2, QrCode, Ticket } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CouponDetail() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const coupon = useAppStore((state) => state.coupons.find(c => c.id === id));
    const useCoupon = useAppStore((state) => state.useCoupon);

    const [scanStep, setScanStep] = useState<"idle" | "scanning" | "confirm_order" | "success">("idle");

    if (!coupon) return <div className="p-8 text-center text-slate-500 bg-slate-50 min-h-screen">쿠폰을 찾을 수 없습니다.</div>;

    const isUsed = coupon.status === 'Used';

    const handleScanStart = () => {
        if (isUsed) return;
        setScanStep("scanning");

        // Simulate quick "scan" and show popup
        setTimeout(() => {
            setScanStep("confirm_order");
        }, 600); // reduced time since they don't actually scan
    };

    const handleConfirmOrder = () => {
        useCoupon(coupon.id);
        setScanStep("success");

        setTimeout(() => {
            setScanStep("idle");
        }, 3000);
    };

    const handleCancelOrder = () => {
        setScanStep("idle");
    };

    const mainItem = coupon.items[0];
    const otherItemsCount = coupon.items.length - 1;
    const displayMenuName = mainItem ? `${mainItem.menuName}${otherItemsCount > 0 ? ` 외 ${otherItemsCount}건` : ''}` : '';

    return (
        <main className="flex-1 flex flex-col pt-8 pb-10 px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-100">
            {/* Header */}
            <header className="flex flex-col items-center mb-8 relative z-10 text-center mt-4">
                <button onClick={() => router.back()} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">쿠폰 티켓</span>
            </header>

            {/* Main Ticket Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`relative w-full rounded-3xl overflow-hidden border p-8 flex flex-col items-center text-center transition-all duration-500 shadow-2xl
          ${isUsed || scanStep === 'success'
                        ? 'bg-white border-slate-200 grayscale opacity-70'
                        : 'bg-white border-orange-100'}`}
            >
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-100 rounded-full -translate-y-1/2 shadow-inner" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-100 rounded-full -translate-y-1/2 shadow-inner" />

                {!isUsed && scanStep !== 'success' && (
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />
                )}

                <p className={`text-sm font-bold mb-2 tracking-wide text-orange-500`}>
                    {coupon.restaurantName}
                </p>
                <h1 className="text-3xl font-black mb-1 leading-tight tracking-tight text-slate-900">{displayMenuName}</h1>

                <div className="flex flex-col gap-1 w-full my-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {coupon.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm items-center">
                            <span className="text-slate-700 font-medium">{item.menuName}</span>
                            <span className="font-bold text-slate-900">x{item.quantity}</span>
                        </div>
                    ))}
                </div>

                <div className={`w-full border-t-2 border-dashed border-slate-200 mb-8`} />

                {isUsed || scanStep === 'success' ? (
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="font-extrabold text-xl text-slate-500 mb-1 uppercase tracking-widest">사용 완료</p>
                        <p className="text-xs text-slate-400 font-mono mt-2">{coupon.id}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <p className="text-sm font-medium text-slate-500 mb-5">매장에 방문해 QR 스캔 버튼을 눌러주세요</p>

                        <button
                            onClick={handleScanStart}
                            disabled={scanStep !== "idle"}
                            className={`w-full relative py-4 rounded-2xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden ${scanStep !== "idle" ? 'bg-slate-200 text-slate-500' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30 shadow-lg'
                                }`}
                        >
                            {scanStep === "scanning" && (
                                <motion.div
                                    initial={{ top: '-10%' }}
                                    animate={{ top: '110%' }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                    className="absolute left-0 right-0 h-1.5 bg-white/40 z-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                                />
                            )}

                            {scanStep === "scanning" ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-20" />
                            ) : (
                                <>
                                    <QrCode className="w-5 h-5 relative z-20" />
                                    <span className="relative z-20">QR 스캔하기</span>
                                </>
                            )}
                        </button>

                        <p className="mt-6 text-xs text-slate-400 font-mono tracking-widest font-medium">{coupon.id}</p>
                    </div>
                )}
            </motion.div>

            {/* Confirmation Step 1: "메뉴를 주문하시겠어요?" */}
            <AnimatePresence>
                {scanStep === "confirm_order" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-center items-end bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-6"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl pb-10 sm:pb-6"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
                                    <Ticket className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">해당 메뉴를 주문하시겠어요?</h3>

                                <div className="my-4 w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                                    {coupon.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm mb-2 last:mb-0">
                                            <span className="text-slate-700 font-medium">{item.menuName}</span>
                                            <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded text-xs shadow-sm">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm font-bold text-rose-500 mb-6 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100 shadow-sm w-full text-center">
                                    ⚠️ 주문 후에는 취소할 수 없습니다.
                                </p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={handleCancelOrder}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Step 2: "주문 완료 성공 모달" */}
            <AnimatePresence>
                {scanStep === "success" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex flex-col justify-center items-center bg-white/90 backdrop-blur-md px-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(249,115,22,0.4)]">
                                <CheckCircle2 className="w-16 h-16 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">주문 완료!</h2>
                            <p className="text-orange-600 font-bold text-xl mb-8">
                                {displayMenuName}
                            </p>

                            <p className="text-slate-500 text-sm font-medium">직원이 음식을 준비하고 있습니다.</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </main>
    );
}
