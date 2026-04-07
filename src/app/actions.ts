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
