"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
            >
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-orange-600 font-bold text-lg tracking-tight">로딩 중입니다...</p>
            </motion.div>
        </div>
    );
}
