'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Lock, Loader2, Phone } from 'lucide-react';
import { loginWithPhoneOrEmail } from '@/services/authService';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginWithPhoneOrEmail({
                identifier,
                password,
            });

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'મોબાઇલ નંબર / ઈમેલ અથવા પાસવર્ડ ખોટો છે.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                    {/* Brand Header */}
                    <div className="text-center space-y-3">
                        <div className="relative w-20 h-20 mx-auto">
                            <Image
                                src="/newlogo.png"
                                alt="CurrentAdda Logo"
                                width={80}
                                height={80}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
                            <p className="text-slate-500 text-xs font-medium gujarati-text">મોબાઈલ નંબર અને પાસવર્ડ દાખલ કરીને લોગિન કરો</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-medium">
                            <p className="gujarati-text">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 gujarati-text">
                                મોબાઈલ નંબર (Mobile Number)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={10}
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="10 અંકનો મોબાઈલ નંબર (દા.ત. 9876543210)"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest gujarati-text">પાસવર્ડ (Password)</label>
                                <Link href="/auth/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline gujarati-text">
                                    પાસવર્ડ ભૂલી ગયા?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="તમારો પાસવર્ડ દાખલ કરો"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span className="gujarati-text">લોગિન કરો</span>
                                    <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer register link */}
                    <p className="text-center text-slate-500 text-xs font-medium">
                        નવું એકાઉન્ટ બનાવવું છે? {' '}
                        <Link href="/auth/register" className="text-indigo-600 font-black hover:underline gujarati-text">
                            અહીં રજિસ્ટર કરો
                        </Link>
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        CurrentAdda &bull; Empowering Aspirants
                    </p>
                </div>
            </div>
        </main>
    );
}
