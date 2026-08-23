'use client';

import { useState, useEffect } from 'react';
import { supabase, getProxiedImageUrl } from '@/lib/supabase';
import {
    Book, BookOpen, ChevronRight, Trophy, Search, User, Loader2,
    ArrowDown, LayoutGrid, Flame, Sparkles, Clock,
    Target, Award,
    PlayCircle, Calendar, FileText, CheckCircle2, ExternalLink, ShieldCheck, Layers
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format, subMonths, startOfMonth, endOfMonth, isToday, isYesterday, differenceInDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { parseSearchDate } from '@/lib/searchUtils';
import { QuizListSkeleton, SearchBarSkeleton, FeaturedQuizSkeleton, HeroSkeleton } from '@/components/SkeletonLoader';
import NotificationBell from '@/components/NotificationBell';
import BottomNav from '@/components/BottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';

const ITEMS_PER_PAGE = 10;

export default function HomeClient({ initialQuizzes = [] }: { initialQuizzes?: any[] }) {
    // Initialize with server data if available
    const [quizzes, setQuizzes] = useState<any[]>(initialQuizzes);
    const [loading, setLoading] = useState(false);
    // If we have initial data, we are not "initial loading"
    const [initialLoading, setInitialLoading] = useState(initialQuizzes.length === 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const { user, loading: authLoading } = useAuth();

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Generate last 6 months
    const recentMonths = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i));

    // Debounce search
    useEffect(() => {
        // Skip the first fetch if we already have data and no search/filter is active
        if (page === 0 && quizzes.length > 0 && !searchQuery && !selectedMonth) {
            return;
        }

        const timer = setTimeout(() => {
            setPage(0);
            setHasMore(true);
            fetchQuizzes(0, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedMonth]);

    const fetchQuizzes = async (pageNumber: number, reset: boolean = false) => {
        if (reset) {
            setLoading(true);
            if (pageNumber === 0 && quizzes.length === 0) setInitialLoading(true);
        } else {
            setLoading(true);
        }

        try {
            let query = supabase
                .from('quizzes')
                .select('*', { count: 'exact' })
                .order('quiz_date', { ascending: false });

            // Apply Search Filter
            if (searchQuery) {
                const parsedDateRange = parseSearchDate(searchQuery);
                const conditions = [
                    `title.ilike.%${searchQuery}%`,
                    `slug.ilike.%${searchQuery}%`,
                    `date_str.ilike.%${searchQuery}%`
                ];

                if (parsedDateRange) {
                    conditions.push(`and(quiz_date.gte.${parsedDateRange.start},quiz_date.lte.${parsedDateRange.end})`);
                }

                query = query.or(conditions.join(','));
            }

            // Apply Month Filter
            if (selectedMonth) {
                const start = startOfMonth(selectedMonth).toISOString();
                const end = endOfMonth(selectedMonth).toISOString();
                query = query.gte('quiz_date', start).lte('quiz_date', end);
            }

            const from = pageNumber * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { data, error, count } = await query.range(from, to);

            if (error) throw error;

            if (data) {
                setQuizzes(prev => reset ? data : [...prev, ...data]);

                if (count !== null) {
                    setHasMore(from + data.length < count);
                } else {
                    setHasMore(data.length === ITEMS_PER_PAGE);
                }
            }
        } catch (err) {
            console.error('Error fetching quizzes:', err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchUserStats();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();
            if (data) setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const fetchUserStats = async () => {
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('*')
                .eq('user_id', user?.id);

            if (data) {
                const totalQuizzes = data.length;
                const totalScore = data.reduce((acc, curr) => acc + curr.score, 0);
                const totalQuestions = data.reduce((acc, curr) => acc + curr.total_questions, 0);
                const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

                setUserStats({
                    totalQuizzes,
                    totalScore,
                    accuracy,
                    totalQuestions
                });
            }
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchQuizzes(nextPage, false);
    };

    const getQuizDateLabel = (quizDate: string) => {
        const date = new Date(quizDate);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        const daysAgo = differenceInDays(new Date(), date);
        if (daysAgo <= 7) return `${daysAgo} days ago`;
        return format(date, 'MMM dd, yyyy');
    };

    if (authLoading && !initialQuizzes.length) return <HeroSkeleton />;

    return (
        <main className="min-h-screen pb-32 overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Modern Glassmorphic Header */}
            <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
                <div className="max-w-xl mx-auto px-5 py-3 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                            <div className="w-full h-full bg-white rounded-[0.875rem] flex items-center justify-center">
                                <Image
                                    src="/newlogo.png"
                                    alt="CurrentAdda - Daily Gujarati Current Affairs Quiz Logo"
                                    width={36}
                                    height={36}
                                    className="object-contain mix-blend-multiply"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                                CurrentAdda
                            </span>
                            <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5 opacity-60">Daily Exams Prep</span>
                        </div>
                    </Link>
                    {user ? (
                        <div className="flex items-center gap-2">
                            {profile?.streak_count > 0 && (
                                <div
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100/50 animate-fade-in"
                                >
                                    <Flame className="w-4 h-4 text-orange-600 fill-orange-600 animate-pulse" />
                                    <span className="text-sm font-black text-orange-700">{profile.streak_count}</span>
                                </div>
                            )}
                            <Link href="/profile" className="relative group">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 transition-all">
                                    <div className="w-full h-full rounded-[0.875rem] bg-white flex items-center justify-center overflow-hidden">
                                        {profile?.avatar_url ? (
                                            <img src={getProxiedImageUrl(profile.avatar_url)} alt={`${profile.full_name}'s Profile Image`} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-indigo-600" />
                                        )}
                                    </div>
                                </div>
                            </Link>
                            <NotificationBell />
                        </div>
                    ) : (
                        <Link href="/auth/login" className="text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-2xl hover:shadow-lg hover:shadow-indigo-200 transition-all">
                            Join Now
                        </Link>
                    )}
                </div>
            </header>

            {/* Breadcrumb Navigation for SEO hierarchy */}
            <div className="max-w-xl mx-auto px-5 pt-3">
                <Breadcrumbs items={[
                    { name: 'Home', item: '/' },
                    { name: 'Current Affairs in Gujarati', item: '/current-affairs-in-gujarati' }
                ]} />
            </div>

            {/* Hero Section with User Stats */}
            {user && (
                <section className="relative px-5 pt-4 pb-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 via-rose-50 to-transparent rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />

                    <div className="max-w-xl mx-auto relative z-10 animate-fade-in-up">
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-slate-900 mb-1">
                                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">Let's continue your learning journey on CurrentAdda</p>
                        </div>

                        {userStats && (
                            <div className="grid grid-cols-3 gap-3">
                                <StatCard
                                    icon={<Trophy className="w-4 h-4" />}
                                    value={userStats.totalQuizzes}
                                    label="Quizzes"
                                    gradient="from-amber-400 to-orange-500"
                                />
                                <StatCard
                                    icon={<Target className="w-4 h-4" />}
                                    value={`${userStats.accuracy}%`}
                                    label="Accuracy"
                                    gradient="from-indigo-400 to-purple-500"
                                />
                                <StatCard
                                    icon={<Award className="w-4 h-4" />}
                                    value={userStats.totalScore}
                                    label="Points"
                                    gradient="from-emerald-400 to-teal-500"
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Guest Hero Section with Primary H1 & Top Summary */}
            {!user && (
                <section className="relative px-5 pt-6 pb-8 overflow-hidden text-balance">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />

                    <div className="max-w-xl mx-auto relative z-10 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Daily Updated • 100% Free Platform</span>
                        </div>
                        
                        {/* Clear Keyword-Rich Primary H1 */}
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4 gujarati-text">
                            ગુજરાતી કરંટ અફેર્સ 2026 — <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">GPSC & GSSSB દૈનિક મોક ટેસ્ટ</span>
                        </h1>

                        {/* Top-of-Page Key Takeaway Summary Block (AEO / GEO) */}
                        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white p-5 rounded-2xl border border-indigo-100 mb-6 text-left shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider gujarati-text">
                                    📌 Key Takeaway / સારાંશ
                                </span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed gujarati-text font-medium">
                                CurrentAdda એ GPSC, GSSSB CCE (7338 જગ્યા), PSI, અને તલાટી પરીક્ષાના ઉમેદવારો માટે દૈનિક ગુજરાતી કરંટ અફેર્સ (Daily Current Affairs in Gujarati) અને ફ્રી ઓનલાઈન ક્વિઝ પ્લેટફોર્મ છે. અહીં દરરોજ રાષ્ટ્રીય, આંતરરાષ્ટ્રીય અને ગુજરાત રાજ્યના મહત્વપૂર્ણ બનાવોના પૃથક્કરણ સાથે પ્રશ્નો અપડેટ કરવામાં આવે છે. ઉમેદવારો ફ્રી ક્વિઝ આપીને પોતાનો રેન્ક અને સ્પષ્ટતા ચકાસી શકે છે.
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-xl mx-auto px-5 relative z-20">
                {/* Featured Quiz Spotlight */}
                {initialLoading ? (
                    <FeaturedQuizSkeleton />
                ) : quizzes.length > 0 && (
                    <div className="mb-8 animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Featured Daily Quiz</h2>
                        </div>
                        <Link href={`/quiz/${quizzes[0].slug}`} className="block group">
                            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200/50 group-hover:shadow-indigo-300/60 transition-all">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <PlayCircle className="w-4 h-4 text-white fill-white" />
                                        </div>
                                        <span className="text-xs font-black text-white/80 uppercase tracking-widest">Latest Release</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2 leading-tight gujarati-text pr-4 group-hover:scale-105 transition-transform origin-left">
                                        {quizzes[0].title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-white/80 text-xs font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{quizzes[0].date_str}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{getQuizDateLabel(quizzes[0].quiz_date)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide group-hover:shadow-lg transition-all">
                                            Start Quiz
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        {quizzes[0].quiz_date && (
                            <Link
                                href={`/daily/${quizzes[0].quiz_date}`}
                                className="mt-2 flex items-center justify-center gap-2 bg-white border-2 border-slate-100 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Read Notes & Answers
                            </Link>
                        )}
                    </div>
                )}

                {/* Category Quick Access */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-slate-900" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Exam Topics & Categories</h2>
                        </div>
                        <Link href="/categories" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { name: 'Politics', icon: '🏛️', color: 'from-blue-400 to-blue-600' },
                            { name: 'Sports', icon: '⚽', color: 'from-orange-400 to-red-600' },
                            { name: 'Science', icon: '🔬', color: 'from-purple-400 to-purple-600' },
                            { name: 'Tech', icon: '💻', color: 'from-emerald-400 to-teal-600' },
                        ].map((cat) => (
                            <Link key={cat.name} href="/categories" className="group">
                                <div className={`bg-gradient-to-br ${cat.color} p-4 rounded-2xl text-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                                    <div className="text-2xl mb-1">{cat.icon}</div>
                                    <span className="text-[8px] font-black text-white uppercase tracking-wide">{cat.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Current Affairs Guide & Monthly Access */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Monthly Current Affairs Archives</h2>
                        </div>
                        <Link href="/current-affairs-in-gujarati" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            Full Guide
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {recentMonths.slice(0, 3).map((month) => {
                            const monthSlug = format(month, 'MMMM').toLowerCase() + '-' + format(month, 'yyyy');
                            return (
                                <Link
                                    key={month.toISOString()}
                                    href={`/current-affairs-in-gujarati/${monthSlug}`}
                                    className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group text-center"
                                >
                                    <Calendar className="w-4 h-4 text-indigo-400 mx-auto mb-1.5 group-hover:text-indigo-600 transition-colors" />
                                    <div className="text-[10px] font-black text-slate-900 group-hover:text-indigo-600 uppercase transition-colors">
                                        {format(month, 'MMM yyyy')}
                                    </div>
                                    <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">Monthly CA</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Search & Filter Section */}
                {initialLoading ? (
                    <SearchBarSkeleton />
                ) : (
                    <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/40 mb-8 border border-slate-100">
                        <div className="relative group mb-4">
                            <input
                                type="text"
                                placeholder="Search quizzes by date or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-200 focus:bg-white transition-all text-slate-700 text-sm font-medium placeholder:text-slate-400"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        </div>

                        {/* Month Filter Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0
                  ${selectedMonth === null
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                All Time
                            </button>
                            {recentMonths.map((date) => {
                                const isActive = selectedMonth && format(selectedMonth, 'MMM yy') === format(date, 'MMM yy');
                                return (
                                    <button
                                        key={date.toISOString()}
                                        onClick={() => setSelectedMonth(isActive ? null : date)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0
                      ${isActive
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        {format(date, 'MMM yy')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quiz List */}
                <div className="space-y-3 min-h-[30vh]">
                    {initialLoading ? (
                        <QuizListSkeleton count={6} />
                    ) : (
                        <>
                            <div className="flex items-center justify-between px-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
                                        {quizzes.length} Quizzes Available
                                    </span>
                                </div>
                                <Link href="/archive" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    Browse Archive
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {quizzes.length === 0 && !loading && (
                                <div className="bg-white py-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                                    <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto">
                                        <Search className="w-7 h-7 text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="text-slate-900 font-black text-base mb-1">No quizzes found</p>
                                        <p className="text-slate-400 font-medium text-sm gujarati-text">Try adjusting your search criteria</p>
                                    </div>
                                </div>
                            )}

                            {quizzes.slice(1).map((quiz) => {
                                const isIndiaBix = quiz.source_url?.includes('indiabix.com');
                                const displayTitle = isIndiaBix && !quiz.title.includes('IndiaBix')
                                    ? `IndiaBix - ${quiz.title}`
                                    : quiz.title;

                                return (
                                    <div key={quiz.id}>
                                        <Link
                                            href={`/quiz/${quiz.slug}`}
                                            className="block bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all group"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className={`w-2 h-2 rounded-full ${isIndiaBix ? 'bg-orange-500' : 'bg-indigo-500'}`} />
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                            {quiz.date_str || 'Practice Quiz'}
                                                        </span>
                                                        {isIndiaBix && (
                                                            <span className="text-[7px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                                                                IndiaBix
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug pr-4 line-clamp-2">
                                                        {displayTitle}
                                                    </h3>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{getQuizDateLabel(quiz.quiz_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                        {quiz.quiz_date && (
                                            <div className="flex justify-end mt-1.5 mr-1">
                                                <Link
                                                    href={`/daily/${quiz.quiz_date}`}
                                                    className="flex items-center gap-1 text-[8px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    Read Notes
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {loading && !initialLoading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-7 h-7 animate-spin mb-3 text-indigo-600" />
                                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Loading more quizzes...</span>
                                </div>
                            )}

                            {!loading && hasMore && quizzes.length > 0 && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                    Load More Quizzes
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Proof & Verified Experience Badge (GEO Trust Signal) */}
                <section className="mt-12 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-[2.5rem] p-6 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-black uppercase text-emerald-300 mb-2">
                                Verified Experience &amp; Author Proof
                            </div>
                            <p className="text-xs text-emerald-100 font-medium gujarati-text leading-relaxed">
                                CurrentAdda ના 10,000+ પ્રશ્નો <strong>Ajay Ambaliya</strong> દ્વારા સત્તાવાર સરકારી સ્ત્રોતો જેવા કે <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">PIB India</a>, <a href="https://gpsc.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">GPSC Portal</a> અને <a href="https://gsssb.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">GSSSB Portal</a> ના આધારે ચકાસીને તૈયાર કરવામાં આવે છે.
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-[10px] font-bold text-emerald-300">
                                <span>✔ 10,000+ Verified MCQs</span>
                                <span>✔ Daily Instant Scores</span>
                                <span>✔ 100% Free Access</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Structured AEO Question-Style Headings & Direct Answer Blocks */}
                <section className="mt-12 space-y-8 border-t border-slate-100 pt-10">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        
                        {/* Definition & Audience Clarity */}
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">
                                Definition &amp; Scope
                            </span>
                            <h2 className="text-xl font-black text-slate-900 mt-2 mb-3">
                                ગુજરાતીમાં કરંટ અફેર્સ શું છે? (Current Affairs in Gujarati Definition)
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
                                કરંટ અફેર્સ (Current Affairs in Gujarati) એટલે વર્તમાન સમયની મહત્વપૂર્ણ રાષ્ટ્રીય, આંતરરાષ્ટ્રીય અને ગુજરાત રાજ્યની ઘટનાઓ, નીતિઓ અને સરકારી યોજનાઓ જે સ્પર્ધાત્મક પરીક્ષાઓના 20% થી 30% ગુણભારાંકમાં મહત્વનો ભાગ ભજવે છે.
                            </p>
                        </div>

                        <hr className="border-slate-100" />

                        {/* AEO Question 1 */}
                        <div>
                            <h2 className="text-lg font-black text-slate-900 mb-2">
                                ગુજરાતીમાં કરંટ અફેર્સ કેમ મહત્વના છે?
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed gujarati-text font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                GPSC, GSSSB CCE અને તલાટી જેવી ગુજરાતની સ્પર્ધાત્મક પરીક્ષાઓમાં 20% થી 30% ગુણ કરંટ અફેર્સ સંબંધિત પ્રશ્નોના હોય છે. દરરોજ ગુજરાતીમાં કરંટ અફેર્સ વાંચવાથી સામાન્ય જ્ઞાન મજબૂત થાય છે અને મુખ્ય પરીક્ષા (Mains) તેમજ પ્રિલિમ્સમાં ગુણ મેળવવામાં મદદ મળે છે. CurrentAdda પર અપડેટ થતા પ્રશ્નો પરીક્ષાના તાજેતરના ટ્રેન્ડ અને સિલેબસ અનુસાર તૈયાર કરવામાં આવે છે.
                            </p>
                        </div>

                        {/* AEO Question 2 */}
                        <div>
                            <h2 className="text-lg font-black text-slate-900 mb-2">
                                આજના કરંટ અફેર્સ કેવી રીતે વાંચવા અને ક્વિઝ આપવી?
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed gujarati-text font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                દૈનિક કરંટ અફેર્સની શ્રેષ્ઠ તૈયારી માટે સૌપ્રથમ દરરોજના મહત્વના સમાચાર અને નોટ્સ વાંચો, ત્યારબાદ તરત જ 10 પ્રશ્નોની Daily MCQ Quiz આપો. ક્વિઝ પૂરી થયા પછી દરેક ખોટા પડેલા પ્રશ્નનું વિગતવાર સ્પષ્ટીકરણ (Explanation) વાંચો. અઠવાડિયાના અંતે રિવિઝન ક્વિઝ આપીને તમારી તૈયારીની સમીક્ષા કરો.
                            </p>
                        </div>

                        {/* AEO Question 3 */}
                        <div>
                            <h2 className="text-lg font-black text-slate-900 mb-2">
                                GPSC, GSSSB, PSI અને Talati માટે કયા કરંટ અફેર્સ ઉપયોગી છે?
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed gujarati-text font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                સ્પર્ધાત્મક પરીક્ષાઓ માટે છેલ્લા 6 થી 12 મહિનાના કરંટ અફેર્સ સૌથી વધુ ઉપયોગી છે. यामध्ये ગુજરાત સરકારની યોજનાઓ, બજેટ, આર્થિક સમીક્ષા, રમતગમત પુરસ્કારો, મહત્વના દિવસો અને વૈજ્ઞાનિક શોધો જેવા વિષયોનો સમાવેશ થાય છે. CurrentAdda આ તમામ વિષયોને વર્ગ-વાર અને વિષયવાર ક્વિઝ સ્વરૂપે આવરી લે છે.
                            </p>
                        </div>

                    </div>
                </section>

                {/* 3-Step Preparation Checklist (Structured Answer Support) */}
                <section className="mt-8">
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-indigo-300" />
                            <h2 className="text-lg font-black tracking-wide">
                                3-Step Exam Preparation Guide with CurrentAdda
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-black flex-shrink-0">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-indigo-200">Step 1: Daily Reading (રોજિંદું વાંચન)</h3>
                                    <p className="text-xs text-indigo-100/90 gujarati-text mt-1">
                                        દરરોજના મહત્વના રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય બનાવોના પૃથક્કરણ અને ટૂંકી નોટ્સ વાંચો.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-black flex-shrink-0">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-purple-200">Step 2: Interactive Quiz (દૈનિક ક્વિઝ)</h3>
                                    <p className="text-xs text-indigo-100/90 gujarati-text mt-1">
                                        10 મિનિટ ફાળવીને Daily 10 MCQ Quiz આપો અને ઇન્સ્ટન્ટ સ્કોર તથા સ્પષ્ટીકરણ મેળવો.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-black flex-shrink-0">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-pink-200">Step 3: Leaderboard &amp; Revision (રિવિઝન અને લીડરબોર્ડ)</h3>
                                    <p className="text-xs text-indigo-100/90 gujarati-text mt-1">
                                        ઓલ-ગુજરાત લીડરબોર્ડ પર તમારો રેન્ક તપાસો અને માસિક નોટ્સ વડે નિયમિત રિવિઝન કરો.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Exam Comparison Table (Structured Answer & Exam Specificity) */}
                <section className="mt-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-4">
                            ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓ અને કરંટ અફેર્સ વેઇટેજ (Exam Weightage Table)
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="px-4 py-3 font-black text-slate-800 rounded-tl-xl">Exam Name</th>
                                        <th className="px-4 py-3 font-black text-slate-800">Vacancies / Stage</th>
                                        <th className="px-4 py-3 font-black text-slate-800">Current Affairs Marks</th>
                                        <th className="px-4 py-3 font-black text-slate-800 rounded-tr-xl">Focus Topics</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="px-4 py-3 font-black text-slate-900">GSSSB CCE 2026</td>
                                        <td className="px-4 py-3 text-slate-600">7,338 Posts (Class III)</td>
                                        <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-black">30 Marks (Prelims)</span></td>
                                        <td className="px-4 py-3 text-slate-600">Gujarat Schemes, Govt Policies, National News</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-black text-slate-900">GPSC Class 1-2</td>
                                        <td className="px-4 py-3 text-slate-600">Gazetted Officer Posts</td>
                                        <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-black">50+ Marks (GS-1 &amp; 2)</span></td>
                                        <td className="px-4 py-3 text-slate-600">Polity, Economy, Environment, Science Tech</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-black text-slate-900">PSI &amp; Police Bharti</td>
                                        <td className="px-4 py-3 text-slate-600">Sub-Inspector &amp; Constable</td>
                                        <td className="px-4 py-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-black">20-25 Marks</span></td>
                                        <td className="px-4 py-3 text-slate-600">Defence, Awards, Sports, National Security</td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-3 font-black text-slate-900">Talati cum Mantri</td>
                                        <td className="px-4 py-3 text-slate-600">Panchayat Service</td>
                                        <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black">15-20 Marks</span></td>
                                        <td className="px-4 py-3 text-slate-600">Gram Panchayat Schemes, Gujarat Updates</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Dedicated Exam Clusters & Outbound Government Links */}
                <section className="mt-8">
                    <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-black text-slate-900">
                            પરીક્ષાલક્ષી કરંટ અફેર્સ વિભાગો (Targeted Exam Clusters)
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-900 text-base mb-1">🏛️ GPSC Current Affairs</h3>
                                <p className="text-xs text-slate-600 gujarati-text mb-3">
                                    GPSC Class 1-2 અને DySO માટે ઉંડાણપૂર્વકનું પૃથક્કરણ અને બંધારણ-આર્થિક સમીક્ષા પ્રશ્નો.
                                </p>
                                <div className="flex items-center justify-between">
                                    <Link href="/current-affairs-in-gujarati" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                        Practice GPSC MCQs <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    <a href="https://gpsc.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 text-[10px] flex items-center gap-1">
                                        Official Portal <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-900 text-base mb-1">📝 GSSSB CCE 2026</h3>
                                <p className="text-xs text-slate-600 gujarati-text mb-3">
                                    7338 જગ્યાઓ માટે પ્રિલિમ્સના 30 માર્ક્સ અને મેન્સના 30 માર્ક્સની સંપૂર્ણ તૈયારી.
                                </p>
                                <div className="flex items-center justify-between">
                                    <Link href="/current-affairs-in-gujarati" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                        Practice CCE MCQs <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    <a href="https://gsssb.gujarat.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 text-[10px] flex items-center gap-1">
                                        Official Portal <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-900 text-base mb-1">🚔 PSI &amp; Police Constable</h3>
                                <p className="text-xs text-slate-600 gujarati-text mb-3">
                                    રમતગમત, સંરક્ષણ, કાયદાકીય સુધારા અને દેશના મહત્વપૂર્ણ બનાવોના પ્રશ્નો.
                                </p>
                                <div className="flex items-center justify-between">
                                    <Link href="/categories" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                        Police Practice Sets <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    <a href="https://pib.gov.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 text-[10px] flex items-center gap-1">
                                        PIB India <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <h3 className="font-black text-slate-900 text-base mb-1">🌾 Talati &amp; Panchayat Bharti</h3>
                                <p className="text-xs text-slate-600 gujarati-text mb-3">
                                    ગુજરાત રાજ્યની નવીનતમ યોજનાઓ, ગ્રામીણ વિકાસ અને દૈનિક પ્રશ્નો.
                                </p>
                                <div className="flex items-center justify-between">
                                    <Link href="/subjects" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                        Talati Quiz Bank <ChevronRight className="w-3 h-3" />
                                    </Link>
                                    <a href="https://t.me/currentadda" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 text-[10px] flex items-center gap-1">
                                        Telegram Channel <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Motivational Author Footer (GEO & Ownership Signal) */}
                <div className="py-16 text-center">
                    <Link href="/author" className="inline-block group">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 opacity-80">Designed &amp; Maintained by</span>
                            <span className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-all flex items-center gap-2">
                                Ajay Ambaliya
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Verified Creator" />
                            </span>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-xs">
                                Founder &amp; Educator • GPSC/GSSSB Current Affairs Specialist
                            </p>
                            <div className="flex items-center gap-3 mt-6 opacity-20">
                                <div className="w-8 h-px bg-slate-400" />
                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                                <div className="w-8 h-px bg-slate-400" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

function StatCard({ icon, value, label, gradient }: { icon: React.ReactNode, value: string | number, label: string, gradient: string }) {
    return (
        <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity blur-sm`} />
            <div className="relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
                <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${gradient} text-white mb-2`}>
                    {icon}
                </div>
                <div className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );
}
