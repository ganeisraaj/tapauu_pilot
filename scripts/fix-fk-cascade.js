const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixForeignKey() {
    console.log('Fixing daily_meals_vendor_id_fkey with ON DELETE CASCADE...');

    const sql = `
        ALTER TABLE daily_meals
            DROP CONSTRAINT IF EXISTS daily_meals_vendor_id_fkey;

        ALTER TABLE daily_meals
            ADD CONSTRAINT daily_meals_vendor_id_fkey
            FOREIGN KEY (vendor_id)
            REFERENCES vendors(id)
            ON DELETE CASCADE;
    `;

    const { error } = await supabase.rpc('exec_sql', { query: sql }).catch(() => ({ error: { message: 'rpc not available' } }));

    if (error) {
        // Fallback: print the SQL for manual execution
        console.warn('Could not run via RPC. Please run the following SQL in the Supabase SQL Editor:\n');
        console.log('------------------------------------------------------');
        console.log(sql.trim());
        console.log('------------------------------------------------------');
    } else {
        console.log('✅ Foreign key constraint updated successfully!');
    }
}

fixForeignKey();
