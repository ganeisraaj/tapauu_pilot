import { getDBData } from '@/lib/db'
import VendorClient from './VendorClient'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VendorPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params
    const db = await getDBData()
    const vendor = db.vendors.find((v: any) => v.code === code.toUpperCase())

    if (!vendor) return notFound()

    const today = new Date().toISOString().split('T')[0]
    const todayMeal = db.daily_meals.find((m: any) => m.vendor_id === vendor.id && m.date === today)
    const todayReservations = db.reservations.filter((r: any) => r.vendor_id === vendor.id && r.date === today)

    return (
        <VendorClient
            vendor={vendor}
            meal={todayMeal}
            reservations={todayReservations}
        />
    )
}
