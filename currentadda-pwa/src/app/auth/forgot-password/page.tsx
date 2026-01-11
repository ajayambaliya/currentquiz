'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const RATE_LIMIT_KEY = 'forgot_password_last_request';
const COOLDOWN_SECONDS = 60; // Match Supabase's 60-second cooldown

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // Check for existing cooldown on mount and set up interval
    useEffect(() => {
        const checkCooldown = () => {
            const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
            if (lastRequest) {
                const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
                const remainingTime = Math.max(0, COOLDOWN_SECONDS - Math.floor(timeSinceLastRequest / 1000));
                setCooldownRemaining(remainingTime);
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check client-side rate limit
        const lastRequest = localStorage.getItem(RATE_LIMIT_KEY);
        if (lastRequest) {
            const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
            if (timeSinceLastRequest < COOLDOWN_SECONDS * 1000) {
                const remainingSeconds = Math.ceil((COOLDOWN_SECONDS * 1000 - timeSinceLastRequest) / 1000);
                setError(`Please wait ${remainingSeconds} seconds before requesting another reset link.`);
                return;
            }
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            // Handle rate limit errors specifically
            if (error.message.toLowerCase().includes('rate limit') || 
                error.message.toLowerCase().includes('email rate') ||
                error.status === 429) {
                setError('Too many password reset attempts. Please wait a few minutes and try again. Supabase allows only 2 password reset emails per hour.');
            } else {
                setError(error.message);
            }
            setLoading(false);
        } else {
            // Store timestamp of successful request
            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center space-y-6"
                >
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Check your email</h2>
                    <p className="text-slate-500">We've sent a password reset link to <span className="font-bold text-slate-700">{email}</span>.</p>
                    <Link href="/auth/login" className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">
                        Back to Login
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md space-y-8 border border-slate-100"
            >
                <div className="space-y-4">
                    <Link href="/auth/login" className="inline-flex items-center text-slate-400 hover:text-indigo-600 transition-colors gap-2 text-sm font-bold">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold text-slate-800">Reset Password</h1>
                        <p className="text-slate-500 text-sm">Enter your email to receive reset instructions</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {cooldownRemaining > 0 && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-sm">
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        <p>Please wait {cooldownRemaining} seconds before requesting another reset link.</p>
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="name@gmail.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || cooldownRemaining > 0}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : cooldownRemaining > 0 ? (
                            <>
                                <Clock className="w-5 h-5" />
                                <span>Wait {cooldownRemaining}s</span>
                            </>
                        ) : (
                            <>
                                <span>Send Reset Link</span>
                                <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
