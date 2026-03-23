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
    type User,
    type DailyMeal
} from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function reserveMealAction(formData: FormData) {
    const tapauuId = formData.get('tapauuId') as string
    const mealId = formData.get('mealId') as string

    if (!tapauuId || !mealId) {
        return { error: 'Missing required information' }
    }

    try {
        const res = await makeReservation(tapauuId, mealId)
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
