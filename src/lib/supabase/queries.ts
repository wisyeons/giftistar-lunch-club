import { createClient } from './server';

export async function getRestaurants() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
    return data;
}

export async function getRestaurantById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
    }
    return data;
}

export async function getMenusByRestaurantId(restaurantId: string) {
    const supabase = await createClient();

    // Fetch menus
    const { data: menus, error: menusError } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

    if (menusError || !menus) {
        console.error('Error fetching menus:', menusError);
        return [];
    }

    // Fetch options for these menus
    const menuIds = menus.map(m => m.id);
    const { data: options, error: optionsError } = await supabase
        .from('menu_options')
        .select('*')
        .in('menu_id', menuIds);

    if (optionsError) {
        console.error('Error fetching options:', optionsError);
        return menus; // Return menus without options if options fail
    }

    // Combine them
    const menusWithOptions = menus.map(menu => {
        const menuOpts = options.filter(o => o.menu_id === menu.id).map(o => ({
            id: o.id,
            name: o.group_name,
            isRequired: o.is_required,
            choices: o.choices as any[]
        }));

        return {
            ...menu,
            options: menuOpts.length > 0 ? menuOpts : undefined
        };
    });

    return menusWithOptions;
}
