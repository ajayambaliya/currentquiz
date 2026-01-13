'use client';

import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Poll for OneSignal presence and subscription status
        const checkStatus = () => {
            if (typeof window !== 'undefined' && OneSignal.User?.PushSubscription) {
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
                setLoading(false);
                return true;
            }
            return false;
        };

        // Try immediately
        if (checkStatus()) return;

        // Otherwise poll until ready or timeout
        const interval = setInterval(() => {
            if (checkStatus()) clearInterval(interval);
        }, 1000);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            setLoading(false);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const handleToggleNotifications = async () => {
        if (loading) return;

        // Check if SDK is actually available
        if (!OneSignal.User?.PushSubscription) {
            alert("નોટિફિકેશન સિસ્ટમ હજી તૈયાર નથી. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.");
            return;
        }

        setLoading(true);
        try {
            if (isSubscribed) {
                await OneSignal.User.PushSubscription.optOut();
                setIsSubscribed(false);
            } else {
                const permission = await OneSignal.Notifications.permission;
                if ((permission as any) === 'denied') {
                    alert("તમે નોટિફિકેશન બ્લોક કરેલ છે. બ્રાઉઝર સેટિંગ્સમાં જઈને 'Allow' કરો.");
                    setLoading(false);
                    return;
                }

                await OneSignal.Notifications.requestPermission();

                // OneSignal.optIn is the modern way to ensure they are active
                await OneSignal.User.PushSubscription.optIn();

                // Wait for sync
                await new Promise(r => setTimeout(r, 2000));
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
            }
        } catch (error) {
            console.error('❌ OneSignal Error:', error);
            alert("કંઈક ભૂલ થઈ છે. કૃપા કરીને રીફ્રેશ કરો.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={handleToggleNotifications}
                disabled={loading}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center relative
          ${isSubscribed
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-indigo-600'
                    }`}
            >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isSubscribed ? (
                    <Bell className="w-5 h-5 fill-indigo-600/10" />
                ) : (
                    <BellOff className="w-5 h-5" />
                )}

                {!loading && (
                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white
            ${isSubscribed ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                )}
            </motion.button>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-3 w-48 p-3 bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl z-[60] text-[10px] font-bold text-slate-600 leading-tight"
                    >
                        {isSubscribed
                            ? "તમે નોટિફિકેશન મેળવી રહ્યા છો!"
                            : "નવી ક્વિઝ માટે નોટિફિકેશન ચાલુ કરો."}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
