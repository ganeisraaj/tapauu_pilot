import { getDBData, getUniversities } from '@/lib/db'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const [db, universities] = await Promise.all([
        getDBData(),
        getUniversities()
    ])

    return (
        <AdminClient
            users={db.users}
            vendors={db.vendors}
            meals={db.daily_meals}
            reservations={db.reservations}
            universities={universities}
        />
    )
}
