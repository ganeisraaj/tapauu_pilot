import { supabaseAdmin as supabase } from './supabase-admin'
import { getMYTDateString, getMYTCutoff } from './utils'

export type User = {
    id: string;
    tapauu_id: string;
    name: string;
    phone: string;
    credits: number;
    active: boolean;
};

export type Vendor = {
    id: string;
    name: string;
    code: string;
    active: boolean;
};

export type DailyMeal = {
    id: string;
    date: string;
    vendor_id: string;
    meal_name: string;
    limit: number;
    remaining: number;
    cutoff: string;
    credit_cost: number;
};

export type Reservation = {
    id: string;
    user_id: string;
    vendor_id: string;
    meal_id: string;
    date: string;
    voucher: string;
    status: 'reserved' | 'redeemed' | 'expired' | 'cancelled';
    pickup_time: string;
    created_at: string;
};

export function getTodayStr() {
    return getMYTDateString();
}

// Supabase powered DB functions
export async function getDBData() {
    const [usersRes, vendorsRes, mealsRes, resRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('daily_meals').select('*'),
        supabase.from('reservations').select('*')
    ]);

    // Map any field names if necessary (e.g., limit -> slots_limit)
    const meals = (mealsRes.data || []).map(m => ({
        ...m,
        limit: m.slots_limit,
        credit_cost: m.credit_cost || 1
    }));

    return {
        users: usersRes.data || [],
        vendors: vendorsRes.data || [],
        daily_meals: meals || [],
        reservations: resRes.data || []
    };
}

export async function getTodayMeals() {
    const today = getTodayStr();
    const { data } = await supabase.from('daily_meals').select('*').eq('date', today);
    return (data || []).map(m => ({ ...m, limit: m.slots_limit, credit_cost: m.credit_cost || 1 }));
}

export async function getUserById(tapauuId: string) {
    const { data } = await supabase.from('users')
        .select('*')
        .eq('tapauu_id', tapauuId)
        .eq('active', true)
        .single();
    return data as User | null;
}

export async function makeReservation(tapauuId: string, mealId: string, pickupTime: string) {
    // 1. Get user and meal
    const { data: user } = await supabase.from('users').select('*').eq('tapauu_id', tapauuId).single();
    const { data: meal } = await supabase.from('daily_meals').select('*').eq('id', mealId).single();

    if (!user || !meal) throw new Error('User or Meal not found');

    const cost = meal.credit_cost || 1;
    if (user.credits < cost) throw new Error(`Insufficient credits (Need ${cost}, have ${user.credits})`);
    if (meal.remaining <= 0) throw new Error('Meal sold out');

    // 2. Check cutoff (using MYT)
    const now = new Date();
    const cutoffTime = getMYTCutoff(meal.date, meal.cutoff);

    if (now > cutoffTime) throw new Error('Reservation closed (cutoff passed)');

    // 3. Check duplicate
    const { data: existing } = await supabase.from('reservations')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', meal.date)
        .single();
    if (existing) throw new Error('Already reserved a meal for today');

    // 4. Generate Voucher
    const { data: vendor } = await supabase.from('vendors').select('*').eq('id', meal.vendor_id).single();
    const dateObj = new Date(meal.date);
    const dateCode = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

    // Count existing for the voucher sequence
    const { count } = await supabase.from('reservations')
        .select('id', { count: 'exact' })
        .eq('vendor_id', meal.vendor_id)
        .eq('date', meal.date);

    const countNum = (count || 0) + 1;
    const voucherCode = `${vendor.code}-${dateCode}-${countNum.toString().padStart(2, '0')}`;

    const reservation: Reservation = {
        id: `r-${Date.now()}`,
        user_id: user.id,
        vendor_id: meal.vendor_id,
        meal_id: meal.id,
        date: meal.date,
        voucher: voucherCode,
        status: 'reserved',
        pickup_time: pickupTime,
        created_at: new Date().toISOString()
    };

    // 5. Atomic Update (Ideally using a transaction, but let's use separate calls for simple pilot)
    const { error: resErr } = await supabase.from('reservations').insert(reservation);
    if (resErr) throw resErr;

    await supabase.from('daily_meals').update({ remaining: meal.remaining - 1 }).eq('id', meal.id);
    await supabase.from('users').update({ credits: user.credits - cost }).eq('id', user.id);

    return reservation;
}

export async function redeemVoucher(voucherCode: string) {
    const { data: res } = await supabase.from('reservations').select('*').eq('voucher', voucherCode).single();
    if (!res) throw new Error('Voucher not found');
    if (res.status === 'redeemed') throw new Error('Voucher already redeemed');

    const { data, error } = await supabase.from('reservations')
        .update({ status: 'redeemed' })
        .eq('voucher', voucherCode)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Admin only functions
export async function createUser(user: Partial<User>) {
    const id = `u-${Date.now()}`;
    const { error } = await supabase.from('users').insert({
        ...user,
        id,
        credits: user.credits || 10,
        active: true
    });
    if (error) throw error;
    return { success: true };
}

export async function createVendor(vendor: Partial<Vendor>) {
    const id = `v-${Date.now()}`;
    const { error } = await supabase.from('vendors').insert({
        ...vendor,
        id,
        active: true
    });
    if (error) throw error;
    return { success: true };
}

export async function updateVendor(vendorId: string, updates: Partial<Vendor>) {
    const { error } = await supabase.from('vendors').update(updates).eq('id', vendorId);
    if (error) throw error;
    return { success: true };
}

export async function deleteVendor(vendorId: string) {
    // Delete child records first to avoid FK constraint errors
    const { error: resErr } = await supabase.from('reservations').delete().eq('vendor_id', vendorId);
    if (resErr) throw resErr;

    const { error: mealErr } = await supabase.from('daily_meals').delete().eq('vendor_id', vendorId);
    if (mealErr) throw mealErr;

    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) throw error;
    return { success: true };
}

export async function deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { success: true };
}

export async function updateUser(userId: string, updates: Partial<User>) {
    const { error } = await supabase.from('users').update(updates).eq('id', userId);
    if (error) throw error;
    return { success: true };
}

export async function updateMeal(mealId: string, updates: any) {
    const data: any = {
        meal_name: updates.meal_name,
        cutoff: updates.cutoff,
        slots_limit: updates.limit,
        credit_cost: updates.credit_cost || 1
    };
    if (updates.remaining !== undefined) data.remaining = updates.remaining;

    const { error } = await supabase.from('daily_meals')
        .update(data)
        .eq('id', mealId);
    if (error) throw error;
    return { success: true };
}

export async function createMeal(meal: any) {
    const { error } = await supabase.from('daily_meals').insert({
        id: meal.id,
        date: meal.date,
        vendor_id: meal.vendor_id,
        meal_name: meal.meal_name,
        slots_limit: meal.limit,
        remaining: meal.remaining,
        cutoff: meal.cutoff,
        credit_cost: meal.credit_cost || 1
    });
    if (error) throw error;
    return { success: true };
}

export async function deleteMeal(mealId: string) {
    // Delete child reservations first to avoid FK constraint error
    const { error: resErr } = await supabase.from('reservations').delete().eq('meal_id', mealId);
    if (resErr) throw resErr;

    const { error } = await supabase.from('daily_meals').delete().eq('id', mealId);
    if (error) throw error;
    return { success: true };
}
