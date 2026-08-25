'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Lock, Loader2, Phone, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { loginWithPhoneOrEmail } from '@/services/authService';

const MIGRATION_NOTE_KEY = 'migration_note_dismissed';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showMigrationNote, setShowMigrationNote] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const dismissed = localStorage.getItem(MIGRATION_NOTE_KEY);
        if (!dismissed) {
            setShowMigrationNote(true);
        }
    }, []);

    const dismissMigrationNote = () => {
        localStorage.setItem(MIGRATION_NOTE_KEY, 'true');
        setShowMigrationNote(false);
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginWithPhoneOrEmail({
                identifier,
                password,
            });

            // Mark migration note as dismissed once logged in
            localStorage.setItem(MIGRATION_NOTE_KEY, 'true');

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
            <div className="w-full max-w-md space-y-6 animate-fade-in-up">
                {/* Migration Alert Banner for Old Users (Shows only once) */}
                {showMigrationNote && (
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-5 relative overflow-hidden backdrop-blur-sm shadow-lg shadow-amber-500/5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-amber-700">
                                <div className="p-2 bg-amber-500/20 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-sm gujarati-text text-amber-900">
                                    જૂના યુઝર્સ માટે મહત્વપૂર્ણ સૂચના
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={dismissMigrationNote}
                                className="p-1 text-amber-600/70 hover:text-amber-900 hover:bg-amber-500/20 rounded-lg transition-all"
                                title="બંધ કરો"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs leading-relaxed text-amber-900/80 gujarati-text">
                            નવી સુરક્ષા સિસ્ટમ મુજબ, તમામ જૂના યુઝર્સે <strong className="text-amber-950">એકવાર ફરીથી પોતાના વોટ્સએપ નંબર સાથે નવું રજિસ્ટ્રેશન</strong> કરવું ફરજિયાત છે. ત્યાર બાદ તમે દર વખતે તમારા વોટ્સએપ નંબર અને પાસવર્ડ વડે સરળતાથી લોગિન કરી શકશો.
                        </p>

                        <div className="flex items-center justify-between pt-1 gap-2">
                            <Link
                                href="/auth/register"
                                onClick={dismissMigrationNote}
                                className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-amber-600/20 transition-all group"
                            >
                                <span className="gujarati-text">અહીં નવું રજિસ્ટ્રેશન કરો</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            <button
                                type="button"
                                onClick={dismissMigrationNote}
                                className="text-xs font-bold text-amber-800/80 hover:text-amber-950 gujarati-text px-2 py-1"
                            >
                                સમજાઈ ગયું
                            </button>
                        </div>
                    </div>
                )}

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
