"use client";

import { Plus, Minus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAppStore } from "@/lib/store";

export default function CartModal({
    isCartOpen,
    setIsCartOpen,
    isProcessingPay,
    handleCheckout,
    walletBalance,
    totalCartCost,
    cart
}: {
    isCartOpen: boolean,
    setIsCartOpen: (open: boolean) => void,
    isProcessingPay: boolean,
    handleCheckout: () => void,
    walletBalance: number,
    totalCartCost: number,
    cart: any[]
}) {
    const { removeFromCart, updateCartQuantity } = useAppStore();

    if (!isCartOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isProcessingPay && setIsCartOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col max-h-[85vh]"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-3xl sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-900">결제하기</h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        disabled={isProcessingPay}
                        className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 border-dashed">
                            <span className="text-slate-500 font-medium text-sm">내 기프티캐시</span>
                            <span className="font-bold text-slate-900 text-base">{walletBalance.toLocaleString()}원</span>
                        </div>

                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.cartItemId} className="flex flex-col text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-slate-800">{item.menuName}</p>
                                        <span className="font-bold text-slate-700">{(item.price * item.quantity).toLocaleString()}원</span>
                                    </div>
                                    {item.options.length > 0 && (
                                        <div className="text-xs text-slate-500 mb-2 space-y-0.5">
                                            {item.options.map((opt: any, i: number) => (
                                                <p key={i}>- {opt.choiceName} (+{opt.price}원)</p>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-slate-400">{item.price.toLocaleString()}원 x {item.quantity}</span>
                                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                                            <button onClick={() => item.quantity === 1 ? removeFromCart(item.cartItemId) : updateCartQuantity(item.cartItemId, item.quantity - 1)} className="text-orange-500 hover:text-orange-700 p-1">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="font-bold text-sm w-4 text-center text-slate-700">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)} className="text-orange-500 hover:text-orange-700 p-1">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-200 border-dashed flex justify-between items-center text-orange-600">
                            <span className="font-bold">총 결제 금액</span>
                            <span className="text-xl font-black">{totalCartCost.toLocaleString()}원</span>
                        </div>

                        {walletBalance < totalCartCost && (
                            <div className="mt-2 text-xs text-red-500 text-right font-medium flex flex-col items-end gap-1">
                                캐시가 부족합니다. 총 {(totalCartCost - walletBalance).toLocaleString()}원이 더 필요합니다.
                                <Link href="/wallet" className="inline-block mt-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 font-bold active:scale-95 transition-transform">
                                    지갑 충전하러 가기 &rarr;
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={isProcessingPay || walletBalance < totalCartCost}
                        className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center transition-all ${isProcessingPay
                            ? 'bg-orange-200 text-orange-600'
                            : walletBalance < totalCartCost
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                            }`}
                    >
                        {isProcessingPay ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                                결제중...
                            </div>
                        ) : walletBalance < totalCartCost ? (
                            "캐시 부족"
                        ) : (
                            `${totalCartCost.toLocaleString()}원 결제하기`
                        )}
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
