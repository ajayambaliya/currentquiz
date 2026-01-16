'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Trophy, Star, ArrowLeft, TrendingUp,
    Calendar, Crown, Medal, Timer,
    ChevronRight, Sparkles, User as UserIcon,
    LayoutGrid, Home, Target
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardSkeleton } from '@/components/SkeletonLoader';
import { startOfWeek, startOfMonth, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

type TimeFilter = 'all' | 'monthly' | 'weekly';

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [currentUserRank, setCurrentUserRank] = useState<any>(null);

    useEffect(() => {
        fetchLeaders();
    }, [timeFilter]);

    async function fetchLeaders() {
        try {
            setLoading(true);

            let query = supabase
                .from('scores')
                .select('user_id, quiz_id, score, created_at')
                .order('created_at', { ascending: true });

            // Apply date filters
            if (timeFilter === 'weekly') {
                const start = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
                query = query.gte('created_at', start);
            } else if (timeFilter === 'monthly') {
                const start = startOfMonth(new Date()).toISOString();
                query = query.gte('created_at', start);
            }

            const { data: allScores, error: scoresError } = await query;

            if (scoresError) throw scoresError;

            if (!allScores || allScores.length === 0) {
                setLeaders([]);
                setLoading(false);
                return;
            }

            // Step 2: Extract only the FIRST attempt for each (user, quiz) pair
            const firstAttemptsOnly: Record<string, any> = {};
            allScores.forEach(s => {
                const key = `${s.user_id}_${s.quiz_id}`;
                if (!firstAttemptsOnly[key]) {
                    firstAttemptsOnly[key] = s;
                }
            });

            // Step 3: Aggregate by user_id
            const finalScores = Object.values(firstAttemptsOnly).reduce((acc: any, curr: any) => {
                const uid = curr.user_id;
                if (!acc[uid]) {
                    acc[uid] = { user_id: uid, total_score: 0, quiz_count: 0 };
                }
                acc[uid].total_score += curr.score;
                acc[uid].quiz_count += 1;
                return acc;
            }, {});

            const sortedUserIds = Object.keys(finalScores).sort((a, b) =>
                finalScores[b].total_score - finalScores[a].total_score
            );

            // Step 4: Fetch profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', sortedUserIds.slice(0, 50)); // Limit to top 50

            if (profilesError) throw profilesError;

            const profileMap = (profiles || []).reduce((acc: any, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            const mergedData = sortedUserIds.map((uid, index) => {
                const entry = {
                    ...finalScores[uid],
                    profiles: profileMap[uid] || { full_name: 'Anonymous User' },
                    rank: index + 1
                };

                // Track current user's rank
                if (user && uid === user.id) {
                    setCurrentUserRank(entry);
                }

                return entry;
            }).slice(0, 50);

            setLeaders(mergedData);
        } catch (error) {
            console.error('Error fetching leaders:', error);
        } finally {
            setLoading(false);
        }
    }

    const top3 = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
        <main className="min-h-screen bg-[#f8fafc] max-w-xl mx-auto pb-44 selection:bg-indigo-100">
            {/* Premium Glass Header */}
            <header className="px-6 py-6 sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2.5 bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">Leaderboard</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 ml-0.5">Top Candidates</p>
                    </div>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100/50 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Real-time</span>
                </div>
            </header>

            {/* Time Filter Tabs */}
            <div className="px-6 mt-8">
                <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex items-center gap-1 border border-slate-200/50">
                    {(['all', 'monthly', 'weekly'] as TimeFilter[]).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative
                                ${timeFilter === filter
                                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50'
                                    : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="relative z-10">{filter} Time</span>
                            {timeFilter === filter && (
                                <motion.div
                                    layoutId="activeFilter"
                                    className="absolute inset-0 bg-white rounded-2xl shadow-indigo-100/50 shadow-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6 py-8">
                {loading ? (
                    <LeaderboardSkeleton count={10} />
                ) : leaders.length === 0 ? (
                    <div className="py-24 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-slate-100">
                            <Sparkles className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold gujarati-text">આ ફિલ્ટર માટે હજી કોઈ રેકોર્ડ નથી.</p>
                    </div>
                ) : (
                    <>
                        {/* Podium - Visual Top 3 */}
                        <div className="mb-12 relative">
                            {/* Background Aura */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="flex items-end justify-center gap-2 md:gap-4 pt-10 px-2 relative z-10">
                                {/* Rank 2 */}
                                {top3[1] && (
                                    <PodiumSlot
                                        entry={top3[1]}
                                        rank={2}
                                        color="silver"
                                        delay={0.1}
                                    />
                                )}

                                {/* Rank 1 */}
                                {top3[0] && (
                                    <PodiumSlot
                                        entry={top3[0]}
                                        rank={1}
                                        color="gold"
                                        delay={0}
                                    />
                                )}

                                {/* Rank 3 */}
                                {top3[2] && (
                                    <PodiumSlot
                                        entry={top3[2]}
                                        rank={3}
                                        color="bronze"
                                        delay={0.2}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Search/Stats indicator */}
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Complete Breakdown</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-500 leading-none">{leaders.length} Players Active</span>
                        </div>

                        {/* Remaining List */}
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {rest.map((entry, idx) => (
                                    <motion.div
                                        key={entry.user_id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="bg-white p-4 rounded-[1.75rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs border border-slate-100/50 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                #{entry.rank}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {entry.profiles.avatar_url ? (
                                                        <img src={entry.profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 text-[13px] leading-tight flex items-center gap-1.5">
                                                        {entry.profiles.full_name}
                                                        {user && entry.user_id === user.id && (
                                                            <span className="bg-indigo-600 text-[8px] text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">You</span>
                                                        )}
                                                    </h3>
                                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight flex items-center gap-1.5">
                                                        <Target className="w-2.5 h-2.5" />
                                                        {entry.quiz_count} Unique Quizzes
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-lg font-black text-slate-800 leading-none">{entry.total_score}</span>
                                                <div className="p-1.5 bg-amber-50 rounded-lg">
                                                    <Medal className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1 block">Total Points</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Your Rank Sticky (if not loading and user rank exists) */}
            {user && currentUserRank && !loading && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-[110px] left-0 w-full px-6 z-40 pointer-events-none"
                >
                    <div className="max-w-xl mx-auto pointer-events-auto">
                        <div className="bg-indigo-900 shadow-2xl shadow-indigo-200/50 p-5 rounded-[2.5rem] flex items-center justify-between border-4 border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                                    <span className="text-[8px] uppercase font-black text-indigo-300 mb-0.5">Rank</span>
                                    <span className="text-xl font-black text-white">#{currentUserRank.rank}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-1">Your Stats</span>
                                    <span className="text-lg font-black text-white leading-none">Great job, {currentUserRank.profiles.full_name.split(' ')[0]}!</span>
                                </div>
                            </div>
                            <div className="text-right pr-2">
                                <div className="text-2xl font-black text-white leading-none">{currentUserRank.total_score}</div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1 block">Points</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation Tab Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass p-2 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl">
                    <Link href="/" className="p-3 text-slate-400 hover:text-indigo-500 transition-all rounded-2xl"><Home className="w-6 h-6" /></Link>
                    <Link href="/categories" className="p-3 text-slate-400 hover:text-indigo-500 transition-all rounded-2xl"><LayoutGrid className="w-6 h-6" /></Link>
                    <Link href="/leaderboard" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-all scale-105"><Trophy className="w-6 h-6" /></Link>
                    <Link href="/profile" className="p-3 text-slate-400 hover:text-indigo-500 transition-all rounded-2xl"><div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden"><UserIcon className="w-4 h-4" /></div></Link>
                </div>
            </nav>
        </main>
    );
}

function PodiumSlot({ entry, rank, color, delay }: { entry: any, rank: number, color: 'gold' | 'silver' | 'bronze', delay: number }) {
    const isGold = color === 'gold';
    const bgClass = isGold ? 'bg-amber-500' : (color === 'silver' ? 'bg-slate-400' : 'bg-orange-600');
    const borderClass = isGold ? 'border-amber-100/30' : (color === 'silver' ? 'border-slate-100/30' : 'border-orange-100/30');
    const ringClass = isGold ? 'ring-amber-400/20 shadow-amber-500/20' : (color === 'silver' ? 'ring-slate-400/20 shadow-slate-400/20' : 'ring-orange-600/20 shadow-orange-600/20');

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className={`flex flex-col items-center flex-1 ${isGold ? '-mt-10' : ''}`}
        >
            <div className="relative mb-4">
                {isGold && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 -top-8 flex justify-center opacity-40"
                    >
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </motion.div>
                )}

                <div className={`relative ${isGold ? 'w-24 h-24' : 'w-20 h-20'} rounded-[2.5rem] bg-white shadow-2xl p-2 z-10 ${borderClass} border-[1px]`}>
                    <div className="w-full h-full rounded-[2rem] bg-slate-50 overflow-hidden relative border border-slate-100">
                        {entry.profiles.avatar_url ? (
                            <img src={entry.profiles.avatar_url} alt="P" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserIcon className={`${isGold ? 'w-10 h-10' : 'w-8 h-8'}`} />
                            </div>
                        )}
                    </div>
                    {/* Rank Indicator */}
                    <div className={`absolute -bottom-2 -right-2 ${isGold ? 'w-10 h-10' : 'w-8 h-8'} rounded-2xl flex items-center justify-center shadow-lg border-4 border-white ${bgClass}`}>
                        {isGold ? <Crown className="w-4 h-4 text-white fill-white" /> : <Medal className="w-3.5 h-3.5 text-white fill-white" />}
                    </div>
                </div>
            </div>

            <div className="text-center space-y-1">
                <h3 className="font-black text-slate-900 text-sm tracking-tight truncate max-w-[100px] leading-none">
                    {entry.profiles.full_name.split(' ')[0]}
                </h3>
                <div className={`${isGold ? 'bg-amber-100/50 text-amber-700' : 'bg-slate-100 text-slate-500'} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                    {entry.total_score}
                </div>
            </div>
        </motion.div>
    );
}
