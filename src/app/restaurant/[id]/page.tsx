"use client";

import { useAppStore } from "@/lib/store";
import { MOCK_RESTAURANTS, MOCK_MENUS } from "@/lib/mockData";
import { ArrowLeft, MapPin, Clock, Plus, Minus, ShoppingBag, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RestaurantMenu() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const restaurant = MOCK_RESTAURANTS.find((r) => r.id === id);
    const menus = MOCK_MENUS.filter((m) => m.restaurantId === id);

    const { walletBalance, cart, addToCart, removeFromCart, updateCartQuantity, checkoutCart, clearCart } = useAppStore();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessingPay, setIsProcessingPay] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Clear cart when unmounting or leaving page
    useEffect(() => {
        return () => clearCart();
    }, [clearCart]);

    if (!restaurant) return <div className="p-8 text-center text-slate-500">가게를 찾을 수 없습니다.</div>;

    const totalCartCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleAddToCart = (menu: typeof menus[0]) => {
        addToCart({
            menuId: menu.id,
            menuName: menu.name,
            price: menu.discountedPrice,
            quantity: 1
        });
    };

    const handleCheckout = () => {
        setIsProcessingPay(true);
        setTimeout(() => {
            const success = checkoutCart(restaurant.id, restaurant.name);
            setIsProcessingPay(false);
            if (success) {
                setPaymentSuccess(true);
                setTimeout(() => setPaymentSuccess(false), 3000);
                setIsCartOpen(false);
            } else {
                alert("캐시 잔액이 부족합니다. 충전 후 이용해주세요.");
            }
        }, 1200);
    };

    return (
        <main className="flex-1 flex flex-col pt-8 pb-32 px-6 relative bg-slate-50 min-h-screen">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 mb-1 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{restaurant.name}</h1>
                </div>
            </header>

            {/* Restaurant Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{restaurant.address}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{restaurant.openTime}</span>
                    </div>
                </div>
            </div>

            <h2 className="font-bold text-lg mb-4 text-slate-800 px-1">할인 메뉴 목록</h2>

            {/* Menu List */}
            <div className="space-y-4">
                {menus.map((menu, idx) => {
                    const cartItem = cart.find(c => c.menuId === menu.id);
                    const quantityCount = cartItem ? cartItem.quantity : 0;

                    return (
                        <motion.div
                            key={menu.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`bg-white border p-4 rounded-2xl transition-all shadow-sm ${quantityCount > 0 ? 'border-orange-500 shadow-orange-500/10' : 'border-slate-200'}`}
                        >
                            <div className="flex gap-4">
                                <div className="text-4xl bg-slate-50 rounded-xl w-20 h-20 flex items-center justify-center border border-slate-100 flex-shrink-0">
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

                            {/* Add to Cart Actions */}
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                {quantityCount === 0 ? (
                                    <button
                                        onClick={() => handleAddToCart(menu)}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl text-sm font-bold transition-colors w-full flex items-center justify-center gap-2 border border-slate-200 hover:border-orange-200"
                                    >
                                        <Plus className="w-4 h-4" /> 담기
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 bg-orange-50 border border-orange-200 rounded-xl px-1 w-full justify-between p-1">
                                        <button
                                            onClick={() => quantityCount === 1 ? removeFromCart(menu.id) : updateCartQuantity(menu.id, quantityCount - 1)}
                                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold text-orange-700 w-8 text-center">{quantityCount}</span>
                                        <button
                                            onClick={() => updateCartQuantity(menu.id, quantityCount + 1)}
                                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Floating View Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && !isCartOpen && !paymentSuccess && (
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
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isProcessingPay && setIsCartOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                        />
                        {/* Modal */}
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

                                    <div className="space-y-3">
                                        {cart.map(item => (
                                            <div key={item.menuId} className="flex justify-between items-start text-sm">
                                                <div>
                                                    <p className="font-medium text-slate-800">{item.menuName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{item.price.toLocaleString()}원 x {item.quantity}</p>
                                                </div>
                                                <span className="font-bold text-slate-700">{(item.price * item.quantity).toLocaleString()}원</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 border-dashed flex justify-between items-center text-orange-600">
                                        <span className="font-bold">총 결제 금액</span>
                                        <span className="text-xl font-black">{totalCartCost.toLocaleString()}원</span>
                                    </div>

                                    {walletBalance < totalCartCost && (
                                        <div className="mt-2 text-xs text-red-500 text-right font-medium">
                                            캐시가 부족합니다. 총 {(totalCartCost - walletBalance).toLocaleString()}원이 더 필요합니다.
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessingPay || walletBalance < totalCartCost}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center transition-all ${isProcessingPay
                                            ? 'bg-orange-200 text-orange-600'
                                            : walletBalance < totalCartCost
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                                        }`}
                                >
                                    {isProcessingPay ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                                            결제중...
                                        </div>
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

        </main>
    );
}
