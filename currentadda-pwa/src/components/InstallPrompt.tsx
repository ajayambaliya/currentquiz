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
            
            // Re-check dismissal logic here too
            const lastDismissed = localStorage.getItem("installPromptDismissed");
            if (lastDismissed) {
                const dismissedAt = new Date(lastDismissed).getTime();
                const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
                if (daysSinceDismissed < 7) return;
            }

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
        <div className="fixed bottom-24 left-4 right-4 z-[9999] md:left-auto md:right-8 md:w-[400px] pointer-events-none">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <button
                    onClick={dismissPrompt}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors z-20"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 p-0.5 shadow-lg shadow-indigo-200">
                        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                            <img src="/newlogo.png" alt="Logo" className="w-full h-full object-cover scale-110" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm tracking-tight leading-none mb-1">Boost Preparation</h3>
                        <p className="text-[10px] font-bold text-slate-500 leading-tight">Install app for daily CA alerts and offline practice.</p>
                        
                        <div className="mt-2.5 flex items-center gap-2">
                            {isIOS ? (
                                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                    <Share className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tap Share + Add Home</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstallClick}
                                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-indigo-100"
                                >
                                    <Download className="w-3 h-3" />
                                    Get App
                                </button>
                            )}
                            {(window.navigator as any).share && (
                                <button
                                    onClick={() => (window.navigator as any).share({ title: 'CurrentAdda', url: 'https://currentadda.vercel.app' })}
                                    className="p-1.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors"
                                >
                                    <Share className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
