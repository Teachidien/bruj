import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Fallback to dummy values so createClient doesn't crash during build or local dev without env vars
export const supabase = createClient(
  supabaseUrl || 'https://dummy-project.supabase.co', 
  supabaseAnonKey || 'dummy-anon-key'
);
