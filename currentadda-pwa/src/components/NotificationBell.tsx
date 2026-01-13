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
        const initOneSignal = async () => {
            if (typeof window === 'undefined') return;

            const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
            if (!appId) {
                console.error("❌ NEXT_PUBLIC_ONESIGNAL_APP_ID is missing!");
                setLoading(false);
                return;
            }

            if ((window as any).OneSignalInitStarted) {
                // Wait for existing initialization to complete
                let attempts = 0;
                const checkReady = setInterval(() => {
                    if ((OneSignal as any).initialized) {
                        setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
                        setLoading(false);
                        clearInterval(checkReady);
                    }
                    if (attempts++ > 10) { // Max 10 attempts (5 seconds)
                        setLoading(false);
                        clearInterval(checkReady);
                    }
                }, 500);
                return;
            }
            (window as any).OneSignalInitStarted = true;

            const safetyTimeout = setTimeout(() => {
                console.warn("⏳ OneSignal init timed out (7s).");
                setLoading(false);
            }, 7000);

            try {
                console.log("🚀 Initializing OneSignal...");
                await OneSignal.init({
                    appId: appId,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerParam: { scope: '/' },
                    serviceWorkerPath: 'OneSignalSDKWorker.js',
                });

                console.log("✅ OneSignal Ready");
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);

                OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                        new Notification(event.notification.title || "New Quiz", {
                            body: event.notification.body,
                            icon: "/newlogo.png"
                        });
                    }
                });

            } catch (error: any) {
                console.error('❌ OneSignal Init Error:', error);
            } finally {
                clearTimeout(safetyTimeout);
                setLoading(false);
            }
        };

        const timer = setTimeout(initOneSignal, 500); // Small delay to let page settle

        const poller = setInterval(() => {
            if ((OneSignal as any).initialized) {
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

        if (!(OneSignal as any).initialized) {
            // Check if App ID is missing
            if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
                alert("સીસ્ટમ એરર: App ID મળ્યું નથી. કૃપા કરીને Vercel માં Environment Variable ચેક કરો.");
            } else {
                alert("નોટિફિકેશન સિસ્ટમ હજી તૈયાર નથી. કૃપા કરીને પેજ રીફ્રેશ કરો અથવા થોડીવાર પછી પ્રયત્ન કરો.");
            }
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
                await OneSignal.User.PushSubscription.optIn();
                setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
            }
        } catch (error) {
            console.error('❌ Toggle Error:', error);
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

                {/* Status Indicator */}
                {!loading && (
                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white
            ${isSubscribed ? 'bg-green-500' : 'bg-slate-300'}`}
                    />
                )}
            </motion.button>

            {/* Premium Tooltip */}
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
