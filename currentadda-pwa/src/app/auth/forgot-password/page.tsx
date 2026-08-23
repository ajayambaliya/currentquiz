'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2, Lock, MessageCircle, ShieldCheck, Phone } from 'lucide-react';
import { sendWhatsAppPasswordResetOtp, verifyWhatsAppOtpAndResetPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [method, setMethod] = useState<'whatsapp' | 'email'>('whatsapp');
    
    // WhatsApp Reset State
    const [phone, setPhone] = useState('');
    const [formattedPhone, setFormattedPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whatsappStep, setWhatsappStep] = useState<'phone' | 'otp'>('phone');

    // Email Reset State
    const [email, setEmail] = useState('');
    const [emailSuccess, setEmailSuccess] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [whatsappSuccess, setWhatsappSuccess] = useState(false);

    // Step 1: Send WhatsApp Reset OTP
    const handleSendWhatsappOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await sendWhatsAppPasswordResetOtp(phone);
            setFormattedPhone(res.formattedPhone);
            setWhatsappStep('otp');
        } catch (err: any) {
            setError(err.message || 'OTP મોકલવામાં સમસ્યા આવી.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify WhatsApp OTP and set new password
    const handleResetWithOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('બંને પાસવર્ડ સરખા હોવા જોઈએ.');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરનો હોવો જોઈએ.');
            setLoading(false);
            return;
        }

        try {
            await verifyWhatsAppOtpAndResetPassword({
                formattedPhone,
                otpCode,
                newPassword,
            });

            setWhatsappSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'પાસવર્ડ રીસેટ કરવામાં સમસ્યા આવી.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Email Reset
    const handleEmailReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setEmailSuccess(true);
            setLoading(false);
        }
    };

    if (whatsappSuccess) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center space-y-6 animate-fade-in-up">
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 gujarati-text">પાસવર્ડ બદલાઈ ગયો છે!</h2>
                    <p className="text-slate-500 text-xs font-medium gujarati-text">
                        તમારો નવો પાસવર્ડ સફળતાપૂર્વક સેટ થઈ ગયો છે. થોડીવારમાં લોગિન પેજ પર લઈ જવામાં આવશે.
                    </p>
                    <Link href="/auth/login" className="block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold gujarati-text">
                        લોગિન પેજ પર જાઓ
                    </Link>
                </div>
            </main>
        );
    }

    if (emailSuccess) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md text-center space-y-6 animate-fade-in-up">
                    <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Check your email</h2>
                    <p className="text-slate-500 text-xs">We've sent a password reset link to <span className="font-bold text-slate-700">{email}</span>.</p>
                    <Link href="/auth/login" className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">
                        Back to Login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md space-y-6 border border-slate-100 animate-fade-in-up">
                {/* Header */}
                <div className="space-y-3">
                    <Link href="/auth/login" className="inline-flex items-center text-slate-400 hover:text-indigo-600 transition-colors gap-2 text-xs font-bold">
                        <ArrowLeft className="w-4 h-4" /> <span className="gujarati-text">પાછા લોગિન પર જાઓ</span>
                    </Link>
                    <div className="text-center space-y-2">
                        <div className="relative w-16 h-16 mx-auto">
                            <Image
                                src="/newlogo.png"
                                alt="CurrentAdda Logo"
                                width={64}
                                height={64}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight gujarati-text">પાસવર્ડ રીસેટ કરો</h1>
                        <p className="text-slate-500 text-xs font-medium gujarati-text">નવો પાસવર્ડ સેટ કરવા માટે વિકલ્પ પસંદ કરો</p>
                    </div>
                </div>

                {/* Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                    <button
                        type="button"
                        onClick={() => { setMethod('whatsapp'); setError(null); }}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            method === 'whatsapp'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>વોટ્સએપ OTP</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMethod('email'); setError(null); }}
                        className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            method === 'email'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Mail className="w-3.5 h-3.5" />
                        <span>ઈમેલ લિંક</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-xs font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="gujarati-text">{error}</p>
                    </div>
                )}

                {/* WhatsApp OTP Method */}
                {method === 'whatsapp' && (
                    <div className="space-y-4">
                        {whatsappStep === 'phone' ? (
                            <form onSubmit={handleSendWhatsappOtp} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        તમારો વોટ્સએપ મોબાઈલ નંબર
                                    </label>
                                    <div className="flex rounded-2xl bg-slate-50 overflow-hidden border border-slate-200/50 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                        <span className="inline-flex items-center px-4 bg-slate-100 text-slate-500 font-bold text-sm border-r border-slate-200">
                                            🇮🇳 +91
                                        </span>
                                        <input
                                            type="tel"
                                            required
                                            maxLength={10}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3.5 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold tracking-wider text-sm"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || phone.length !== 10}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span className="gujarati-text">વોટ્સએપ પર રીસેટ OTP મેળવો</span>
                                            <MessageCircle className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetWithOtp} className="space-y-4">
                                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-center">
                                    <p className="text-xs text-emerald-800 font-medium gujarati-text">
                                        OTP મોકલાઈ ગયો છે: <span className="font-bold">{phone}</span>
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        6-અંકનો OTP કોડ
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full py-3.5 text-center tracking-[0.4em] text-xl font-black bg-slate-50 border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono"
                                        placeholder="000000"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        નવો પાસવર્ડ
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            placeholder="ઓછામાં ઓછા 6 અક્ષર"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        કન્ફર્મ નવો પાસવર્ડ
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm"
                                            placeholder="ફરીથી નવો પાસવર્ડ દાખલ કરો"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otpCode.length !== 6}
                                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span className="gujarati-text">નવો પાસવર્ડ સેટ કરો</span>
                                            <ShieldCheck className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Email Method */}
                {method === 'email' && (
                    <form onSubmit={handleEmailReset} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">ઈમેલ સરનામું</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                    placeholder="name@gmail.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <span className="gujarati-text">રીસેટ લિંક મોકલો</span>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
