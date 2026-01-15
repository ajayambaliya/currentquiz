'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    ArrowLeft, ChevronRight, BookOpen, Loader2,
    Calendar, Inbox, LayoutGrid, Trophy, Home, User,
    Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { subMonths } from 'date-fns';

export default function CategorySetsPage() {
    const params = useParams();
    const category = decodeURIComponent(params.category as string);
    const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCount();
    }, [category]);

    async function fetchCount() {
        try {
            setLoading(true);
            const eightMonthsAgo = subMonths(new Date(), 8).toISOString();

            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('category', category)
                .gte('created_at', eightMonthsAgo);

            if (error) throw error;
            setTotalQuestions(count || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <header className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl animate-pulse" />
                    <div className="space-y-2">
                        <div className="w-32 h-4 bg-slate-50 rounded-full animate-pulse" />
                        <div className="w-20 h-2 bg-slate-50 rounded-full animate-pulse" />
                    </div>
                </header>
                <div className="px-6 pt-10 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-full h-24 bg-slate-50 rounded-[2rem] animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const setSize = 10;
    const currentTotal = totalQuestions || 0;
    const numSets = Math.ceil(currentTotal / setSize);
    const sets = Array.from({ length: numSets }).map((_, i) => ({
        id: i + 1,
        title: `Set ${i + 1}`,
        description: i === numSets - 1 && currentTotal % setSize !== 0
            ? `${currentTotal % setSize} questions`
            : `${setSize} questions`
    }));

    return (
        <main className="min-h-screen pb-32 overflow-x-hidden bg-[#fdfdfd]">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/categories" className="p-2 transition-colors hover:bg-slate-50 rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-slate-900 leading-none gujarati-text">
                            {category}
                        </h1>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                            {totalQuestions} Practice Questions
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-6 pt-8">
                {numSets === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white py-20 rounded-[3rem] border border-slate-50 text-center space-y-6 shadow-xl shadow-slate-100/50 mt-10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-100 to-transparent" />
                        <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto transition-transform hover:rotate-12">
                            <Inbox className="w-10 h-10 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No Content Found</p>
                            <p className="text-slate-500 font-bold gujarati-text px-10">આ કેટેગરીમાં છેલ્લા 8 મહિનામાં કોઈ પ્રશ્નો ઉમેરવામાં આવ્યા નથી.</p>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-6 py-3 rounded-2xl hover:bg-indigo-100 transition-all">
                            Explore Other Categories
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Last 8 Months Activity</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                                <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Live Database</span>
                            </div>
                        </div>

                        {sets.map((set, idx) => (
                            <motion.div
                                key={set.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                            >
                                <Link
                                    href={`/categories/${encodeURIComponent(category)}/quiz/${set.id}`}
                                    className="block bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-indigo-400 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 group relative mt-2"
                                >
                                    <div className="flex justify-between items-center relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 transition-all group-hover:bg-indigo-600 group-hover:text-white relative z-10 group-hover:scale-110">
                                                    {set.id}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{set.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                        {set.description} Practice
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                                                        Mastered Level
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                                        </div>
                                    </div>
                                    {/* Abstract decoration */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Docked Modern Tab Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass p-2 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl">
                    <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><HomeIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/categories" className="flex flex-col items-center gap-1 text-indigo-600">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><LayoutGrid className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><TrophyIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><UserIcon className="w-6 h-6" /></div>
                    </Link>
                </div>
            </nav>
        </main>
    );
}

function HomeIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}

function TrophyIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 21h8m-4-4v4M7 4h10M4 7h3m13 0h-3m-1 0v4a5 5 0 01-10 0V7" /></svg>;
}

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
