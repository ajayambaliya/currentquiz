'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, ChevronRight, Trophy, Search, User, LogOut, Loader2, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
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

      // Apply Search Filter with Advanced Date Parsing
      // Apply Search Filter with Advanced Date Parsing
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

        // Check if we reached the end
        if (count !== null) {
          setHasMore(from + data.length < count);
        } else {
          setHasMore(data.length === ITEMS_PER_PAGE);
        }
      }
    } catch (err) {
      // Error fetching quizzes - silent fail for production
    } finally {
      setLoading(false);
      setInitialLoading(false);
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

  return (
    <main className="min-h-screen pb-32 overflow-x-hidden bg-[#fdfdfd]">
      {/* Premium Navigation Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/newlogo.png"
                alt="Logo"
                fill
                sizes="40px"
                className="object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">
                CurrentAdda
              </h1>
              <span className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1 ml-0.5 opacity-70">Vishwa Smart Study</span>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/author" title="Author Profile" className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                <User className="w-5 h-5" />
              </Link>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100/50">
              Join App
            </Link>
          )}
        </div>
      </header>

      {/* Atmospheric Compact Hero Section */}
      <section className="relative bg-white px-6 pt-10 pb-16 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-60" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-[60px] -ml-24 -mb-24 opacity-40" />

        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-xl mx-auto text-center space-y-4 relative z-10"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-50/50 border border-indigo-100/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 live-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Daily Updates Active</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight text-slate-900">
            Gujarati Exam Special <br />
            <span className="gradient-text">Current Affairs</span>
          </h2>
          <p className="text-slate-500 font-medium text-sm gujarati-text max-w-sm mx-auto leading-relaxed">
            GPSC, GSSSB, તલાટી અને અન્ય તમામ સ્પર્ધાત્મક પરીક્ષાઓ માટે ઉપયોગી.
          </p>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-6 -mt-8 relative z-20">
        {/* Compact Search Bar */}
        {initialLoading ? (
          <SearchBarSkeleton />
        ) : (
          <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-slate-200/40 mb-10 border border-slate-100">
            <div className="relative group">
              <input
                type="text"
                placeholder="શોધો (તારીખ અથવા નામ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50/80 border-2 border-transparent rounded-[1.25rem] focus:border-indigo-100 focus:bg-white transition-all text-slate-700 gujarati-text text-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            </div>

            <div className="mt-5">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                    ${selectedMonth === null
                      ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                      : 'bg-white border-slate-100 text-slate-400 hover:text-indigo-600'}`}
                >
                  Recent
                </button>
                {recentMonths.map((date) => {
                  const isActive = selectedMonth && format(selectedMonth, 'MMM yy') === format(date, 'MMM yy');
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedMonth(isActive ? null : date)}
                      className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                        ${isActive
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'}`}
                    >
                      {format(date, 'MMM yy')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quiz List */}
        <div className="space-y-4 min-h-[40vh]">
          {initialLoading ? (
            <QuizListSkeleton count={8} />
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 mb-4 opacity-40">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Available Quizzes</h4>
              </div>

              {quizzes.length === 0 && !loading && (
                <div className="bg-white py-16 rounded-[2.5rem] border border-slate-50 text-center space-y-4 shadow-sm">
                  <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold gujarati-text text-sm">કોઈ ડેટા મળ્યો નથી.</p>
                </div>
              )}

              {quizzes.map((quiz) => (
                <motion.div layout key={quiz.id}>
                  <Link
                    href={`/quiz/${quiz.slug}`}
                    className="block bg-white p-5 rounded-[1.75rem] border border-slate-100 premium-card group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{quiz.date_str || 'Static Quiz'}</span>
                        </div>
                        <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug pr-4">
                          {quiz.title}
                        </h3>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {loading && !initialLoading && (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-600" />
                  <span className="text-[9px] font-black tracking-widest uppercase text-slate-400">Loading Content</span>
                </div>
              )}

              {!loading && hasMore && quizzes.length > 0 && (
                <button
                  onClick={loadMore}
                  className="w-full py-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  Load More <ArrowDown className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Branding Footer */}
        <div className="py-20 text-center">
          <Link href="/author" className="inline-block group">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] mb-3 leading-none opacity-60">System Crafted by</span>
              <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-all border-b-2 border-transparent group-hover:border-indigo-100">
                Ajay Ambaliya
              </span>
              <div className="flex items-center gap-3 mt-8 opacity-10">
                <div className="w-10 h-px bg-slate-400" />
                <div className="w-1 h-1 rounded-full bg-slate-400" />
                <div className="w-10 h-px bg-slate-400" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Docked Modern Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
        <div className="glass p-2 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl">
          <Link href="/" className="flex flex-col items-center gap-1 text-indigo-600">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><BookOpen className="w-5 h-5" /></div>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
            <div className="p-3"><Trophy className="w-6 h-6" /></div>
          </Link>
          <Link href="/author" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
            <div className="p-3"><User className="w-6 h-6" /></div>
          </Link>
        </div>
      </nav>
    </main>
  );
}
