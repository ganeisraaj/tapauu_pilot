
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsers() {
    const { data, error } = await supabase.from('users').select('*').limit(5);
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Users found:', data?.length || 0);
        console.log('Sample User:', JSON.stringify(data?.[0] || {}, null, 2));
    }
}

checkUsers();
