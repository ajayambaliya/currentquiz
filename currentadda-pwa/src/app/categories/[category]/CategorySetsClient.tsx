'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    ArrowLeft, ChevronRight, Inbox, LayoutGrid, Trophy, Home, User,
    Clock, Sparkles, Book, PlayCircle, FileDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { subMonths } from 'date-fns';
import BottomNav from '@/components/BottomNav';

export default function CategorySetsClient({ category, initialCount }: { category: string; initialCount?: number }) {
    const [totalQuestions, setTotalQuestions] = useState<number | null>(initialCount ?? null);
    const [loading, setLoading] = useState(initialCount === undefined);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetchCount(isMounted);
        return () => { isMounted = false; };
    }, [category]);

    async function fetchCount(isMounted: boolean) {
        try {
            if (isMounted && totalQuestions === null) { 
                setLoading(true); 
                setErrorMsg(null); 
            }
            const eightMonthsAgo = subMonths(new Date(), 8).toISOString();
            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true })
                .eq('category', category)
                .gte('created_at', eightMonthsAgo);
            if (error) throw error;
            if (isMounted) setTotalQuestions(count || 0);
        } catch (err: any) {
            if (isMounted && totalQuestions === null) {
                setErrorMsg(err.message || 'Failed to load. Please retry.');
            }
        } finally {
            if (isMounted) setLoading(false);
        }
    }

    const setSize = 10;
    const currentTotal = totalQuestions || 0;
    const numSets = Math.ceil(currentTotal / setSize);
    const sets = Array.from({ length: numSets }).map((_, i) => ({
        id: i + 1,
        title: `Set ${i + 1}`,
        count: i === numSets - 1 && currentTotal % setSize !== 0
            ? currentTotal % setSize : setSize,
    }));

    return (
        <div className="pb-36">
            {/* Sticky Play Header */}
            <div className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/categories" className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div>
                            <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{category}</p>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                                {loading ? 'Loading...' : `${currentTotal} Questions • ${numSets} Sets`}
                            </p>
                        </div>
                    </div>
                    {!loading && numSets > 0 && (
                        <Link
                            href={`/categories/${encodeURIComponent(category)}/quiz/1`}
                            className="flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                        >
                            <PlayCircle className="w-3.5 h-3.5" />
                            Play Now
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-xl mx-auto px-5 pt-6">
                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-full h-[88px] bg-slate-50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white py-16 rounded-3xl border border-red-50 text-center space-y-4 mt-4"
                    >
                        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-red-400 font-black text-sm uppercase tracking-widest">Connection Error</p>
                        <p className="text-slate-500 text-sm gujarati-text px-8">નેટવર્ક સમસ્યા. ફરી પ્રયાસ કરો.</p>
                        <button onClick={() => fetchCount(true)} className="bg-red-500 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-red-600 transition-all">
                            Retry
                        </button>
                    </motion.div>
                )}

                {/* Empty state */}
                {!loading && !errorMsg && numSets === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white py-16 rounded-3xl border border-slate-50 text-center space-y-4 mt-4"
                    >
                        <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                            <Inbox className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No Content Yet</p>
                        <p className="text-slate-500 text-sm gujarati-text px-8">આ category માં questions ટૂંક સમયમાં ઉમેરાશે.</p>
                        <Link href="/categories" className="inline-block bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition-all">
                            Browse All Categories
                        </Link>
                    </motion.div>
                )}

                {/* Quiz Sets */}
                {!loading && !errorMsg && numSets > 0 && (
                    <div className="space-y-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between px-1 mb-1">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent 8 Months</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <Sparkles className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
                            </div>
                        </div>

                        <AnimatePresence>
                            {sets.map((set, idx) => (
                                <motion.div
                                    key={set.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04, type: 'spring', damping: 22 }}
                                >
                                    <Link
                                        href={`/categories/${encodeURIComponent(category)}/quiz/${set.id}`}
                                        aria-label={`${category} Quiz Set ${set.id} — ${set.count} questions`}
                                        className="flex items-center justify-between bg-white px-5 py-5 rounded-3xl border border-slate-100 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/8 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:scale-105">
                                                    {set.id}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-base uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {category} Set {set.id}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{set.count} Questions</span>
                                                    <span className="text-[10px] text-slate-200">•</span>
                                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Free Practice</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3.5 rounded-2xl group-hover:bg-indigo-600 transition-all">
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <BottomNav theme="light" />
        </div>
    );
}
