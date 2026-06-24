import { getDBData } from '@/lib/db'
import HomeClient from './HomeClient'
import { getMYTDateString } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const db = await getDBData()
  const today = getMYTDateString()
  const tomorrowDate = new Date()
  tomorrowDate.setHours(tomorrowDate.getHours() + 24)
  const tomorrow = getMYTDateString(tomorrowDate)

  // Include today and tomorrow's meals for the 'Plan Ahead' feature
  const meals = db.daily_meals.filter((m: any) => m.date === today || m.date === tomorrow)

  return (
    <HomeClient
      initialMeals={meals}
      initialVendors={db.vendors}
      allReservations={db.reservations}
      universities={db.universities}
    />
  )
}
