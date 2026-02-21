"use client";

import { login, signup } from "./actions";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
    const searchParams = useSearchParams();
    const rawMessage = searchParams?.get("message");
    const [isLogin, setIsLogin] = useState(true);

    let message = rawMessage;
    if (rawMessage === "Invalid login credentials") {
        message = "이메일이나 비밀번호가 올바르지 않습니다.";
    } else if (rawMessage?.includes("Password should be")) {
        message = "비밀번호는 최소 6자 이상이어야 합니다.";
    } else if (rawMessage?.includes("User already registered")) {
        message = "이미 가입된 이메일 계정입니다.";
    } else if (rawMessage?.includes("Email rate limit exceeded")) {
        message = "가입 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.";
    }

    return (
        <>
            <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
                {isLogin ? "로그인" : "회원가입"}
            </h2>

            {message && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-start gap-2 border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{message}</p>
                </div>
            )}

            <form className="flex flex-col gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium"
                    />
                </div>

                <button
                    formAction={isLogin ? login : signup}
                    className="w-full mt-4 py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                >
                    {isLogin ? "로그인하기" : "가입하기"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    type="button"
                    className="text-sm font-bold text-slate-500 hover:text-orange-500 transition-colors"
                >
                    {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
                </button>
            </div>
        </>
    )
}

export default function LoginPage() {
    return (
        <main className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-50 pt-20 pb-10">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-10"
            >
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-orange-500/30">
                    <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">기프티런치클럽</h1>
                <p className="text-slate-500 font-medium">프리미엄 선결제 쿠폰 서비스에 오신 것을 환영합니다.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100 w-full"
            >
                <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </motion.div>
        </main>
    );
}
