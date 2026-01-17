'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import {
    ChevronRight, Search, Loader2, Sparkles,
    ArrowLeft, PlayCircle, Clock, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectQuizzesPage({ params }: { params: Promise<{ subjectSlug: string, mainTopicSlug: string, subTopicSlug: string }> }) {
    const { subjectSlug, mainTopicSlug, subTopicSlug } = use(params);
    const [subTopic, setSubTopic] = useState<any>(null);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [subTopicSlug]);

    const fetchData = async () => {
        setLoading(true);
        const { data: subData } = await supabase
            .from('sub_topics')
            .select('*')
            .eq('slug', subTopicSlug)
            .single();

        if (subData) {
            setSubTopic(subData);
            const { data: quizData } = await supabase
                .from('subject_quizzes')
                .select('*')
                .eq('sub_topic_id', subData.id)
                .order('created_at', { ascending: false });
            if (quizData) setQuizzes(quizData);
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Sets...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-4">
                    <Link href={`/subjects/${subjectSlug}/${mainTopicSlug}`} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 gujarati-text">{subTopic?.name || 'Practise Sets'}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Select Set to Start</p>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-5 pt-8">
                {quizzes.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold gujarati-text">આ સબ-ટોપિકમાં હાલ કોઈ ક્વિઝ નથી</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {quizzes.map((quiz, index) => (
                                <motion.div
                                    key={quiz.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/quiz/${quiz.slug}`}
                                        className="group block relative bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all border border-slate-50 hover:border-indigo-100 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-600 transition-colors duration-500 opacity-20 group-hover:opacity-10" />

                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded-md">Set {quizzes.length - index}</span>
                                                    {index === 0 && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-[0.2em] bg-amber-50 px-2 py-0.5 rounded-md">
                                                            <Sparkles size={8} /> New
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-black text-slate-900 gujarati-text leading-snug group-hover:text-indigo-600 transition-colors">
                                                    {quiz.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all shadow-lg shadow-slate-200">
                                                <PlayCircle className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}
