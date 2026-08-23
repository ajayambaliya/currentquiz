import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

export function getProxiedImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (typeof window !== 'undefined' && supabaseUrl) {
        try {
            const host = new URL(supabaseUrl).hostname;
            if (url.includes(host)) {
                return url.replace(`https://${host}`, '/supabase-proxy');
            }
        } catch {
            // fallback
        }
    }
    return url;
}
