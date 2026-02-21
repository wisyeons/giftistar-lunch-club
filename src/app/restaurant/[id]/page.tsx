import { getRestaurantById, getMenusByRestaurantId } from "@/lib/supabase/queries";
import { ArrowLeft, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import RestaurantMenuClient from "./RestaurantMenuClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function RestaurantMenu({ params }: { params: { id: string } }) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    let walletBalance = 50000;
    if (user) {
        const { data: profile } = await supabase.from('users').select('wallet_balance').eq('id', user.id).single();
        if (profile && profile.wallet_balance !== null) walletBalance = profile.wallet_balance;
    }

    const restaurant = await getRestaurantById(id);
    const menus = await getMenusByRestaurantId(id);

    if (!restaurant) {
        return <div className="p-8 text-center text-slate-500">가게를 찾을 수 없습니다.</div>;
    }

    // Map DB fields to what client component expects
    const clientRestaurant = {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        openTime: restaurant.open_time,
        image: restaurant.image,
        description: restaurant.description,
        discountRate: restaurant.discount_rate
    };

    const clientMenus = menus.map((m: any) => ({
        id: m.id,
        restaurantId: m.restaurant_id,
        name: m.name,
        description: m.description,
        originalPrice: m.original_price,
        discountedPrice: m.discounted_price,
        image: m.image,
        options: m.options
    }));

    return (
        <main className="flex-1 flex flex-col pt-8 pb-32 px-6 relative bg-slate-50 min-h-screen">
            {/* Header */}
            <header className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 mb-1 bg-white rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{clientRestaurant.name}</h1>
            </header>

            {/* Restaurant Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-8">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{clientRestaurant.address}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{clientRestaurant.openTime}</span>
                    </div>
                </div>
            </div>

            <RestaurantMenuClient
                restaurant={clientRestaurant}
                menus={clientMenus}
                initialBalance={walletBalance}
            />
        </main>
    );
}
