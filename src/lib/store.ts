import { create } from 'zustand';

export type CouponStatus = 'Unused' | 'Used';

export type SelectedOption = {
    groupId: string;
    groupName: string;
    choiceId: string;
    choiceName: string;
    price: number;
};

export type CouponItem = {
    menuId: string;
    menuName: string;
    price: number;
    quantity: number;
    options: SelectedOption[];
    cartItemId: string; // Unique ID for items with different options
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
    cartItemId: string; // Unique ID to distinguish same menu with different options
    menuId: string;
    menuName: string;
    price: number; // base price + options price
    basePrice: number;
    quantity: number;
    options: SelectedOption[];
};

interface AppState {
    walletBalance: number;
    coupons: Coupon[];
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (cartItemId: string) => void;
    updateCartQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    checkoutCart: (restaurantId: string, restaurantName: string) => boolean;
    useCoupon: (couponId: string) => void;
    rechargeWallet: (amount: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    walletBalance: 50000, // 50,000 KRW
    coupons: [],
    cart: [],

    addToCart: (item) => set((state) => {
        const existing = state.cart.find(c => c.cartItemId === item.cartItemId);
        if (existing) {
            return {
                cart: state.cart.map(c =>
                    c.cartItemId === item.cartItemId
                        ? { ...c, quantity: c.quantity + item.quantity }
                        : c
                )
            };
        }
        return { cart: [...state.cart, item] };
    }),

    removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter(c => c.cartItemId !== cartItemId)
    })),

    updateCartQuantity: (cartItemId, quantity) => set((state) => ({
        cart: state.cart.map(c => c.cartItemId === cartItemId ? { ...c, quantity } : c)
    })),

    clearCart: () => set({ cart: [] }),

    rechargeWallet: (amount) => set((state) => ({
        walletBalance: state.walletBalance + amount
    })),

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
