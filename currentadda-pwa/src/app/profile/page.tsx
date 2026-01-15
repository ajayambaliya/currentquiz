'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, LogOut, TrendingUp, Star, Target,
    User as UserIcon, ArrowRight,
    BarChart3, Clock, Flame, Shield, BookOpen,
    Share2, Rocket, Zap, Sparkles, MessageCircle,
    LayoutGrid, Home, Trophy, Github, Instagram, Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [scores, setScores] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);

    const { scrollYProgress } = useScroll({
        offset: ["start start", "end end"]
    });

    const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
    const headerBlur = useTransform(scrollYProgress, [0, 0.05], [0, 10]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
        if (user) {
            fetchStats();
        }
    }, [user, authLoading]);

    async function fetchStats() {
        try {
            setLoading(true);
            const [scoresRes, profileRes] = await Promise.all([
                supabase.from('scores').select('*').eq('user_id', user?.id),
                supabase.from('profiles').select('*').eq('id', user?.id).single()
            ]);

            if (scoresRes.data) setScores(scoresRes.data);
            if (profileRes.data) setProfile(profileRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const categoryStats = useMemo(() => {
        const stats: Record<string, { total: number, correct: number }> = {};
        scores.forEach(s => {
            const cat = s.category || 'Miscellaneous';
            if (!stats[cat]) stats[cat] = { total: 0, correct: 0 };
            stats[cat].total += s.total_questions;
            stats[cat].correct += s.score;
        });

        return Object.entries(stats).map(([name, data]) => ({
            name,
            accuracy: Math.round((data.correct / data.total) * 100),
            count: data.total
        })).sort((a, b) => b.accuracy - a.accuracy);
    }, [scores]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const shareToWhatsApp = () => {
        const text = `🚀 *My CurrentAdda Progress Card* 🚀\n\n` +
            `🔥 *Daily Streak:* ${profile?.streak_count || 0} Days\n` +
            `🎯 *Overall Accuracy:* ${avgAccuracy}%\n` +
            `📚 *Quizzes Completed:* ${scores.length}\n` +
            `✍️ *Total Questions:* ${totalQuestionsPracticed}\n\n` +
            `Join me on CurrentAdda for daily Gujarati current affairs! 👇\n` +
            `https://currentadda.vercel.app`;

        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareModal(false);
    };

    if (authLoading || (loading && !profile)) {
        return (
            <div className="min-h-screen bg-[#05060a] flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 bg-indigo-500 rounded-3xl animate-ping opacity-20" />
                        <div className="relative bg-[#0d1117] w-full h-full rounded-3xl border border-white/10 flex items-center justify-center">
                            <Rocket className="w-8 h-8 text-indigo-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Building your empire</p>
                </div>
            </div>
        );
    }

    const totalQuestionsPracticed = scores.reduce((a, b) => a + b.total_questions, 0);
    const avgAccuracy = categoryStats.length > 0
        ? Math.round(categoryStats.reduce((a, b) => a + b.accuracy, 0) / categoryStats.length)
        : 0;

    return (
        <main className="min-h-screen bg-[#05060a] text-white overflow-x-hidden selection:bg-indigo-500/30 pb-40">
            {/* Immersive Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-950/30 to-transparent" />
                <div className="absolute top-[10%] -right-[10%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] -left-[10%] w-[250px] h-[250px] bg-purple-600/10 rounded-full blur-[80px]" />
                <div className="absolute inset-0 opacity-[0.03] grayscale" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
            </div>

            {/* Dynamic Sticky Header */}
            <motion.header
                style={{ opacity: headerOpacity, backdropFilter: `blur(${headerBlur}px)` }}
                className="fixed top-0 left-0 w-full py-4 px-6 z-[100] border-b border-white/5 bg-[#05060a]/80"
            >
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <Image src={profile.avatar_url} alt="P" width={32} height={32} />
                            ) : (
                                <UserIcon className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <span className="font-black text-sm tracking-tight">{profile?.full_name}</span>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-xl mx-auto px-6 relative z-10 pt-8 space-y-12">
                {/* Top Actions */}
                <div className="flex justify-between items-center">
                    <Link href="/" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex gap-3">
                        <button onClick={() => setShowShareModal(true)} className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all group">
                            <Share2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        </button>
                        <button onClick={handleLogout} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Hero Profile Section */}
                <div className="space-y-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                            <div className="relative w-32 h-32 rounded-[3rem] border-2 border-white/20 p-2 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl">
                                <div className="w-full h-full rounded-[2.5rem] bg-[#0d1117] overflow-hidden flex items-center justify-center border border-white/5">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="Profile" width={128} height={128} className="object-cover" />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-indigo-400" />
                                    )}
                                </div>
                            </div>
                            {profile?.streak_count > 0 && (
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-orange-400 to-red-600 px-3 py-1.5 rounded-2xl border-4 border-[#05060a] shadow-xl flex items-center gap-1.5">
                                    <Flame className="w-4 h-4 text-white fill-white" />
                                    <span className="text-xs font-black text-white">{profile.streak_count}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                            >
                                {profile?.full_name}
                            </motion.h1>
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <ModernStatCard
                            icon={<Zap className="w-5 h-5 text-amber-500" />}
                            value={profile?.streak_count || 0}
                            label="Daily Streak"
                            color="from-amber-500/20"
                        />
                        <ModernStatCard
                            icon={<Target className="w-5 h-5 text-indigo-500" />}
                            value={`${avgAccuracy}%`}
                            label="Global Accuracy"
                            color="from-indigo-500/20"
                        />
                    </div>
                </div>

                {/* Performance Analytics */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl">
                                <BarChart3 className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest">Mastery Level</h2>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{categoryStats.length} Subjects Active</span>
                    </div>

                    <div className="space-y-4">
                        {categoryStats.length === 0 ? (
                            <EmptyDashboardState />
                        ) : (
                            categoryStats.map((stat, idx) => (
                                <div key={stat.name} className="relative group">
                                    <div className="absolute inset-0 bg-indigo-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                    <div className="relative bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-4 group-hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center font-black text-indigo-400">
                                                    {stat.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-lg">{stat.name}</span>
                                                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.count} Ans</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">{stat.accuracy}%</div>
                                                <div className="text-[9px] uppercase font-black text-emerald-500 tracking-widest">Accuracy</div>
                                            </div>
                                        </div>
                                        <div className="h-4 bg-white/5 rounded-full p-1 border border-white/5 relative overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${stat.accuracy}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-500 rounded-full relative"
                                            >
                                                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-30" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Final CTA / Motivation */}
                <div className="bg-[#1a1f2e] border border-white/10 p-10 rounded-[4rem] text-center space-y-6 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <Sparkles className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                    <div className="space-y-3 relative z-10 font-black">
                        <h3 className="text-2xl gujarati-text leading-tight group-hover:scale-105 transition-transform">તમારા સપના સાચા થશે!</h3>
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Consistency is the key to Gujarat Govt Exams.</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-3xl font-black text-xs uppercase hover:bg-slate-50 transition-all relative z-10 shadow-xl shadow-white/5 group">
                        Unlock Next Quiz
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Creator Recognition & Socials */}
                <div className="pt-20 pb-10 space-y-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-0.5 bg-indigo-500/20 rounded-full" />
                        <Link href="/author" className="group flex flex-col items-center space-y-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Crafted by</span>
                            <h4 className="text-xl font-black group-hover:text-indigo-400 transition-colors">Ajay Ambaliya</h4>
                        </Link>
                    </div>

                    <div className="flex justify-center gap-4">
                        <SocialLink href="https://github.com/ajayambaliya" icon={<Github className="w-5 h-5" />} color="hover:bg-slate-800" />
                        <SocialLink href="https://instagram.com/ajayambaliyaa" icon={<Instagram className="w-5 h-5" />} color="hover:bg-pink-600" />
                        <SocialLink href="https://wa.me/918000212153" icon={<MessageCircle className="w-5 h-5" />} color="hover:bg-emerald-600" />
                        <SocialLink href="mailto:ajay.ambaliya007@gmail.com" icon={<Mail className="w-5 h-5" />} color="hover:bg-indigo-600" />
                    </div>
                </div>
            </div>

            {/* Navigation Tab Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass-profile p-2.5 rounded-[2.5rem] border border-white/10 flex justify-around items-center shadow-2xl bg-[#0a0d14]/90 backdrop-blur-3xl">
                    <Link href="/" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><Home className="w-6 h-6" /></Link>
                    <Link href="/categories" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><LayoutGrid className="w-6 h-6" /></Link>
                    <Link href="/leaderboard" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><Trophy className="w-6 h-6" /></Link>
                    <Link href="/profile" className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-600/30"><UserIcon className="w-6 h-6" /></Link>
                </div>
            </nav>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowShareModal(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="fixed bottom-0 left-0 w-full bg-[#0d1117] border-t border-white/10 z-[160] rounded-t-[3rem] p-8 pb-12"
                        >
                            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                            <div className="max-w-md mx-auto space-y-10">
                                <div className="text-center space-y-3">
                                    <h2 className="text-3xl font-black tracking-tight">Show off your progress!</h2>
                                    <p className="text-slate-500 font-bold text-sm">Create a profile card to share on WhatsApp status.</p>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xl border-2 border-white/10">
                                            {profile?.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-lg">{profile?.full_name}</span>
                                            <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">CurrentAdda Elite Candidate</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Streak</div>
                                            <div className="text-2xl font-black text-orange-500 flex items-center gap-2">
                                                <Flame className="w-5 h-5 fill-orange-500" />
                                                {profile?.streak_count || 0}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Accuracy</div>
                                            <div className="text-2xl font-black text-indigo-400 flex items-center gap-2">
                                                <Target className="w-5 h-5" />
                                                {avgAccuracy}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={shareToWhatsApp}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 p-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-500/20 group"
                                >
                                    <MessageCircle className="w-6 h-6 fill-white" />
                                    <span className="font-black text-lg tracking-tight">Share to WhatsApp Status</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}

function SocialLink({ href, icon, color }: { href: string, icon: any, color: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className={`w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl transition-all hover:scale-110 active:scale-95 ${color} hover:border-transparent`}>
            {icon}
        </a>
    );
}

function ModernStatCard({ icon, value, label, color }: { icon: any, value: any, label: string, color: string }) {
    return (
        <div className={`bg-white/5 border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all`}>
            <div className={`absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tr ${color} to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="p-3 bg-white/5 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform shadow-inner">
                {icon}
            </div>
            <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{value}</div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">{label}</p>
        </div>
    );
}

function EmptyDashboardState() {
    return (
        <div className="py-16 bg-white/5 border border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                <BookOpen className="w-10 h-10 text-slate-700" />
            </div>
            <div className="space-y-2">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Battle Records</p>
                <p className="text-slate-500 font-bold gujarati-text text-xl px-12">તમારી પ્રગતિ જોવા માટે પહેલી ક્વિઝ પૂરી કરો!</p>
            </div>
            <Link href="/" className="inline-block bg-white text-black px-8 py-4 rounded-3xl font-black text-xs uppercase hover:bg-slate-100 transition-all">
                Start Learning
            </Link>
        </div>
    );
}
