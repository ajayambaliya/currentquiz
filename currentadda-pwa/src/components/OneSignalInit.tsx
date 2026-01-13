'use client';

import { useEffect, useRef } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
    const initialized = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || initialized.current) return;
        initialized.current = true;

        const init = async () => {
            const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
            if (!appId) {
                console.error("❌ OneSignal: App ID missing");
                return;
            }

            try {
                console.log("🚀 OneSignal: Initializing...");
                await OneSignal.init({
                    appId: appId,
                    allowLocalhostAsSecureOrigin: true,
                });
                console.log("✅ OneSignal: Ready");
            } catch (e: any) {
                if (!e?.message?.includes('already initialized')) {
                    console.error("❌ OneSignal: Error", e);
                }
            }
        };

        // Delay to ensure the main page content loads first
        const timer = setTimeout(init, 2000);
        return () => clearTimeout(timer);
    }, []);

    return null;
}
