'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    // Check if user session gets automatically set via the #access_token fragment from Supabase link
    useEffect(() => {
        // By the time this component mounts, supabase-js automatically reads the URL hash tokens 
        // and establishes a session if valid.
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Maybe hash was missing or expired
                // setError("Invalid or expired password reset link. Please request a new one.");
            }
        };
        checkSession();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        setError(null);

        // This uses the session token parsed from the URL fragment (thanks to PKCE/Implicit Flow)
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Optionally redirect after a few seconds
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div
                    className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center space-y-6 animate-fade-in-up"
                >
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Password Updated!</h2>
                    <p className="text-slate-500">Your password has been successfully reset. You will be redirected to the login page shortly.</p>
                    <Link href="/auth/login" className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold transition-all hover:bg-slate-800 mt-4">
                        Continue to Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div
                className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md space-y-8 border border-slate-100 animate-fade-in-up"
            >
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-800">Set New Password</h1>
                        <p className="text-slate-500 text-sm">Please enter your new password below</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <span>Update Password</span>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
