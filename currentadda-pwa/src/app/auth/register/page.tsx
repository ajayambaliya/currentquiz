'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2, Clock, MessageCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendWhatsAppRegistrationOtp, verifyWhatsAppOtpAndRegister } from '@/services/authService';
import { isValidIndianPhone, displayPhoneNumber } from '@/lib/phone-helper';

const RATE_LIMIT_KEY = 'signup_last_request';
const COOLDOWN_SECONDS = 60;

export default function RegisterPage() {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [formattedPhone, setFormattedPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const router = useRouter();

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

    // Step 1: Send WhatsApp OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા હોવા જોઈએ.");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.");
            setLoading(false);
            return;
        }

        if (!isValidIndianPhone(phone)) {
            setError("કૃપા કરીને સાચો 10-અંકનો વોટ્સએપ નંબર દાખલ કરો.");
            setLoading(false);
            return;
        }

        try {
            const res = await sendWhatsAppRegistrationOtp(phone);
            setFormattedPhone(res.formattedPhone);
            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
            setStep('otp');
        } catch (err: any) {
            setError(err.message || "OTP મોકલવામાં ભૂલ આવી. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP & Complete Registration
    const handleVerifyAndRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (otpCode.length < 6) {
            setError("કૃપા કરીને 6-અંકનો OTP કોડ દાખલ કરો.");
            setLoading(false);
            return;
        }

        try {
            await verifyWhatsAppOtpAndRegister({
                formattedPhone,
                otpCode,
                fullName,
                email,
                password,
            });

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "અમાન્ય OTP કોડ. કૃપા કરીને ફરી તપાસો.");
        } finally {
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
                    <h2 className="text-2xl font-bold text-slate-800 gujarati-text">એકાઉન્ટ સફળતાપૂર્વક બન્યું!</h2>
                    <div className="space-y-3 text-slate-600">
                        <p className="gujarati-text leading-relaxed">
                            🎉 <span className="font-bold text-slate-700">{fullName}</span>, તમારું વોટ્સએપ વેરીફાઈડ એકાઉન્ટ તૈયાર થઈ ગયું છે!
                        </p>
                        <p className="gujarati-text leading-relaxed">
                            તમે વોટ્સએપ નંબર <span className="font-bold text-emerald-600">{displayPhoneNumber(formattedPhone)}</span> વડે રજિસ્ટર થયેલ છો.
                        </p>
                        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <p className="text-sm gujarati-text text-indigo-700 font-medium">
                                📚 GPSC, GSSSB, તલાટી અને અન્ય તમામ સ્પર્ધાત્મક પરીક્ષાઓ માટે દરરોજ નવા ક્વિઝ ઉપલબ્ધ છે!
                            </p>
                        </div>
                    </div>
                    <Link href="/profile" className="block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        તમારી પ્રોફાઇલ જુઓ
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
                className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md space-y-8 border border-slate-100 relative overflow-hidden"
            >
                <div className="text-center space-y-3">
                    <div className="relative w-20 h-20 mx-auto">
                        <Image
                            src="/newlogo.png"
                            alt="CurrentAdda Logo"
                            width={80}
                            height={80}
                            className="object-contain mx-auto"
                            priority
                        />
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <MessageCircle className="w-4 h-4 fill-white text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800">Create Account</h1>
                        <p className="text-slate-500 text-xs font-medium mt-0.5">Join CurrentAdda with WhatsApp Verification</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="gujarati-text">{error}</p>
                    </div>
                )}

                {cooldownRemaining > 0 && step === 'details' && (
                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-700 text-sm">
                        <Clock className="w-5 h-5 flex-shrink-0" />
                        <p>કૃપા કરીને ફરી પ્રયાસ કરતા પહેલા {cooldownRemaining} સેકન્ડ રાહ જુઓ.</p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOtp}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        placeholder="Ajay Ambaliya"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                        placeholder="name@gmail.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
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
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-24 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 transition-all"
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Min 6 characters"
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
                                        minLength={6}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Re-enter password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || cooldownRemaining > 0 || phone.length < 10}
                                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : cooldownRemaining > 0 ? (
                                    <>
                                        <Clock className="w-5 h-5" />
                                        <span>Wait {cooldownRemaining}s</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="gujarati-text">વોટ્સએપ OTP મેળવો</span>
                                        <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyAndRegister}
                            className="space-y-5"
                        >
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center space-y-1">
                                <p className="text-xs font-bold text-emerald-800 gujarati-text">
                                    વોટ્સએપ OTP કોડ મોકલાઈ ગયો છે
                                </p>
                                <p className="text-sm font-black text-emerald-700">
                                    {displayPhoneNumber(formattedPhone)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Enter 6-Digit WhatsApp OTP
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('details');
                                            setError(null);
                                        }}
                                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        વિગતો બદલો
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otpCode.length < 6}
                                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="gujarati-text">વેરીફાઈ કરી સાઈન આપ પૂર્ણ કરો</span>
                                    </>
                                )}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-center text-slate-500 text-sm">
                    Already have an account? {' '}
                    <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </motion.div>
        </main>
    );
}
