import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngmtfxjvvxfjeopwsvls.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

export function getProxiedImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (typeof window !== 'undefined' && url.includes('ngmtfxjvvxfjeopwsvls.supabase.co')) {
        return url.replace('https://ngmtfxjvvxfjeopwsvls.supabase.co', '/supabase-proxy');
    }
    return url;
}
