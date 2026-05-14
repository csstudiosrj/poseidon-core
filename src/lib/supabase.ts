import { createClient } from '@supabase/supabase-js';

// Essas chaves a Vercel já tem, mas o código precisa saber que elas existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);