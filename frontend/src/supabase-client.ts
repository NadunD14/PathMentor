import { createClient } from '@supabase/supabase-js';
import { Database } from './lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
    throw new Error('Missing Supabase URL');
}
else if (!supabaseAnonKey) {
    throw new Error('Missing Supabase Anon Key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);