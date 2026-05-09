'use server'

import {
    makeReservation,
    getUserById,
    getDBData,
    redeemVoucher,
    updateUser,
    updateMeal,
    createMeal,
    deleteMeal,
    createUser,
    createVendor,
    updateVendor,
    deleteVendor,
    deleteUser,
    deleteReservation,
    type User,
    type Vendor,
    type DailyMeal
} from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function reserveMealAction(formData: FormData) {
    const tapauuId = formData.get('tapauuId') as string
    const mealId = formData.get('mealId') as string
    const pickupTime = formData.get('pickupTime') as string


    if (!tapauuId || !mealId || !pickupTime) {
        return { error: 'Missing required information' }
    }

    try {
        const res = await makeReservation(tapauuId, mealId, pickupTime)
        revalidatePath('/')
        return { success: true, reservation: res }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function checkUserAction(tapauuId: string) {
    const user = await getUserById(tapauuId)
    if (!user) return { error: 'Invalid TAPAUU ID' }
    return { success: true, user }
}

export async function getProfileByAuthIdAction(authId: string, email?: string, metadata?: any) {
    try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin');

        // 1. Try to find by UUID first
        let { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile by ID:', error);
            // Don't throw, try to continue
        }

        // 2. If not found by ID, maybe they were migrated or signed up with email?
        // Let's check if there's a record with the same name/phone fallback? 
        // Actually, let's just ensure we create one if it truly doesn't exist.

        if (!data) {
            const generatedId = "STU" + Math.random().toString(36).substring(2, 7).toUpperCase();

            // Fallback name from email if metadata is missing
            const fallbackName = email ? email.split('@')[0] : 'New Student';
            const name = metadata?.full_name || fallbackName;

            const { data: newUser, error: createError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: authId,
                    name: name,
                    phone: metadata?.phone || '',
                    tapauu_id: generatedId,
                    credits: 0, // Always 0 for new pilot users
                    active: true
                })
                .select()
                .maybeSingle();

            if (createError) {
                console.error('Error creating profile lazily:', createError);
                throw new Error('Could not create user profile: ' + createError.message);
            }
            data = newUser;
        }

        return { success: true, user: data }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function getTodayDataAction() {
    return await getDBData()
}

export async function updateUserAction(userId: string, updates: Partial<User>) {
    try {
        await updateUser(userId, updates)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updateMealAction(mealId: string, updates: any) {
    try {
        await updateMeal(mealId, updates)
        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function createMealAction(meal: any) {
    try {
        const id = `m-${meal.date}-${meal.vendor_id}`
        await createMeal({ ...meal, id, remaining: meal.limit })
        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteMealAction(mealId: string) {
    try {
        await deleteMeal(mealId)
        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function redeemAction(voucherCode: string) {
    try {
        const res = await redeemVoucher(voucherCode)
        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true, reservation: res }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function createUserAction(user: Partial<User>) {
    try {
        await createUser(user)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function syncProfileAfterSignup(authId: string, profile: { name: string, phone: string, tapauu_id: string }) {
    try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin');
        const { error } = await supabaseAdmin
            .from('users')
            .upsert({
                ...profile,
                id: authId,
                credits: 0, // Users start with 0 credits
                active: true
            });

        if (error) throw error;

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function createVendorAction(vendor: Partial<Vendor>) {
    try {
        await createVendor(vendor)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function updateVendorAction(vendorId: string, updates: Partial<Vendor>) {
    try {
        await updateVendor(vendorId, updates)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteVendorAction(vendorId: string) {
    try {
        await deleteVendor(vendorId)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteUserAction(userId: string) {
    try {
        await deleteUser(userId)
        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

export async function deleteReservationAction(reservationId: string) {
    try {
        await deleteReservation(reservationId)
        revalidatePath('/admin')
        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}
