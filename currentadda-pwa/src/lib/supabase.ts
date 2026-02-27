import { createClient } from '@supabase/supabase-js';

const isClient = typeof window !== 'undefined';
// Use Next.js rewrite proxy dynamically with window.location.origin on the client
// to bypass ISP blocks in India and provide a valid absolute URL for Supabase DB client.
const supabaseUrl = isClient
    ? `${window.location.origin}/supabase-proxy`
    : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
