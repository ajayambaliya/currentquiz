'use client';

import { useState, useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSdkReady, setIsSdkReady] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const initAttempted = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (initAttempted.current) return;
        initAttempted.current = true;

        const initOneSignal = async () => {
            const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
            if (!appId) {
                console.error("❌ OneSignal App ID missing (NEXT_PUBLIC_ONESIGNAL_APP_ID)");
                setLoading(false);
                return;
            }

            try {
                console.log("🚀 OneSignal: Initializing with ID", appId);
                await OneSignal.init({
                    appId: appId,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerPath: '/OneSignalSDKWorker.js',
                });

                console.log("✅ OneSignal: Initialization successful");
                setIsSdkReady(true);

                const optedIn = OneSignal.User.PushSubscription.optedIn;
                setIsSubscribed(!!optedIn);

                OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                        new Notification(event.notification.title || "New Quiz", {
                            body: event.notification.body,
                            icon: "/newlogo.png"
                        });
                    }
                });

            } catch (error: any) {
                console.error('❌ OneSignal: Initialization failed', error);
                if (error?.message?.includes('already initialized')) {
                    console.log("ℹ️ OneSignal was already initialized.");
                    setIsSdkReady(true);
                    if (OneSignal.User?.PushSubscription) {
                        setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        // Small delay to ensure browser environment is stable
        const timer = setTimeout(initOneSignal, 1000);

        const poller = setInterval(() => {
            if (OneSignal.User?.PushSubscription) {
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
            }
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(poller);
        };
    }, []);

    const handleToggleNotifications = async () => {
        if (loading) return;

        if (!isSdkReady) {
            if (OneSignal.User?.PushSubscription) {
                setIsSdkReady(true);
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
            } else {
                alert("નોટિફિકેશન સિસ્ટમ હજી તૈયાર નથી. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.");
                return;
            }
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
                await OneSignal.User.PushSubscription.optIn();

                await new Promise(r => setTimeout(r, 1500));
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
            }
        } catch (error) {
            console.error('❌ OneSignal: Toggle failed', error);
            alert("કંઈક ભૂલ થઈ છે. કૃપા કરીને ફરીથી પ્રયત્ન કરો.");
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
                title={isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
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
                            ? "તમે નોટિફિકેશન મેળવી રહ્યા છો! નવી ક્વિઝ આવશે ત્યારે તમને સમાચાર મળશે."
                            : "નવી ક્વિઝ અપલોડ થાય ત્યારે તરત જાણવા માટે નોટિફિકેશન ચાલુ કરો."}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
