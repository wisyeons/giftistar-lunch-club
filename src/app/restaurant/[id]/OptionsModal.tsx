"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function OptionsModal({
    selectedMenuForOptions,
    selectedOptions,
    onClose,
    onToggleOption,
    onConfirm
}: {
    selectedMenuForOptions: any,
    selectedOptions: any[],
    onClose: () => void,
    onToggleOption: (group: any, choice: any) => void,
    onConfirm: () => void
}) {
    if (!selectedMenuForOptions) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col max-h-[85vh]"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mb-1">{selectedMenuForOptions.name}</h2>
                        <p className="font-bold text-orange-600">{selectedMenuForOptions.discountedPrice.toLocaleString()}원</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {selectedMenuForOptions.options?.map((group: any) => (
                        <div key={group.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-800">{group.name}</h3>
                                {group.isRequired ? (
                                    <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded uppercase">필수</span>
                                ) : (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded uppercase">선택</span>
                                )}
                            </div>
                            <div className="space-y-2">
                                {group.choices.map((choice: any) => {
                                    const isSelected = selectedOptions.some(o => o.choiceId === choice.id);
                                    return (
                                        <label key={choice.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <span className={isSelected ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}>{choice.name}</span>
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">
                                                {choice.price > 0 ? `+${choice.price.toLocaleString()}원` : '무료'}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleOption(group, choice)}
                                                className="hidden"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                    >
                        {(selectedMenuForOptions.discountedPrice + selectedOptions.reduce((s, o) => s + o.price, 0)).toLocaleString()}원 담기
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
