"use client";

import { useAppStore, SelectedOption } from "@/lib/store";
import { ShoppingBag, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { processCheckout } from "./actions";
import MenuCard from "./MenuCard";
import OptionsModal from "./OptionsModal";
import CartModal from "./CartModal";

export default function RestaurantMenuClient({ restaurant, menus, initialBalance }: { restaurant: any, menus: any[], initialBalance: number }) {
    const router = useRouter();
    const { cart, addToCart, clearCart } = useAppStore();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessingPay, setIsProcessingPay] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [totalDiscountAmount, setTotalDiscountAmount] = useState(0);
    const [createdCouponId, setCreatedCouponId] = useState<string | null>(null);

    // Options Modal State
    const [selectedMenuForOptions, setSelectedMenuForOptions] = useState<typeof menus[0] | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

    const walletBalance = initialBalance;

    useEffect(() => {
        return () => clearCart();
    }, [clearCart]);

    const totalCartCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleOptionToggle = (group: any, choice: any) => {
        setSelectedOptions((prev) => {
            if (group.isRequired) {
                const filtered = prev.filter((o) => o.groupId !== group.id);
                return [...filtered, { groupId: group.id, groupName: group.name, choiceId: choice.id, choiceName: choice.name, price: choice.price }];
            }

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

        const optionsHash = selectedOptions.map(o => o.choiceId).sort().join('-');
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

    const handleCheckout = async () => {
        setIsProcessingPay(true);
        try {
            const result = await processCheckout(restaurant.id, restaurant.name, cart, totalCartCost);
            if (result.success) {
                let discount = 0;
                cart.forEach(item => {
                    const menu = menus.find(m => m.id === item.menuId);
                    if (menu && menu.originalPrice && menu.discountedPrice) {
                        discount += (menu.originalPrice - menu.discountedPrice) * item.quantity;
                    }
                });
                setTotalDiscountAmount(discount);
                setCreatedCouponId((result as any).couponId || null);
                setPaymentSuccess(true);
                clearCart();
                setIsCartOpen(false);
            } else {
                alert(result.message || "결제 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("알 수 없는 오류가 발생했습니다.");
        } finally {
            setIsProcessingPay(false);
        }
    };

    return (
        <>
            <h2 className="font-bold text-lg mb-4 text-slate-800 px-1">할인 메뉴 목록</h2>

            <div className="space-y-4">
                {menus.map((menu, idx) => {
                    const matchingCartItems = cart.filter(c => c.menuId === menu.id);
                    const totalQuantityCount = matchingCartItems.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            idx={idx}
                            totalQuantityCount={totalQuantityCount}
                            onOpenOptions={handleOpenOptionsModal}
                        />
                    );
                })}
                {menus.length === 0 && (
                    <div className="text-center text-slate-500 py-8">등록된 메뉴가 없습니다.</div>
                )}
            </div>

            <OptionsModal
                selectedMenuForOptions={selectedMenuForOptions}
                selectedOptions={selectedOptions}
                onClose={() => setSelectedMenuForOptions(null)}
                onToggleOption={handleOptionToggle}
                onConfirm={confirmOptionsAndAddToCart}
            />

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

            <CartModal
                isCartOpen={isCartOpen}
                setIsCartOpen={setIsCartOpen}
                isProcessingPay={isProcessingPay}
                handleCheckout={handleCheckout}
                walletBalance={walletBalance}
                totalCartCost={totalCartCost}
                cart={cart}
            />

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
                            <p className="text-slate-500 font-medium mb-2">쿠폰함에서 구매한 쿠폰을 확인하세요.</p>
                            {totalDiscountAmount > 0 && (
                                <p className="text-orange-500 font-extrabold text-sm mb-6 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm w-full">
                                    총 {totalDiscountAmount.toLocaleString()}원 혜택을 받았어요 🎉
                                </p>
                            )}
                            <Link
                                href="/coupons"
                                className="w-full py-4 bg-orange-50 text-orange-600 font-bold rounded-2xl hover:bg-orange-100 transition-colors mb-3"
                            >
                                내 쿠폰함 가기
                            </Link>
                            {createdCouponId && (
                                <Link
                                    href={`/coupons/${createdCouponId}`}
                                    className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                >
                                    바로 사용하기
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
