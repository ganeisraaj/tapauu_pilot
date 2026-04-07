const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (!fs.existsSync(dbPath)) {
        console.error('db.json not found');
        return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    console.log('--- Migrating Vendors ---');
    for (const vendor of data.vendors) {
        const { error } = await supabase.from('vendors').upsert(vendor);
        if (error) console.error(`Error migrating vendor ${vendor.name}:`, error);
        else console.log(`Migrated vendor: ${vendor.name}`);
    }

    console.log('--- Migrating Users ---');
    for (const user of data.users) {
        const { error } = await supabase.from('users').upsert(user);
        if (error) console.error(`Error migrating user ${user.name}:`, error);
        else console.log(`Migrated user: ${user.name}`);
    }

    console.log('--- Migrating Daily Meals ---');
    for (const meal of data.daily_meals) {
        // Map keys if they differ (limit -> slots_limit)
        const mealData = {
            id: meal.id,
            date: meal.date,
            vendor_id: meal.vendor_id,
            meal_name: meal.meal_name,
            slots_limit: meal.limit,
            remaining: meal.remaining,
            cutoff: meal.cutoff,
            credit_cost: meal.credit_cost || 1
        };
        const { error } = await supabase.from('daily_meals').upsert(mealData);
        if (error) console.error(`Error migrating meal ${meal.id}:`, error);
        else console.log(`Migrated meal: ${meal.id}`);
    }

    console.log('--- Migrating Reservations ---');
    for (const res of data.reservations) {
        const { error } = await supabase.from('reservations').upsert(res);
        if (error) console.error(`Error migrating reservation ${res.id}:`, error);
        else console.log(`Migrated reservation: ${res.id}`);
    }

    console.log('Migration complete! Check Supabase dashboard.');
}

migrate();
