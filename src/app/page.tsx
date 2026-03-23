import { getDBData } from '@/lib/db'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const db = await getDBData()
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Include today and tomorrow's meals for the 'Plan Ahead' feature
  const meals = db.daily_meals.filter((m: any) => m.date === today || m.date === tomorrow)

  return (
    <HomeClient
      initialMeals={meals}
      initialVendors={db.vendors}
      allReservations={db.reservations}
    />
  )
}
