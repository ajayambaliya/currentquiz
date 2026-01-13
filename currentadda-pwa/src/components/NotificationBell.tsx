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
                console.warn("⚠️ OneSignal App ID not found in environment.");
                setLoading(false);
                return;
            }

            // Prevent double-initialization
            if ((window as any).OneSignalInitStarted) {
                // If already started elsewhere, check status and stop loading
                const checkInterval = setInterval(() => {
                    if ((window as any).OneSignal?.initialized) {
                        try {
                            setIsSubscribed(!!(window as any).OneSignal.User.PushSubscription.optedIn);
                        } catch (e) { }
                        setLoading(false);
                        clearInterval(checkInterval);
                    }
                }, 500);
                setTimeout(() => { clearInterval(checkInterval); setLoading(false); }, 5000);
                return;
            }
            (window as any).OneSignalInitStarted = true;

            const safetyTimeout = setTimeout(() => {
                console.warn("⏳ OneSignal timed out after 7s.");
                setLoading(false);
            }, 7000);

            try {
                console.log("🚀 Initializing OneSignal:", appId);
                await OneSignal.init({
                    appId: appId,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerParam: { scope: '/' },
                    serviceWorkerPath: 'OneSignalSDKWorker.js',
                });

                console.log("✅ OneSignal Ready");

                // Set initial state safely
                if (OneSignal.User?.PushSubscription) {
                    setIsSubscribed(!!OneSignal.User.PushSubscription.optedIn);
                }

                // Listener for foreground
                OneSignal.Notifications?.addEventListener("foregroundWillDisplay", (event) => {
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                        new Notification(event.notification.title || "New Quiz", {
                            body: event.notification.body,
                            icon: "/newlogo.png"
                        });
                    }
                });

            } catch (error: any) {
                console.error('❌ OneSignal Error:', error);
            } finally {
                clearTimeout(safetyTimeout);
                setLoading(false);
            }
        };

        initOneSignal();

        const statusPoller = setInterval(() => {
            try {
                if (typeof window !== 'undefined' && (window as any).OneSignal?.User?.PushSubscription) {
                    const current = !!(window as any).OneSignal.User.PushSubscription.optedIn;
                    setIsSubscribed(current);
                }
            } catch (e) { }
        }, 3000);

        return () => clearInterval(statusPoller);
    }, []);

    const handleToggleNotifications = async () => {
        if (loading) return;

        const os = (window as any).OneSignal;
        if (!os || !os.initialized) {
            alert("નોટિફિકેશન સિસ્ટમ હજી તૈયાર નથી. કૃપા કરીને થોડીવાર પછી પ્રયત્ન કરો.");
            return;
        }

        setLoading(true);
        try {
            if (isSubscribed) {
                await os.User.PushSubscription.optOut();
                setIsSubscribed(false);
            } else {
                const currentPermission = await os.Notifications.permission;
                if (currentPermission === 'denied') {
                    alert("તમે નોટિફિકેશન બ્લોક કરેલ છે. કૃપા કરીને બ્રાઉઝર સેટિંગ્સમાં જઈને તેને Allow કરો.");
                    setLoading(false);
                    return;
                }

                await os.Notifications.requestPermission();
                await os.User.PushSubscription.optIn();
                setIsSubscribed(!!os.User.PushSubscription.optedIn);
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
