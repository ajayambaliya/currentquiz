'use client';

import dynamic from 'next/dynamic';

// These client-only components don't need to be in the initial JS bundle
const ProtectContent = dynamic(() => import('@/components/ProtectContent'), { ssr: false });
const OneSignalInit = dynamic(() => import('@/components/OneSignalInit'), { ssr: false });
const InstallPrompt = dynamic(() => import('@/components/InstallPrompt'), { ssr: false });

export default function ClientProviders() {
    return (
        <>
            <OneSignalInit />
            <ProtectContent />
            <InstallPrompt />
        </>
    );
}
