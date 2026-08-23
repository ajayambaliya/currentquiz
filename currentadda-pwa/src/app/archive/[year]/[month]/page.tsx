import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Clock, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';

export const revalidate = 604800; // Revalidate monthly archive once per 7 days

export async function generateMetadata({ params }: { params: Promise<{ year: string; month: string }> }): Promise<Metadata> {
    const { year, month } = await params;
    const dateStr = `${year}-${month}-01`;
    const selectedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    const monthName = format(selectedDate, 'MMMM').toLowerCase();

    return {
        title: `${format(selectedDate, 'MMMM yyyy')} Current Affairs Archive | CurrentAdda`,
        description: `Archive of all daily quizzes and current affairs MCQs for ${format(selectedDate, 'MMMM yyyy')} in Gujarati.`,
        alternates: {
            canonical: `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthName}-${year}`,
        }
    };
}

export default async function MonthlyArchivePage({ params }: { params: Promise<{ year: string; month: string }> }) {
    const { year, month } = await params;
    const dateStr = `${year}-${month}-01`;
    const selectedDate = parse(dateStr, 'yyyy-MM-dd', new Date());

    const start = startOfMonth(selectedDate).toISOString();
    const end = endOfMonth(selectedDate).toISOString();

    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*')
        .gte('quiz_date', start)
        .lte('quiz_date', end)
        .order('quiz_date', { ascending: false });

    return (
        <main className="min-h-screen pb-32 bg-[#fdfdfd]">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href="/archive" className="p-2 transition-colors hover:bg-slate-50 rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-900 leading-none gujarati-text">
                            {format(selectedDate, 'MMMM yyyy')}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                            {quizzes?.length || 0} Quizzes Found
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-6 pt-8 space-y-3">
                {quizzes?.map((quiz) => (
                    <Link
                        key={quiz.id}
                        href={`/quiz/${quiz.slug}`}
                        className="block bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        {quiz.date_str}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug line-clamp-2">
                                    {quiz.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{format(new Date(quiz.quiz_date), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
