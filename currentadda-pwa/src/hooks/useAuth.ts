'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
    id: string;
    full_name: string;
    email?: string | null;
    whatsapp_number?: string | null;
    is_whatsapp_verified: boolean;
    avatar_url?: string | null;
    streak_count?: number;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error loading user profile:', error);
            }
            if (data) {
                setProfile(data as UserProfile);
            } else {
                setProfile(null);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                fetchProfile(currentUser.id).finally(() => {
                    if (mounted) setLoading(false);
                });
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

    const isVerified = Boolean(user?.email_confirmed_at);
    const isWhatsAppVerified = Boolean(profile?.is_whatsapp_verified);

    return { 
        user, 
        profile, 
        loading, 
        isVerified, 
        isWhatsAppVerified,
        whatsappNumber: profile?.whatsapp_number || null,
        refreshProfile 
    };
}

