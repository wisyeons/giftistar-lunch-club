"use client";

import { CheckCircle2, QrCode, Ticket, Home } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCouponAction } from "./actions";

export default function CouponDetailClient({ initialCoupon }: { initialCoupon: any }) {
    const [coupon, setCoupon] = useState(initialCoupon);
    const [scanStep, setScanStep] = useState<"idle" | "confirm_order" | "success">("idle");
    const [isProcessing, setIsProcessing] = useState(false);

    const isUsed = coupon.status === 'Used';

    const handleScanStart = () => {
        if (isUsed) return;
        setScanStep("confirm_order");
    };

    const handleConfirmOrder = async () => {
        setIsProcessing(true);
        const result = await useCouponAction(coupon.id);
        setIsProcessing(false);

        if (result.success) {
            setCoupon({ ...coupon, status: 'Used' });
            setScanStep("success");
        } else {
            alert(result.message || "오류가 발생했습니다.");
            setScanStep("idle");
        }
    };

    const handleCancelOrder = () => {
        setScanStep("idle");
    };

    const mainItem = coupon.items[0];
    const otherItemsCount = coupon.items.length - 1;
    const displayMenuName = mainItem ? `${mainItem.menuName}${otherItemsCount > 0 ? ` 외 ${otherItemsCount}건` : ''}` : '';

    return (
        <>
            {/* Main Ticket Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`relative w-full rounded-3xl overflow-hidden border p-8 flex flex-col items-center text-center transition-all duration-500 shadow-2xl mt-12
          ${isUsed
                        ? 'bg-white border-slate-200 grayscale opacity-70'
                        : 'bg-white border-orange-100'}`}
            >
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-slate-100 rounded-full -translate-y-1/2 shadow-inner" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-slate-100 rounded-full -translate-y-1/2 shadow-inner" />

                {!isUsed && (
                    <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />
                )}

                <p className={`text-sm font-bold mb-2 tracking-wide text-orange-500`}>
                    {coupon.restaurantName}
                </p>
                <h1 className="text-2xl font-black mb-1 leading-tight tracking-tight text-slate-900">{displayMenuName}</h1>

                <div className="flex flex-col gap-2 w-full my-6 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-48 overflow-y-auto w-full text-left">
                    {coupon.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col text-sm border-b border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                            <div className="flex justify-between items-start font-medium">
                                <span className="text-slate-800">{item.menuName}</span>
                                <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded text-xs shadow-sm ml-2">x{item.quantity}</span>
                            </div>
                            {item.options?.length > 0 && (
                                <div className="text-[11px] text-slate-500 mt-1 pl-2 border-l border-slate-300 space-y-0.5">
                                    {item.options.map((opt: any, i: number) => (
                                        <p key={i}>- {opt.choiceName}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={`w-full border-t-2 border-dashed border-slate-200 mb-8`} />

                {isUsed ? (
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
                            className={`w-full relative py-4 rounded-2xl font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30 shadow-lg`}
                        >
                            <QrCode className="w-5 h-5 relative z-20" />
                            <span className="relative z-20">QR 스캔하기</span>
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
                            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl pb-10 sm:pb-6 max-h-[90vh] flex flex-col"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden flex-shrink-0" />

                            <div className="flex flex-col items-center text-center overflow-hidden flex-1">
                                <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
                                    <Ticket className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex-shrink-0">주문 내역을 확인해주세요</h3>
                                <p className="text-sm text-slate-500 mb-4 flex-shrink-0">선택하신 메뉴와 옵션이 맞는지 확인해주세요.</p>

                                <div className="my-4 w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left overflow-y-auto">
                                    {coupon.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex flex-col text-sm border-b border-slate-200 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-slate-800 font-bold">{item.menuName}</span>
                                                <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded text-xs shadow-sm ml-2 flex-shrink-0">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            {item.options?.length > 0 && (
                                                <div className="text-xs text-slate-500 mt-1.5 pl-2 border-l-2 border-slate-300 space-y-0.5">
                                                    {item.options.map((opt: any, i: number) => (
                                                        <p key={i}>- {opt.choiceName}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-sm font-bold text-rose-500 mt-2 mb-6 bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 shadow-sm w-full text-center flex-shrink-0">
                                    ⚠️ 주문 후에는 취소할 수 없습니다.
                                </p>

                                <div className="flex gap-3 w-full flex-shrink-0">
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={isProcessing}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={isProcessing}
                                        className="flex-[2] py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isProcessing ? "처리 중..." : "확인"}
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
                        className="fixed inset-0 z-[60] flex flex-col justify-center items-center bg-white/95 backdrop-blur-md px-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="flex flex-col items-center w-full max-w-sm"
                        >
                            <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-[0_20px_50px_rgba(249,115,22,0.4)]">
                                <CheckCircle2 className="w-16 h-16 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">주문 접수 완료!</h2>
                            <p className="text-orange-600 font-bold text-xl mb-4 w-full px-4 break-words">
                                {displayMenuName}
                            </p>

                            <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mb-6 max-h-[30vh] overflow-y-auto">
                                {coupon.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex flex-col text-sm border-b border-slate-200 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                                        <div className="flex justify-between items-start">
                                            <span className="text-slate-800 font-bold">{item.menuName}</span>
                                            <span className="font-bold text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded text-xs shadow-sm ml-2 flex-shrink-0">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        {item.options?.length > 0 && (
                                            <div className="text-xs text-slate-500 mt-1.5 pl-2 border-l-2 border-slate-300 space-y-0.5">
                                                {item.options.map((opt: any, i: number) => (
                                                    <p key={i}>- {opt.choiceName}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="text-rose-500 font-bold text-sm bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl mb-6 shadow-sm w-full text-center flex-shrink-0">
                                이 화면을 매장 직원에게 보여주세요 🤔
                            </p>

                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full mb-8 space-y-2">
                                <p className="text-slate-600 font-medium">매장에서 메뉴를 준비 중입니다.</p>
                                <p className="text-sm text-slate-400">조금만 기다려 주시면 맛있는 식사가 제공됩니다.</p>
                            </div>

                            <Link
                                href="/"
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <Home className="w-5 h-5" />
                                홈으로 돌아가기
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
