"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, PlusSquare } from "lucide-react";

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Check if the user has dismissed the prompt recently
        const lastDismissed = localStorage.getItem("installPromptDismissed");
        if (lastDismissed) {
            const dismissedAt = new Date(lastDismissed).getTime();
            const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
            // If dismissed less than 7 days ago, don't show it
            if (daysSinceDismissed < 7) {
                return;
            }
        }

        // Check if app is already installed / standalone
        const checkStandalone = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(checkStandalone);

        if (checkStandalone) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        if (isIOSDevice) {
            // Show prompt automatically for iOS after a slight delay
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // Handle Android / Chrome install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };

    const dismissPrompt = () => {
        setShowPrompt(false);
        localStorage.setItem("installPromptDismissed", new Date().toISOString());
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 sm:p-0 sm:bottom-4 sm:top-auto sm:left-auto sm:right-4 sm:block pointer-events-none">
            <div className="premium-card glass p-4 shadow-2xl relative overflow-hidden w-full max-w-[360px] md:w-96 pointer-events-auto animate-in zoom-in-95 sm:slide-in-from-bottom-5 fade-in duration-500 mx-auto">
                {/* Glow effect background */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

                <button
                    onClick={dismissPrompt}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 relatuve z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shrink-0 shadow-lg">
                        <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center overflow-hidden">
                            <img src="/newlogo.png" alt="CurrentAdda Logo" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-sm md:text-base">Install CurrentAdda</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-3">
                            Add our app to your home screen for faster loading and daily offline access.
                        </p>

                        {isIOS ? (
                            <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 border border-slate-100">
                                Tap <Share className="inline w-3 h-3 mx-1 text-slate-800" /> below and then <br />
                                <span className="font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                                    <PlusSquare className="w-3.5 h-3.5" /> "Add to Home Screen"
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Install App
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
