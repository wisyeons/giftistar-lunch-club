import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CouponDetailClient from "./CouponDetailClient";

export const dynamic = 'force-dynamic';

export default async function CouponDetail({ params }: { params: { id: string } }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch the specific coupon
    const { data: couponData, error } = await supabase
        .from('coupons')
        .select(`
            *,
            coupon_items (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error || !couponData) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-50 min-h-screen pt-20">
                <p>쿠폰을 찾을 수 없습니다.</p>
                <Link href="/coupons" className="text-orange-500 mt-4 inline-block font-bold">쿠폰함으로 돌아가기</Link>
            </div>
        );
    }

    // Map to client shape
    const coupon = {
        id: couponData.id,
        restaurantName: couponData.restaurant_name,
        status: couponData.status,
        totalPrice: couponData.total_price,
        items: couponData.coupon_items.map((i: any) => ({
            menuName: i.menu_name,
            quantity: i.quantity,
            price: i.price,
            options: i.options || []
        }))
    };

    return (
        <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-10 px-6 max-w-md mx-auto w-full relative min-h-screen bg-slate-100 overflow-hidden">
            {/* Header */}
            <header className="absolute top-8 left-6 right-6 flex items-center justify-between z-10">
                <Link href="/coupons" className="p-2 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">쿠폰 티켓</span>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <CouponDetailClient initialCoupon={coupon} />
        </main>
    );
}
