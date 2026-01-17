'use client';

import { useState, useEffect } from 'react';
import {
    Send, Bell, Link as LinkIcon, Image as ImageIcon,
    CheckCircle2, AlertCircle, Loader2, Lock, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    checkAdminCredentials,
    sendNotificationAction
} from '../subject-quiz/actions';

export default function AdminNotifications() {
    const router = useRouter();

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authForm, setAuthForm] = useState({ username: '', password: '' });
    const [authError, setAuthError] = useState('');

    // Notification State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        url: '',
        image: ''
    });
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string, recipients?: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial load
    useEffect(() => {
        const savedAuth = sessionStorage.getItem('admin_auth');
        if (savedAuth === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');
        const isValid = await checkAdminCredentials(authForm.username, authForm.password);
        if (isValid) {
            setIsLoggedIn(true);
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            setAuthError('Invalid credentials');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.message) return;

        setIsProcessing(true);
        setStatus({ type: 'info', message: 'Sending notification...' });

        const result = await sendNotificationAction(
            formData.title,
            formData.message,
            formData.url,
            formData.image
        );

        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({
                type: 'success',
                message: 'Notification sent successfully!',
                recipients: result.recipients
            });
            setFormData({ title: '', message: '', url: '', image: '' });
        }
        setIsProcessing(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-md space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg">
                            <Lock className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
                        <p className="text-slate-500 text-sm">Please login to send notifications</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                                value={authForm.username}
                                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-100 transition-all"
                                value={authForm.password}
                                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                                required
                            />
                        </div>
                        {authError && <p className="text-rose-500 text-xs font-bold text-center">{authError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all active:scale-95"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-5 md:p-10 pb-32">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/subject-quiz" className="bg-white p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-100">
                            <Bell className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Push Notifications</h1>
                            <p className="text-slate-500 font-medium">Send custom messages to all users</p>
                        </div>
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                            status.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                <Loader2 className="w-5 h-5 animate-spin" />}
                        <div>
                            <span className="font-bold text-sm block">{status.message}</span>
                            {status.recipients !== undefined && (
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                                    Targeted Recipients: {status.recipients}
                                </span>
                            )}
                        </div>
                        <button onClick={() => setStatus(null)} className="ml-auto opacity-50 hover:opacity-100 text-xs font-bold">Close</button>
                    </div>
                )}

                <form onSubmit={handleSend} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notification Title</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all"
                                placeholder="E.g. New Live Quiz Alert! 🚀"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                            <textarea
                                rows={3}
                                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all resize-none"
                                placeholder="Enter the message you want to show to users..."
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <LinkIcon size={10} /> Target URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <ImageIcon size={10} /> Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 ring-rose-100 transition-all"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isProcessing || !formData.title || !formData.message}
                            className="w-full bg-rose-500 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-rose-200 hover:bg-slate-900 hover:shadow-2xl transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    <span>Push to All Users</span>
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-center text-slate-400 font-bold mt-4 uppercase tracking-[0.2em]">
                            This will be sent to all active subscribers via OneSignal
                        </p>
                    </div>
                </form>

                {/* Preview Section */}
                {(formData.title || formData.message) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-center block">Live Preview</label>
                        <div className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-lg max-w-sm mx-auto flex items-start gap-4">
                            <div className="bg-rose-500 p-2 rounded-xl shrink-0">
                                <Bell className="text-white" size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-slate-900 line-clamp-1">{formData.title || 'Notification Title'}</h4>
                                <p className="text-xs font-medium text-slate-500 line-clamp-2">{formData.message || 'Message content will appear here...'}</p>
                            </div>
                            {formData.image && (
                                <img src={formData.image} alt="preview" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
