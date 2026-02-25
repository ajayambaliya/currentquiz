'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import {
    ChevronRight, Search, Loader2, Sparkles,
    ArrowLeft, Layers
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectMainTopicsPage({ params }: { params: Promise<{ subjectSlug: string }> }) {
    const { subjectSlug } = use(params);
    const [subject, setSubject] = useState<any>(null);
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetchSubjectAndTopics(isMounted);
        return () => {
            isMounted = false;
        };
    }, [subjectSlug]);

    const fetchSubjectAndTopics = async (isMounted: boolean) => {
        try {
            if (isMounted) {
                setLoading(true);
                setErrorMsg(null);
            }
            const { data: subjectData } = await supabase
                .from('subjects')
                .select('*')
                .eq('slug', subjectSlug)
                .single();

            if (subjectData && isMounted) {
                setSubject(subjectData);
                const { data: topicsData, error: topicsError } = await supabase
                    .from('main_topics')
                    .select('*')
                    .eq('subject_id', subjectData.id)
                    .order('name');
                if (topicsError) throw topicsError;
                if (topicsData && isMounted) setTopics(topicsData);
            }
        } catch (error: any) {
            console.error('Error fetching subject details:', error);
            if (isMounted) setErrorMsg(error.message || 'Failed to load subject topics.');
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    const filteredTopics = topics.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Topics...</p>
        </div>
    );

    if (errorMsg) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 mb-2">Connection Error</h1>
            <p className="text-slate-500 font-bold text-sm mb-6 max-w-sm">
                નેટવર્ક સમસ્યાના કારણે ડેટા લોડ થઈ શક્યો નથી.
            </p>
            <div className="flex items-center gap-4">
                <button onClick={() => fetchSubjectAndTopics(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition">
                    Retry
                </button>
                <Link href="/subjects" className="text-slate-500 font-bold text-sm hover:text-indigo-600 transition">
                    Back Home
                </Link>
            </div>
        </div>
    );

    if (!subject) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Subject Not Found</h1>
            <Link href="/subjects" className="text-indigo-600 font-bold">Back to Subjects</Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-4">
                    <Link href="/subjects" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 gujarati-text">{subject.name}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Select Main Topic</p>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-5 pt-8">
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm text-slate-700 text-sm font-bold placeholder:text-slate-400 focus:shadow-md transition-all outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTopics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/subjects/${subjectSlug}/${topic.slug}`}
                                    className="group block bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-transparent hover:border-indigo-100"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                                                <Layers className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text">
                                                {topic.name}
                                            </h3>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredTopics.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                            <p className="text-slate-500 font-bold gujarati-text">કોઈ ટોપિક મળ્યો નથી</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
