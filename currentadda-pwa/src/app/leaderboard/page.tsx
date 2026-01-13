'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Star, ArrowLeft, Loader2, Target, Award, TrendingUp, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LeaderboardSkeleton } from '@/components/SkeletonLoader';

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaders();
    }, []);

    async function fetchLeaders() {
        try {
            setLoading(true);

            // Step 1: Fetch ALL scores with quiz_id and created_at to filter first attempts
            const { data: allScores, error: scoresError } = await supabase
                .from('scores')
                .select('user_id, quiz_id, score, created_at')
                .order('created_at', { ascending: true }); // Important: Oldest first

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
                // Since data is ordered by created_at ascending, the first time we see this key, it's the first attempt
                if (!firstAttemptsOnly[key]) {
                    firstAttemptsOnly[key] = s;
                }
            });

            // Step 3: Aggregate these first attempts by user_id
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
                .select('id, full_name')
                .in('id', sortedUserIds);

            if (profilesError) throw profilesError;

            const profileMap = (profiles || []).reduce((acc: any, p) => {
                acc[p.id] = p;
                return acc;
            }, {});

            const mergedData = sortedUserIds.map(uid => ({
                ...finalScores[uid],
                profiles: profileMap[uid] || { full_name: 'Anonymous User' }
            })).slice(0, 50);

            setLeaders(mergedData);
        } catch (error) {
            // Error fetching leaders - silent fail for production
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-white max-w-xl mx-auto pb-32">
            <header className="px-6 py-6 sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 transition-colors hover:bg-slate-50 rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Leaderboard</h1>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">First Attempt Only</span>
                </div>
            </header>

            <div className="px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-bold text-slate-600">Global Rankings</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>

                <div className="space-y-1">
                    {loading ? (
                        <LeaderboardSkeleton count={15} />
                    ) : leaders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 text-sm italic">
                            No heroes recorded yet.
                        </div>
                    ) : (
                        leaders.map((entry, idx) => {
                            const rank = idx + 1;
                            const isTop3 = rank <= 3;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={entry.user_id}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group
                                        ${isTop3 ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 flex items-center justify-center font-black text-xs
                                            ${rank === 1 ? 'text-yellow-600' :
                                                rank === 2 ? 'text-slate-400' :
                                                    rank === 3 ? 'text-amber-700' : 'text-slate-300'}`}
                                        >
                                            {rank === 1 ? <Trophy className="w-4 h-4" /> : `${rank}`}
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm leading-tight">
                                                {entry.profiles.full_name}
                                            </h3>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                {entry.quiz_count} Unique Quizzes
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <span className={`font-black text-lg ${isTop3 ? 'text-indigo-600' : 'text-slate-700'}`}>
                                                {entry.total_score}
                                            </span>
                                            <Star className={`w-3.5 h-3.5 ${isTop3 ? 'fill-indigo-600 text-indigo-600' : 'text-slate-200'}`} />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Points</span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass p-2 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl">
                    <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><HomeIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-indigo-600">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><Trophy className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/author" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
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

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
