'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { sendExistingUserWhatsAppOtp, verifyExistingUserWhatsApp } from '@/services/authService';
import { formatPhoneNumber, isValidIndianPhone } from '@/lib/phone-helper';
import { MessageCircle, ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const COOLDOWN_SECONDS = 60;

export default function WhatsAppVerificationGuard() {
  const { user, profile, loading: authLoading, isWhatsAppVerified, refreshProfile } = useAuth();
  const pathname = usePathname();

  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Skip guard on auth pages or when unauthenticated
  const isAuthPage = pathname?.startsWith('/auth/');
  const shouldShowGuard = !authLoading && !!user && !isWhatsAppVerified && !isAuthPage;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!shouldShowGuard) {
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidIndianPhone(phone)) {
      setError('કૃપા કરીને સાચો 10-અંકનો વોટ્સએપ નંબર દાખલ કરો.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendExistingUserWhatsAppOtp(phone, user?.id);
      setFormattedPhone(res.formattedPhone);
      setStep('otp');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || 'OTP મોકલવામાં નિષ્ફળતા મળી.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length < 6) {
      setError('કૃપા કરીને 6-અંકનો OTP દર્શાવો.');
      return;
    }

    setSubmitting(true);
    try {
      await verifyExistingUserWhatsApp({
        formattedPhone,
        otpCode: otp,
        userId: user.id,
        fullName: profile?.full_name || user.user_metadata?.full_name || 'Candidate',
        email: profile?.email || user.email || undefined,
      });

      await refreshProfile();
    } catch (err: any) {
      setError(err.message || 'અમાન્ય OTP. કૃપા કરીને સાચો કોડ લખો.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <MessageCircle className="w-8 h-8 fill-emerald-500 text-emerald-500" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 gujarati-text tracking-tight">
                વોટ્સએપ વેરીફીકેશન જરૂરી છે
              </h2>
              <p className="text-xs text-slate-500 font-medium gujarati-text leading-relaxed">
                તમારા એકાઉન્ટને સુરક્ષિત રાખવા માટે વોટ્સએપ નંબર ચકાસવો ફરજિયાત છે.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-medium">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="gujarati-text">{error}</p>
            </div>
          )}

          {/* Form Wizard */}
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
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
                    className="w-full pl-24 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 transition-all placeholder:font-normal"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || phone.length < 10}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="gujarati-text">વોટ્સએપ પર OTP મેળવો</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Enter 6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setError(null);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    નંબર બદલો
                  </button>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="000000"
                />
                <p className="text-center text-xs text-slate-400 font-medium">
                  {formattedPhone} પર મોકલેલ કોડ અહીં લખો
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length < 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span className="gujarati-text">ખરાઈ કરો અને આગળ વધો</span>
                  </>
                )}
              </button>

              {cooldown > 0 ? (
                <p className="text-center text-xs text-slate-400 font-medium">
                  ફરી OTP મોકલવા માટે {cooldown} સેકન્ડ રાહ જુઓ
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={submitting}
                  className="w-full text-center text-xs font-bold text-emerald-600 hover:underline py-1"
                >
                  ફરીથી OTP મોકલો (Resend OTP)
                </button>
              )}
            </form>
          )}

          {/* Footer sign out option */}
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs relative z-10">
            <span className="text-slate-400 font-medium">બીજું એકાઉન્ટ લોગિન કરવું છે?</span>
            <button
              onClick={handleLogout}
              className="text-rose-500 font-bold hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              લોગ આઉટ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
