import { create } from 'zustand';

export type CouponStatus = 'Unused' | 'Used';

export type CouponItem = {
    menuId: string;
    menuName: string;
    price: number;
    quantity: number;
};

export type Coupon = {
    id: string;
    restaurantId: string;
    restaurantName: string;
    items: CouponItem[];
    status: CouponStatus;
    expirationDate: string;
    purchaseDate: string;
    totalPrice: number;
};

export type CartItem = {
    menuId: string;
    menuName: string;
    price: number;
    quantity: number;
};

interface AppState {
    walletBalance: number;
    coupons: Coupon[];
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (menuId: string) => void;
    updateCartQuantity: (menuId: string, quantity: number) => void;
    clearCart: () => void;
    checkoutCart: (restaurantId: string, restaurantName: string) => boolean;
    useCoupon: (couponId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    walletBalance: 50000, // 50,000 KRW
    coupons: [],
    cart: [],

    addToCart: (item) => set((state) => {
        const existing = state.cart.find(c => c.menuId === item.menuId);
        if (existing) {
            return {
                cart: state.cart.map(c =>
                    c.menuId === item.menuId
                        ? { ...c, quantity: c.quantity + item.quantity }
                        : c
                )
            };
        }
        return { cart: [...state.cart, item] };
    }),

    removeFromCart: (menuId) => set((state) => ({
        cart: state.cart.filter(c => c.menuId !== menuId)
    })),

    updateCartQuantity: (menuId, quantity) => set((state) => ({
        cart: state.cart.map(c => c.menuId === menuId ? { ...c, quantity } : c)
    })),

    clearCart: () => set({ cart: [] }),

    checkoutCart: (restaurantId, restaurantName) => {
        const { walletBalance, cart, coupons } = get();
        const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (walletBalance < totalCost || cart.length === 0) {
            return false; // Insufficient funds or empty cart
        }

        const newCoupon: Coupon = {
            id: `CUP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            restaurantId,
            restaurantName,
            items: [...cart],
            status: 'Unused',
            totalPrice: totalCost,
            purchaseDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        set({
            walletBalance: walletBalance - totalCost,
            coupons: [newCoupon, ...coupons],
            cart: [] // Clear cart after successful checkout
        });

        return true;
    },

    useCoupon: (couponId) => {
        set((state) => ({
            coupons: state.coupons.map((c) =>
                c.id === couponId ? { ...c, status: 'Used' as CouponStatus } : c
            ),
        }));
    },
}));
