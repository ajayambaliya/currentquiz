'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Lock, Loader2, Phone, AlertTriangle, ArrowRight, X, MessageCircle, ShieldCheck, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loginWithPhoneOrEmail, sendWhatsAppLoginOtp, verifyWhatsAppLoginOtp } from '@/services/authService';
import { isValidIndianPhone, displayPhoneNumber } from '@/lib/phone-helper';

const MIGRATION_NOTE_KEY = 'migration_note_dismissed';

export default function LoginPage() {
    const [loginTab, setLoginTab] = useState<'password' | 'otp'>('password');
    
    // Password Login State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    
    // WhatsApp OTP Login State
    const [otpPhone, setOtpPhone] = useState('');
    const [formattedOtpPhone, setFormattedOtpPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
    const [otpCooldown, setOtpCooldown] = useState(0);

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

    // OTP Resend Cooldown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpCooldown > 0) {
            timer = setInterval(() => {
                setOtpCooldown((prev) => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [otpCooldown]);

    const dismissMigrationNote = () => {
        localStorage.setItem(MIGRATION_NOTE_KEY, 'true');
        setShowMigrationNote(false);
    };

    // 1. Password Login Handler
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await loginWithPhoneOrEmail({
                identifier,
                password,
            });

            localStorage.setItem(MIGRATION_NOTE_KEY, 'true');
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'મોબાઇલ નંબર / ઈમેલ અથવા પાસવર્ડ ખોટો છે.');
        } finally {
            setLoading(false);
        }
    };

    // 2. WhatsApp OTP Step 1: Send OTP
    const handleSendOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!isValidIndianPhone(otpPhone)) {
            setError('કૃપા કરીને માન્ય 10-અંકનો વોટ્સએપ મોબાઈલ નંબર દાખલ કરો.');
            setLoading(false);
            return;
        }

        try {
            const res = await sendWhatsAppLoginOtp(otpPhone);
            setFormattedOtpPhone(res.formattedPhone);
            setOtpStep('code');
            setOtpCooldown(60);
        } catch (err: any) {
            setError(err.message || 'OTP મોકલવામાં સમસ્યા આવી. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.');
        } finally {
            setLoading(false);
        }
    };

    // 3. WhatsApp OTP Step 2: Verify OTP
    const handleVerifyOtpLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        if (otpCode.trim().length < 6) {
            setError('કૃપા કરીને 6-અંકનો OTP કોડ દાખલ કરો.');
            setLoading(false);
            return;
        }

        try {
            await verifyWhatsAppLoginOtp(formattedOtpPhone, otpCode.trim());
            localStorage.setItem(MIGRATION_NOTE_KEY, 'true');
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'અમાન્ય અથવા એક્સપાયર થયેલ OTP કોડ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 animate-fade-in-up">
                {/* Migration Alert Banner for Old Users */}
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
                            જો તમે પહેલા રજિસ્ટર થયેલ છો અથવા પાસવર્ડ સેટ કરેલ નથી, તો તમે નીચેના <strong className="text-amber-950">"વોટ્સએપ OTP"</strong> ટેબ વડે સીધું ૧-ક્લિક લોગિન કરી શકો છો અથવા પાસવર્ડ રીસેટ કરી શકો છો.
                        </p>

                        <div className="flex items-center justify-between pt-1 gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginTab('otp');
                                    dismissMigrationNote();
                                }}
                                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all group"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="gujarati-text">વોટ્સએપ OTP વડે લોગિન કરો</span>
                            </button>
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
                            <p className="text-slate-500 text-xs font-medium gujarati-text">CurrentAdda માં આપનું સ્વાગત છે</p>
                        </div>
                    </div>

                    {/* Method Switcher Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                        <button
                            type="button"
                            onClick={() => { setLoginTab('password'); setError(null); }}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                loginTab === 'password'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>પાસવર્ડ લોગિન</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginTab('otp'); setError(null); }}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                loginTab === 'otp'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>વોટ્સએપ OTP</span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-medium space-y-2">
                            <p className="gujarati-text">{error}</p>
                            {loginTab === 'password' && (
                                <div className="pt-1 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginTab('otp'); setError(null); }}
                                        className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3 text-emerald-600" />
                                        <span>વોટ્સએપ OTP વડે લોગિન કરો</span>
                                    </button>
                                    <Link href="/auth/forgot-password" className="font-bold text-indigo-600 hover:underline">
                                        પાસવર્ડ રીસેટ
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 1: Password Login Form */}
                    {loginTab === 'password' && (
                        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 gujarati-text">
                                    મોબાઈલ નંબર / ઈમેલ (Mobile or Email)
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold placeholder:font-normal placeholder:text-slate-400"
                                        placeholder="10 અંકનો મોબાઈલ નંબર અથવા ઈમેલ"
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
                    )}

                    {/* Tab 2: 1-Click WhatsApp OTP Login Form */}
                    {loginTab === 'otp' && (
                        <div className="space-y-4 animate-fade-in">
                            {otpStep === 'phone' ? (
                                <form onSubmit={handleSendOtpLogin} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                            <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                            WhatsApp Mobile Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-slate-200 pr-3">
                                                <span className="text-lg">🇮🇳</span>
                                                <span className="text-sm font-bold text-slate-600">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                value={otpPhone}
                                                onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-24 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 transition-all"
                                                placeholder="98765 43210"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otpPhone.length < 10}
                                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <span className="gujarati-text">વોટ્સએપ OTP મેળવો</span>
                                                <MessageCircle className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtpLogin} className="space-y-4">
                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center space-y-1">
                                        <p className="text-xs font-bold text-emerald-800 gujarati-text">
                                            વોટ્સએપ OTP કોડ મોકલાઈ ગયો છે
                                        </p>
                                        <p className="text-sm font-black text-emerald-700">
                                            {displayPhoneNumber(formattedOtpPhone)}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                Enter 6-Digit OTP
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOtpStep('phone');
                                                    setError(null);
                                                }}
                                                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                                નંબર બદલો
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3.5 bg-slate-50 border-none rounded-2xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
                                            placeholder="000000"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otpCode.length < 6}
                                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <ShieldCheck className="w-5 h-5" />
                                                <span className="gujarati-text">વેરીફાઈ કરી લોગિન કરો</span>
                                            </>
                                        )}
                                    </button>

                                    {otpCooldown > 0 ? (
                                        <p className="text-center text-xs text-slate-400 font-medium">
                                            ફરી OTP મોકલવા માટે {otpCooldown} સેકન્ડ રાહ જુઓ
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSendOtpLogin}
                                            disabled={loading}
                                            className="w-full text-center text-xs font-bold text-emerald-600 hover:underline py-1"
                                        >
                                            ફરીથી OTP મોકલો (Resend OTP)
                                        </button>
                                    )}
                                </form>
                            )}
                        </div>
                    )}

                    {/* Footer register link */}
                    <p className="text-center text-slate-500 text-xs font-medium">
                        નવું એકાઉન્ટ બનાવવું છે? {' '}
                        <Link href="/auth/register" className="text-indigo-600 font-black hover:underline gujarati-text">
                            અહીં રજિસ્ટર કરો
                        </Link>
                    </p>

                    {/* WhatsApp Support / Help Box */}
                    <div className="pt-2 border-t border-slate-100">
                        <a
                            href="https://wa.me/918000212153?text=નમસ્તે%20CurrentAdda%20Team%2C%20મને%20લોગિન%2Fએપમાં%20સમસ્યા%20આવી%20રહી%20છે.%20(સ્ક્રીનશોટ%20સાથે)"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all group shadow-sm hover:shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                    <MessageCircle className="w-5 h-5 fill-white" />
                                </div>
                                <div className="text-left space-y-0.5">
                                    <p className="text-xs font-bold text-emerald-950 gujarati-text">
                                        કોઈપણ સમસ્યા હોય તો વોટ્સએપ કરો
                                    </p>
                                    <p className="text-[11px] text-emerald-800 leading-tight gujarati-text">
                                        સ્ક્રીનશોટ સાથે મેસેજ કરો: <span className="font-black text-emerald-900 tracking-wide font-mono">8000212153</span>
                                    </p>
                                </div>
                            </div>
                            <span className="text-[11px] font-bold bg-emerald-600 group-hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition-colors flex-shrink-0 shadow-sm">
                                Help
                            </span>
                        </a>
                    </div>
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
