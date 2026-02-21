"use client";

import { useAppStore } from "@/lib/store";
import { ArrowLeft, Wallet, Plus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
    const router = useRouter();
    const { walletBalance, rechargeWallet } = useAppStore();

    const [selectedAmount, setSelectedAmount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState(false);

    const RECHARGE_OPTIONS = [10000, 30000, 50000, 100000];

    const handleRecharge = () => {
        if (selectedAmount === 0) return;
        setIsProcessing(true);

        setTimeout(() => {
            rechargeWallet(selectedAmount);
            setIsProcessing(false);
            setSuccessMsg(true);

            setTimeout(() => {
                setSuccessMsg(false);
                setSelectedAmount(0);
            }, 2000);
        }, 1000);
    };

    return (
        <main className="flex-1 flex flex-col pt-8 pb-10 px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-50">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">내 지갑</h1>
                </div>
            </header>

            {/* Current Balance */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-900/20 mb-10 overflow-hidden relative">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-orange-400" />
                    <span className="text-slate-300 text-sm font-medium">기프티캐시 잔액</span>
                </div>
                <div className="text-4xl font-black tracking-tight">{walletBalance.toLocaleString()} <span className="text-xl font-normal text-slate-400">원</span></div>
            </div>

            {/* Recharge Section */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">캐시 충전하기</h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
                {RECHARGE_OPTIONS.map((amount) => (
                    <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-4 rounded-2xl border-2 transition-all font-bold text-lg active:scale-95 ${selectedAmount === amount
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/50'
                            }`}
                    >
                        +{amount.toLocaleString()}원
                    </button>
                ))}
            </div>

            <button
                onClick={handleRecharge}
                disabled={selectedAmount === 0 || isProcessing}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center transition-all ${isProcessing
                        ? 'bg-orange-200 text-orange-600'
                        : selectedAmount === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                    }`}
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                        충전 진행중...
                    </div>
                ) : selectedAmount === 0 ? (
                    "금액을 선택해주세요"
                ) : (
                    `${selectedAmount.toLocaleString()}원 충전하기`
                )}
            </button>

            {/* Success Notification */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-10 left-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 z-50 max-w-xs mx-auto text-center"
                    >
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        <p className="font-bold text-sm">성공적으로 충전되었습니다!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
