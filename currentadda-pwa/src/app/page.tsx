'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Book, BookOpen, ChevronRight, Trophy, Search, User, Loader2,
  ArrowDown, LayoutGrid, Flame, Sparkles, Clock,
  Target, Star, TrendingUp, Calendar, Zap, Award,
  Brain, CheckCircle2, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format, subMonths, startOfMonth, endOfMonth, isToday, isYesterday, differenceInDays } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSearchDate } from '@/lib/searchUtils';
import { QuizListSkeleton, SearchBarSkeleton } from '@/components/SkeletonLoader';
import NotificationBell from '@/components/NotificationBell';

const ITEMS_PER_PAGE = 10;

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const { user } = useAuth();

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Generate last 6 months
  const recentMonths = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i));

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setHasMore(true);
      fetchQuizzes(0, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedMonth]);

  const fetchQuizzes = async (pageNumber: number, reset: boolean = false) => {
    if (reset) {
      setQuizzes([]);
      setLoading(true);
      if (pageNumber === 0) setInitialLoading(true);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const getQuizDateLabel = (quizDate: string) => {
    const date = new Date(quizDate);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const daysAgo = differenceInDays(new Date(), date);
    if (daysAgo <= 7) return `${daysAgo} days ago`;
    return format(date, 'MMM dd, yyyy');
  };

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
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                CurrentAdda
              </h1>
              <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5 opacity-60">Daily Exams Prep</span>
            </div>
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.streak_count > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100/50"
                >
                  <Flame className="w-4 h-4 text-orange-600 fill-orange-600 animate-pulse" />
                  <span className="text-sm font-black text-orange-700">{profile.streak_count}</span>
                </motion.div>
              )}
              <Link href="/profile" className="relative group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 transition-all">
                  <div className="w-full h-full rounded-[0.875rem] bg-white flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={`${profile.full_name}'s Profile Image`} className="w-full h-full object-cover" />
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

      {/* Hero Section with User Stats */}
      {user && (
        <section className="relative px-5 pt-8 pb-12 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 via-rose-50 to-transparent rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-xl mx-auto relative z-10"
          >
            {/* Welcome Message */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h2>
              <p className="text-sm text-slate-500 font-medium">Let's continue your learning journey on CurrentAdda</p>
            </div>

            {/* Stats Grid */}
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
          </motion.div>
        </section>
      )}

      {/* Guest Hero Section */}
      {!user && (
        <section className="relative px-5 pt-10 pb-12 overflow-hidden text-balance">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-xl mx-auto text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Daily Updated Current Affairs</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4">
              Master Your <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gujarat Mock Exams
              </span>
            </h2>
            <p className="text-slate-600 font-medium text-sm max-w-md mx-auto leading-relaxed gujarati-text">
              GPSC, GSSSB, તલાટી અને અન્ય તમામ ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓ માટે દૈનિક Current Affairs Quizzes.
            </p>
          </motion.div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-5 relative z-20">
        {/* Featured Quiz Spotlight */}
        {!initialLoading && quizzes.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Featured Quiz</h3>
            </div>
            <Link href={`/quiz/${quizzes[0].slug}`} className="block group">
              <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200/50 group-hover:shadow-indigo-300/60 transition-all">
                {/* Pattern Overlay */}
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
                  <div className="mt-4 inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wide group-hover:shadow-lg transition-all">
                    Start Quiz
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Category Quick Access */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-slate-900" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Categories</h3>
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
              <Link key={cat.name} href={`/categories`} className="group">
                <div className={`bg-gradient-to-br ${cat.color} p-4 rounded-2xl text-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <span className="text-[8px] font-black text-white uppercase tracking-wide">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search & Filter Section */}
        {initialLoading ? (
          <SearchBarSkeleton />
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/40 mb-8 border border-slate-100"
          >
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
          </motion.div>
        )}

        {/* Quiz List */}
        <div className="space-y-3 min-h-[40vh]">
          {initialLoading ? (
            <QuizListSkeleton count={6} />
          ) : (
            <>
              <div className="flex items-center gap-2 px-2 mb-4">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  {quizzes.length} Quizzes Available
                </h4>
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

              <AnimatePresence mode="popLayout">
                {quizzes.slice(1).map((quiz, index) => {
                  const isIndiaBix = quiz.source_url?.includes('indiabix.com');
                  const displayTitle = isIndiaBix && !quiz.title.includes('IndiaBix')
                    ? `IndiaBix - ${quiz.title}`
                    : quiz.title;

                  return (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                    >
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>

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

        {/* SEO Content Section */}
        <section className="mt-16 pb-8 border-t border-slate-100 pt-12">
          <div className="bg-white/50 rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">
              Best <span className="text-indigo-600">Current Affairs Gujarati</span> for Exam Success
            </h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
              <p>
                તમે જો ગુજરાત સરકારની સ્પર્ધાત્મક પરીક્ષાઓ જેવી કે <strong>GPSC, GSSSB, Police Bharti, Talati</strong> વગેરેની તૈયારી કરી રહ્યા હોવ, તો
                <strong> Current Affairs Gujarati (કરંટ અફેર્સ ગુજરાતી)</strong> તમારા માટે ખૂબ જ મહત્વનું છે.
              </p>
              <p>
                CurrentAdda એપ પર અમે તમને દરરોજ ફ્રીમાં <strong>Daily Current Affairs Quiz</strong> પ્રદાન કરીએ છીએ. અહીં તમને
                <strong> Gujarati Current Affairs 2026</strong> ની તમામ લેટેસ્ટ માહિતી અને પરીક્ષાલક્ષી મહત્વના પ્રશ્નો મળી રહેશે.
              </p>
              <ul className="grid grid-cols-1 gap-3 mt-4">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>GPSC Class 1-2 કરંટ અફેર્સ</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>ગૌણ સેવા પસંદગી મંડળ (GSSSB) પરીક્ષા તૈયારી</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>પોલીસ કોન્સ્ટેબલ અને PSI માટે દૈનિક ક્વિઝ</span>
                </li>
              </ul>
              <p className="mt-4">
                તમારા જ્ઞાનની ચકાસણી કરવા માટે આજે જ અમારા વિષયવાર (Subject-wise) અને દૈનિક ક્વિઝમાં ભાગ લો અને તમારી પરીક્ષાની તૈયારીને મજબૂત બનાવો.
              </p>
            </div>
          </div>
        </section>

        {/* Motivational Footer */}
        <div className="py-16 text-center">
          <Link href="/author" className="inline-block group">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-3 opacity-60">Crafted with ❤️ by</span>
              <span className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-all">
                Ajay Ambaliya
              </span>
              <div className="flex items-center gap-3 mt-6 opacity-10">
                <div className="w-8 h-px bg-slate-400" />
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="w-8 h-px bg-slate-400" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-5 pb-6 pt-2">
        <div className="bg-white/80 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-slate-200/50 flex justify-around items-center">
          <Link href="/" className="relative">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-3.5 rounded-2xl shadow-lg shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </Link>
          <Link href="/subjects" className="p-3.5 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50">
            <Book className="w-5 h-5" />
          </Link>
          <Link href="/categories" className="p-3.5 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50">
            <LayoutGrid className="w-5 h-5" />
          </Link>
          <Link href="/leaderboard" className="p-3.5 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50">
            <Trophy className="w-5 h-5" />
          </Link>
          <Link href="/profile" className="p-3.5 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50">
            <User className="w-5 h-5" />
          </Link>
        </div>
      </nav>
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
