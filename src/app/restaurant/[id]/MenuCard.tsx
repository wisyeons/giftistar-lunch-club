"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function MenuCard({
    menu,
    idx,
    totalQuantityCount,
    onOpenOptions
}: {
    menu: any,
    idx: number,
    totalQuantityCount: number,
    onOpenOptions: (menu: any) => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-white border p-4 rounded-2xl transition-all shadow-sm ${totalQuantityCount > 0 ? 'border-orange-500 shadow-orange-500/10' : 'border-slate-200'}`}
        >
            <div className="flex gap-4">
                <div className="text-4xl bg-orange-50/50 rounded-xl w-20 h-20 flex items-center justify-center border border-orange-100/50 flex-shrink-0">
                    {menu.image}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-base text-slate-900 leading-tight mb-1">{menu.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">{menu.description}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-orange-500 font-bold text-lg">{menu.discountedPrice.toLocaleString()}원</span>
                        <span className="text-slate-400 text-xs line-through font-medium mt-1">{menu.originalPrice.toLocaleString()}원</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button
                    onClick={() => onOpenOptions(menu)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-sm font-bold transition-colors w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-orange-200"
                >
                    <Plus className="w-4 h-4" />
                    {totalQuantityCount > 0 ? `추가로 담기 (${totalQuantityCount}개 담김)` : '담기'}
                </button>
            </div>
        </motion.div>
    );
}
