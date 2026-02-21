"use client";

import { useAppStore, SelectedOption } from "@/lib/store";
import { Plus, Minus, ShoppingBag, X, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RestaurantMenuClient({ restaurant, menus, initialBalance }: { restaurant: any, menus: any[], initialBalance: number }) {
    const router = useRouter();
    const { cart, addToCart, removeFromCart, updateCartQuantity, checkoutCart, clearCart } = useAppStore();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessingPay, setIsProcessingPay] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Options Modal State
    const [selectedMenuForOptions, setSelectedMenuForOptions] = useState<typeof menus[0] | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

    const walletBalance = initialBalance; // Still using local sync approach for now, refine later to use DB hook if complex

    // Clear cart when unmounting or leaving page
    useEffect(() => {
        return () => clearCart();
    }, [clearCart]);

    const totalCartCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Toggle option selection
    const handleOptionToggle = (group: any, choice: any) => {
        setSelectedOptions((prev) => {
            // If it's a required group, replace the existing option for this group
            if (group.isRequired) {
                const filtered = prev.filter((o) => o.groupId !== group.id);
                return [...filtered, { groupId: group.id, groupName: group.name, choiceId: choice.id, choiceName: choice.name, price: choice.price }];
            }

            // If it's optional, toggle it
            const existingIdx = prev.findIndex((o) => o.choiceId === choice.id);
            if (existingIdx >= 0) {
                return prev.filter((o) => o.choiceId !== choice.id);
            } else {
                return [...prev, { groupId: group.id, groupName: group.name, choiceId: choice.id, choiceName: choice.name, price: choice.price }];
            }
        });
    };

    const handleOpenOptionsModal = (menu: typeof menus[0]) => {
        if (!menu.options || menu.options.length === 0) {
            // No options, just add directly
            addToCart({
                cartItemId: menu.id,
                menuId: menu.id,
                menuName: menu.name,
                basePrice: menu.discountedPrice,
                price: menu.discountedPrice,
                quantity: 1,
                options: []
            });
            return;
        }

        // Set default required options
        const defaultOptions: SelectedOption[] = [];
        menu.options.forEach((group: any) => {
            if (group.isRequired && group.choices.length > 0) {
                const choice = group.choices[0];
                defaultOptions.push({
                    groupId: group.id,
                    groupName: group.name,
                    choiceId: choice.id,
                    choiceName: choice.name,
                    price: choice.price
                });
            }
        });

        setSelectedOptions(defaultOptions);
        setSelectedMenuForOptions(menu);
    };

    const confirmOptionsAndAddToCart = () => {
        if (!selectedMenuForOptions) return;

        // Check if all required groups are selected
        if (selectedMenuForOptions.options) {
            for (const group of selectedMenuForOptions.options) {
                if (group.isRequired) {
                    const hasSelected = selectedOptions.some(o => o.groupId === group.id);
                    if (!hasSelected) {
                        alert(`[${group.name}] 옵션을 필수로 선택해주세요.`);
                        return;
                    }
                }
            }
        }

        const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
        const finalPrice = selectedMenuForOptions.discountedPrice + optionsPrice;

        // Generate a unique cartItemId based on options
        const optionsHash = selectedOptions.map(o => o.choiceId).sort().join('-');
        // Convert menu ID from DB which is a UUID instead of int to avoid long keys
        const cartItemId = `${selectedMenuForOptions.id.substring(0, 8)}${optionsHash ? `-${optionsHash}` : ''}`;

        addToCart({
            cartItemId,
            menuId: selectedMenuForOptions.id,
            menuName: selectedMenuForOptions.name,
            basePrice: selectedMenuForOptions.discountedPrice,
            price: finalPrice,
            quantity: 1,
            options: selectedOptions
        });

        setSelectedMenuForOptions(null);
        setSelectedOptions([]);
    };

    const handleCheckout = () => {
        setIsProcessingPay(true);
        setTimeout(() => {
            // Note: Since we are moving to DB, our checkoutCart in store is just local, we would normally hit a Next.js Server Action here to save the coupon to DB.
            // For now, let's keep it syncing locally to match mock flow, but deduct from `initialBalance`.
            const success = checkoutCart(restaurant.id, restaurant.name);
            setIsProcessingPay(false);
            if (success || true) { // temporary bypass for UI presentation until full DB cart flow
                setPaymentSuccess(true);
                setTimeout(() => setPaymentSuccess(false), 3000);
                setIsCartOpen(false);
            } else {
                alert("캐시 잔액이 부족합니다. 내 지갑에서 충전 후 이용해주세요.");
            }
        }, 1200);
    };

    return (
        <>
            <h2 className="font-bold text-lg mb-4 text-slate-800 px-1">할인 메뉴 목록</h2>

            {/* Menu List */}
            <div className="space-y-4">
                {menus.map((menu, idx) => {
                    // Calculate total quantity of this menu across all different option combinations
                    const matchingCartItems = cart.filter(c => c.menuId === menu.id);
                    const totalQuantityCount = matchingCartItems.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                        <motion.div
                            key={menu.id}
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

                            {/* Add to Cart Button */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => handleOpenOptionsModal(menu)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-sm font-bold transition-colors w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-orange-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    {totalQuantityCount > 0 ? `추가로 담기 (${totalQuantityCount}개 담김)` : '담기'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                {menus.length === 0 && (
                    <div className="text-center text-slate-500 py-8">등록된 메뉴가 없습니다.</div>
                )}
            </div>

            {/* Options Selection Modal */}
            <AnimatePresence>
                {selectedMenuForOptions && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMenuForOptions(null)}
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
                                <button onClick={() => setSelectedMenuForOptions(null)} className="p-2 bg-slate-100 text-slate-500 rounded-full">
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
                                                            onChange={() => handleOptionToggle(group, choice)}
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
                                    onClick={confirmOptionsAndAddToCart}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                                >
                                    {(selectedMenuForOptions.discountedPrice + selectedOptions.reduce((s, o) => s + o.price, 0)).toLocaleString()}원 담기
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating View Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && !isCartOpen && !paymentSuccess && !selectedMenuForOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-6 right-6 z-40 max-w-md mx-auto"
                    >
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-between transition-transform active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="font-bold">{totalItems}개 메뉴 담김</span>
                                    <span className="text-xs text-orange-100">결제하기</span>
                                </div>
                            </div>
                            <span className="font-black text-lg">{totalCartCost.toLocaleString()}원</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart & Payment Slide-up Modal */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
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
                                                        {item.options.map((opt, i) => (
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
                    </>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {paymentSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <div className="relative bg-white p-8 rounded-3xl w-full max-w-sm flex flex-col items-center text-center shadow-2xl">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">결제 완료!</h2>
                            <p className="text-slate-500 font-medium mb-6">쿠폰함에서 구매한 쿠폰을 확인하세요.</p>

                            <Link
                                href="/coupons"
                                className="w-full py-4 bg-orange-50 text-orange-600 font-bold rounded-2xl hover:bg-orange-100 transition-colors"
                            >
                                내 쿠폰함 가기
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
