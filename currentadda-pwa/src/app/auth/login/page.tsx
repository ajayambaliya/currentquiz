'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogIn, Mail, Lock, Loader2, MessageCircle, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { loginWithPhoneOrEmail, sendWhatsAppLoginOtp, verifyWhatsAppLoginOtp } from '@/services/authService';
import { isValidIndianPhone, formatPhoneNumber } from '@/lib/phone-helper';

export default function LoginPage() {
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    
    // Password Login State
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    
    // OTP Login State
    const [otpPhone, setOtpPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpStep, setOtpStep] = useState<'phone' | 'code'>('phone');
    const [formattedOtpPhone, setFormattedOtpPhone] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Handle Password Login (Phone or Email)
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
            setError(err.message || 'લોગિન કરવામાં સમસ્યા આવી. કૃપા કરીને વિગતો તપાસો.');
        } finally {
            setLoading(false);
        }
    };

    // Handle WhatsApp OTP Send
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await sendWhatsAppLoginOtp(otpPhone);
            setFormattedOtpPhone(res.formattedPhone);
            setOtpStep('code');
        } catch (err: any) {
            setError(err.message || 'OTP મોકલવામાં સમસ્યા આવી.');
        } finally {
            setLoading(false);
        }
    };

    // Handle WhatsApp OTP Verify
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await verifyWhatsAppLoginOtp(formattedOtpPhone, otpCode);
            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'અમાન્ય OTP કોડ.');
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
                            <p className="text-slate-500 text-xs font-medium">કરંટ અફેર્સ અને ક્વિઝ માટે લોગિન કરો</p>
                        </div>
                    </div>

                    {/* Method Switcher Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                        <button
                            type="button"
                            onClick={() => { setLoginMethod('password'); setError(null); }}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                loginMethod === 'password'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span>પાસવર્ડ વડે</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginMethod('otp'); setError(null); }}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                loginMethod === 'otp'
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>વોટ્સએપ OTP</span>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-medium">
                            <p className="gujarati-text">{error}</p>
                        </div>
                    )}

                    {/* Tab 1: Password Login */}
                    {loginMethod === 'password' && (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                    મોબાઈલ નંબર અથવા ઈમેલ
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
                                        placeholder="9876543210 અથવા email@gmail.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">પાસવર્ડ</label>
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
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                        placeholder="••••••••"
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

                    {/* Tab 2: 1-Click WhatsApp OTP Login */}
                    {loginMethod === 'otp' && (
                        <div className="space-y-4">
                            {otpStep === 'phone' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            વોટ્સએપ મોબાઈલ નંબર
                                        </label>
                                        <div className="flex rounded-2xl bg-slate-50 overflow-hidden border border-slate-200/50 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                            <span className="inline-flex items-center px-4 bg-slate-100 text-slate-500 font-bold text-sm border-r border-slate-200">
                                                🇮🇳 +91
                                            </span>
                                            <input
                                                type="tel"
                                                required
                                                maxLength={10}
                                                value={otpPhone}
                                                onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold tracking-wider placeholder:font-normal text-sm"
                                                placeholder="9876543210"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otpPhone.length !== 10}
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
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-center">
                                        <p className="text-xs text-emerald-800 font-medium gujarati-text">
                                            OTP મોકલાઈ ગયો છે: <span className="font-bold">{otpPhone}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            6-અંકનો OTP કોડ દાખલ કરો
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            className="w-full py-4 text-center tracking-[0.5em] text-2xl font-black bg-slate-50 border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono"
                                            placeholder="000000"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otpCode.length !== 6}
                                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <span className="gujarati-text">વેરીફાઈ અને લોગિન</span>
                                                <ShieldCheck className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setOtpStep('phone'); setOtpCode(''); }}
                                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 gujarati-text py-1"
                                    >
                                        નંબર બદલો
                                    </button>
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
