import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Calendar, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

export const revalidate = 86400; // 24 hours

export default async function ArchivePage() {
    // Generate months from current back to a year ago for the list
    const end = new Date();
    const start = subMonths(end, 24); // Last 2 years
    const months = eachMonthOfInterval({ start, end }).reverse();

    return (
        <main className="min-h-screen pb-32 bg-[#fdfdfd]">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 transition-colors hover:bg-slate-50 rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-black text-slate-900 leading-none">Quiz Archive</h1>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Full Database Access</span>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-6 pt-8">
                <div className="grid grid-cols-1 gap-4">
                    {months.map((month) => (
                        <Link
                            key={month.toISOString()}
                            href={`/archive/${format(month, 'yyyy')}/${format(month, 'MM')}`}
                            className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-indigo-400 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                                    <Calendar className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg uppercase">
                                        {format(month, 'MMMM yyyy')}
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        Browse all quizzes
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-all">
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-white" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
