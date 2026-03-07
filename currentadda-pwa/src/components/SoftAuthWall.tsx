'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SoftAuthWallProps {
  children: React.ReactNode;
  previewCount?: number;
}

export default function SoftAuthWall({ children, previewCount = 2 }: SoftAuthWallProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // During SSR or while checking auth state, assume authenticated to allow SEO indexing 
  // (client will hide it milliseconds later if unauthenticated)
  if (isAuthenticated !== false) {
    return <>{children}</>;
  }

  // Not authenticated: Show blurred content and a call-to-action to login
  return (
    <div className="relative">
      {/* Blurred out content */}
      <div className="opacity-30 blur-sm pointer-events-none select-none overflow-hidden max-h-[400px]">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-slate-50 via-white/80 to-transparent">
        <div className="bg-white border border-indigo-100 shadow-xl rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-60"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100/50 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2 gujarati-text tracking-tight">
              Unlock Daily Notes
            </h3>
            
            <p className="text-sm font-medium text-slate-500 mb-6 gujarati-text leading-relaxed">
              વધુ પ્રશ્નો અને વિગતવાર સમજૂતી વાંચવા માટે મફત એકાઉન્ટ બનાવો અથવા લોગિન કરો.
            </p>

            <Link href="/auth/register" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              Sign Up for Free
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400">Already have an account?</span>
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 group flex items-center gap-0.5">
                Login
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
