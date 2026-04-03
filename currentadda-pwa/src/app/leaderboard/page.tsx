'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getProxiedImageUrl } from '@/lib/supabase';
import {
    Trophy, ArrowLeft, Crown, Medal, Star, Zap,
    Search, Users, ChevronDown, Home, LayoutGrid,
    User as UserIcon, Flame, Target, TrendingUp, FileDown
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { startOfWeek, startOfMonth } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/BottomNav';

type TimeFilter = 'all' | 'monthly' | 'weekly';

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [allLeaders, setAllLeaders] = useState<any[]>([]);
    const [filteredLeaders, setFilteredLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [currentUserRank, setCurrentUserRank] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(30);

    useEffect(() => {
        let mounted = true;
        fetchLeaders(mounted);
        return () => { mounted = false; };
    }, [timeFilter]);

    useEffect(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return setFilteredLeaders(allLeaders);
        setFilteredLeaders(allLeaders.filter(l =>
            l.profiles.full_name.toLowerCase().includes(q)
        ));
    }, [searchQuery, allLeaders]);

    const fetchLeaders = useCallback(async (mounted: boolean) => {
        try {
            if (mounted) { setLoading(true); setErrorMsg(null); setSearchQuery(''); setDisplayLimit(30); }

            let allScores: any[] = [];
            let from = 0;
            const step = 1000;
            let hasMore = true;

            while (hasMore && from < 15000) {
                let query = supabase
                    .from('scores')
                    .select('user_id, quiz_id, score, created_at')
                    .order('created_at', { ascending: true })
                    .range(from, from + step - 1);

                if (timeFilter === 'weekly') {
                    query = query.gte('created_at', startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString());
                } else if (timeFilter === 'monthly') {
                    query = query.gte('created_at', startOfMonth(new Date()).toISOString());
                }

                const { data, error } = await query;
                if (error) throw error;
                if (!data || data.length === 0) { hasMore = false; break; }
                allScores = [...allScores, ...data];
                from += step;
                if (data.length < step) hasMore = false;
            }

            if (allScores.length === 0) {
                if (mounted) { setAllLeaders([]); setFilteredLeaders([]); setLoading(false); }
                return;
            }

            // ⚠️ Filter out rows with no user_id (prevents duplicate empty-string keys)
            const validScores = allScores.filter(s => s.user_id && s.user_id.trim() !== '');

            if (validScores.length === 0) {
                if (mounted) { setAllLeaders([]); setFilteredLeaders([]); setLoading(false); }
                return;
            }

            // Deduplicate: first attempt per user+quiz
            const firstAttempts: Record<string, any> = {};
            [...validScores].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .forEach(s => {
                    const key = `${s.user_id}_${s.quiz_id}`;
                    if (!firstAttempts[key]) firstAttempts[key] = s;
                });

            // Aggregate
            const agg: Record<string, any> = {};
            Object.values(firstAttempts).forEach((s: any) => {
                const uid = s.user_id;
                if (!agg[uid]) agg[uid] = { user_id: uid, total_score: 0, quiz_count: 0 };
                agg[uid].total_score += s.score;
                agg[uid].quiz_count += 1;
            });

            const sortedIds = Object.keys(agg).sort((a, b) => agg[b].total_score - agg[a].total_score);

            // Fetch profiles in batches of 100
            let allProfiles: any[] = [];
            for (let i = 0; i < sortedIds.length; i += 100) {
                const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', sortedIds.slice(i, i + 100));
                if (data) allProfiles = [...allProfiles, ...data];
            }
            const profileMap = allProfiles.reduce((acc: any, p) => { acc[p.id] = p; return acc; }, {});

            const merged = sortedIds.map((uid, index) => {
                const entry = { ...agg[uid], profiles: profileMap[uid] || { full_name: 'Anonymous' }, rank: index + 1 };
                if (user && uid === user.id) setCurrentUserRank(entry);
                return entry;
            });

            if (mounted) { setAllLeaders(merged); setFilteredLeaders(merged); }
        } catch (err: any) {
            console.error(err);
            if (mounted) setErrorMsg(err.message || 'Failed to load');
        } finally {
            if (mounted) setLoading(false);
        }
    }, [timeFilter, user]);

    const top3 = filteredLeaders.slice(0, 3);
    const rest = filteredLeaders.slice(3, displayLimit);
    const hasMore = displayLimit < filteredLeaders.length;

    return (
        <main className="min-h-screen max-w-xl mx-auto relative overflow-x-hidden bg-[#08081a]">
            {/* ── BG Orbs ── */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-700/20 blur-[120px]" />
                <div className="absolute top-[40%] -left-24 w-64 h-64 rounded-full bg-purple-700/15 blur-[80px]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-700/10 blur-[100px]" />
            </div>

            {/* ── Header ── */}
            <header className="relative z-20 px-5 pt-6 pb-4 flex items-center justify-between">
                <Link href="/" className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/15 transition-all active:scale-95">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="text-center">
                    <h1 className="text-white font-black text-lg tracking-tight flex items-center gap-2 justify-center">
                        <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
                        Leaderboard
                    </h1>
                    <p className="text-white/30 text-[9px] uppercase tracking-[0.25em] font-bold mt-0.5">Honor Roll</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
                    <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Live</span>
                </div>
            </header>

            {/* ── Tab Switcher ── */}
            <div className="relative z-20 px-5 mt-2">
                <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10">
                    {(['all', 'monthly', 'weekly'] as TimeFilter[]).map(f => (
                        <button key={f} onClick={() => setTimeFilter(f)}
                            className="relative py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all z-10">
                            <span className={`relative z-10 ${timeFilter === f ? 'text-white' : 'text-white/30 hover:text-white/60'}`}>
                                {f === 'all' ? 'All Time' : f === 'monthly' ? 'Monthly' : 'Weekly'}
                            </span>
                            {timeFilter === f && (
                                <motion.div layoutId="tab" transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                                    className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10 shadow-lg shadow-indigo-500/30" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="relative z-10 px-5 pb-52 mt-6">
                {errorMsg ? (
                    <div className="mt-16 flex flex-col items-center gap-5 text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Zap className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <p className="text-red-400 font-black text-xs uppercase tracking-widest">Connection Error</p>
                            <p className="text-white/40 text-sm font-bold mt-1">ડેટા લોડ કરવામાં સમસ્યા</p>
                        </div>
                        <button onClick={() => fetchLeaders(true)}
                            className="px-8 py-3 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-400 active:scale-95 transition-all shadow-lg shadow-red-500/30">
                            Try Again
                        </button>
                    </div>
                ) : loading ? (
                    <LoadingSkeleton />
                ) : allLeaders.length === 0 ? (
                    <div className="mt-24 text-center">
                        <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 font-bold uppercase text-xs tracking-widest">No Data Yet</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {/* ── Podium ── */}
                        {!searchQuery && (
                            <motion.div key="podium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                {/* #1 Hero Card */}
                                {top3[0] && <HeroCard entry={top3[0]} />}

                                { /* #2 and #3 cards with unique keys */ }
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    {[top3[1], top3[2]].filter(Boolean).map((entry, i) => (
                                        <SilverBronzeCard key={`top-${entry.user_id}-${entry.rank}`} entry={entry} rank={entry.rank} delay={0.1 * (i + 1)} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Stats Bar ── */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                            className="mt-5 grid grid-cols-3 gap-2">
                            <StatPill icon={<Users className="w-3 h-3 text-indigo-400" />} label="Players" value={allLeaders.length.toString()} />
                            <StatPill icon={<TrendingUp className="w-3 h-3 text-amber-400" />} label="Top Score" value={allLeaders[0]?.total_score?.toString() ?? '—'} />
                            <StatPill icon={<Target className="w-3 h-3 text-emerald-400" />} label="Filter" value={timeFilter === 'all' ? 'All' : timeFilter === 'monthly' ? 'Month' : 'Week'} />
                        </motion.div>

                        {/* ── Search ── */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                            className="mt-4 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                            <input
                                type="text" placeholder="Search candidates..." value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white text-sm font-medium placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                            />
                        </motion.div>

                        {/* ── Full List ── */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">Full Ranking</span>
                                <span className="text-white/20 text-[9px] font-bold">{filteredLeaders.length} candidates</span>
                            </div>
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {rest.map((entry, idx) => (
                                        <RankRow key={`row-${entry.user_id}-${entry.rank}`} entry={entry}
                                            isMe={user ? entry.user_id === user.id : false}
                                            delay={idx < 10 ? idx * 0.025 : 0}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {hasMore && (
                                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setDisplayLimit(p => p + 30)}
                                    className="mt-4 w-full py-4 rounded-[1.5rem] border border-white/10 bg-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white/80 transition-all flex items-center justify-center gap-2">
                                    Load More
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* ── Floating Rank Banner ── */}
            {user && currentUserRank && !loading && (
                <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                    className="fixed bottom-[100px] left-0 w-full px-5 z-40 pointer-events-none max-w-xl mx-auto" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border border-indigo-600/30 rounded-[2rem] p-4 flex items-center justify-between shadow-[0_20px_60px_rgba(79,70,229,0.5)] pointer-events-auto overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                                <span className="text-[7px] font-black text-indigo-300 uppercase tracking-wider opacity-70">Rank</span>
                                <span className="text-lg font-black text-white leading-none">#{currentUserRank.rank}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                                    <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.2em]">Your Score</span>
                                </div>
                                <p className="text-white font-black text-sm leading-none">
                                    {currentUserRank.profiles?.full_name?.split(' ')[0]} · {currentUserRank.quiz_count} quizzes
                                </p>
                            </div>
                        </div>
                        <div className="relative z-10 text-right">
                            <div className="text-2xl font-black text-white tabular-nums leading-none">{currentUserRank.total_score}</div>
                            <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">points</div>
                        </div>
                    </div>
                </motion.div>
            )}

            <BottomNav theme="dark" />
        </main>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────────────────────

function NavBtn({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <Link href={href} className="p-3 text-white/30 hover:text-white/70 transition-all rounded-2xl">
            {icon}
        </Link>
    );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">{icon}<span className="text-white/30 text-[8px] font-black uppercase tracking-wider">{label}</span></div>
            <div className="text-white font-black text-sm leading-none">{value}</div>
        </div>
    );
}

function HeroCard({ entry }: { entry: any }) {
    return (
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="relative rounded-[2.5rem] overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/80 via-amber-900/60 to-indigo-950/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.25),transparent_60%)]" />
            {/* Shiny top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="relative z-10 p-6 flex items-center gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden border-2 border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                        {entry.profiles?.avatar_url
                            ? <img src={getProxiedImageUrl(entry.profiles.avatar_url)} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-indigo-900/50 flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-amber-400/50" />
                              </div>}
                    </div>
                    {/* Crown */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Crown className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </div>
                    {/* Badge */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center border-2 border-[#08081a] shadow-lg">
                        <span className="text-white font-black text-[10px]">#1</span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-400 text-[8px] font-black uppercase tracking-[0.25em]">Champion</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <h2 className="text-white font-black text-xl leading-none truncate mb-3">
                        {entry.profiles?.full_name}
                    </h2>
                    <div className="flex items-end gap-1.5">
                        <span className="text-amber-400 font-black text-3xl leading-none tabular-nums">{entry.total_score}</span>
                        <span className="text-amber-600 text-[9px] font-black uppercase tracking-widest mb-1">pts</span>
                    </div>
                    <p className="text-white/30 text-[9px] font-bold uppercase tracking-wide mt-1">{entry.quiz_count} quizzes played</p>
                </div>
            </div>
        </motion.div>
    );
}

function SilverBronzeCard({ entry, rank, delay }: { entry: any; rank: number; delay: number }) {
    const isSilver = rank === 2;
    const colors = isSilver
        ? { from: 'from-slate-700/60', via: 'via-slate-600/40', badge: 'bg-slate-400', glow: 'shadow-[0_0_20px_rgba(148,163,184,0.2)]', text: 'text-slate-300', border: 'border-slate-500/30' }
        : { from: 'from-orange-950/60', via: 'via-orange-900/40', badge: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(234,88,12,0.2)]', text: 'text-orange-300', border: 'border-orange-600/30' };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            className={`relative rounded-[2rem] overflow-hidden border ${colors.border} ${colors.glow}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.via} to-indigo-950/60`} />
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isSilver ? 'via-slate-400/30' : 'via-orange-500/30'} to-transparent`} />

            <div className="relative z-10 p-4 flex flex-col items-center text-center gap-3">
                <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl overflow-hidden border border-white/10`}>
                        {entry.profiles?.avatar_url
                            ? <img src={getProxiedImageUrl(entry.profiles.avatar_url)} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-white/5 flex items-center justify-center"><UserIcon className="w-6 h-6 text-white/20" /></div>}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-7 h-7 ${colors.badge} rounded-xl flex items-center justify-center border-2 border-[#08081a] shadow-md`}>
                        <span className="text-white font-black text-[9px]">#{rank}</span>
                    </div>
                </div>
                <div>
                    <p className="text-white font-black text-[13px] leading-tight truncate max-w-[90px]">{entry.profiles?.full_name?.split(' ')[0]}</p>
                    <div className={`${colors.text} font-black text-xl leading-none mt-1 tabular-nums`}>{entry.total_score}</div>
                    <p className="text-white/20 text-[8px] font-bold uppercase tracking-wide mt-0.5">points</p>
                </div>
            </div>
        </motion.div>
    );
}

function RankRow({ entry, isMe, delay }: { entry: any; isMe: boolean; delay: number }) {
    return (
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ delay, duration: 0.35 }}
            className={`flex items-center gap-3 p-3.5 rounded-[1.5rem] border transition-all relative overflow-hidden group
                ${isMe
                    ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/60 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'}`}>
            {/* Number */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] flex-shrink-0
                ${isMe ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/5 text-white/30 group-hover:text-white/60'}`}>
                #{entry.rank}
            </div>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border
                ${isMe ? 'border-indigo-400/30' : 'border-white/5'}`}>
                {entry.profiles?.avatar_url
                    ? <img src={getProxiedImageUrl(entry.profiles.avatar_url)} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-white/5 flex items-center justify-center"><UserIcon className="w-4 h-4 text-white/20" /></div>}
            </div>

            {/* Name & Quizzes */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={`font-black text-[13px] leading-tight truncate ${isMe ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
                        {entry.profiles?.full_name}
                    </h3>
                    {isMe && <span className="bg-indigo-500 text-[7px] text-white font-black px-1.5 py-0.5 rounded-lg uppercase tracking-wide flex-shrink-0">You</span>}
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${isMe ? 'text-indigo-300/60' : 'text-white/20'}`}>
                    {entry.quiz_count} quizzes
                </p>
            </div>

            {/* Score */}
            <div className="text-right flex-shrink-0">
                <div className={`font-black text-base tabular-nums leading-none ${isMe ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>
                    {entry.total_score}
                </div>
                {entry.rank <= 10 && (
                    <div className="flex justify-end mt-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse mt-2">
            {/* Hero skeleton */}
            <div className="h-36 bg-white/5 rounded-[2.5rem]" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-32 bg-white/5 rounded-[2rem]" />
                <div className="h-32 bg-white/5 rounded-[2rem]" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
                {[0, 1, 2].map(i => <div key={`stat-skel-${i}`} className="h-14 bg-white/5 rounded-2xl" />)}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={`row-skel-${i}`} className="h-16 bg-white/5 rounded-[1.5rem]" />
            ))}
        </div>
    );
}
