import { getDBData } from '@/lib/db'
import AdminClient from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const db = await getDBData()

    return (
        <AdminClient
            users={db.users}
            vendors={db.vendors}
            meals={db.daily_meals}
            reservations={db.reservations}
        />
    )
}
