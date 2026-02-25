'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import {
    ChevronRight, Search, Loader2, Sparkles,
    ArrowLeft, ListTodo
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectSubTopicsPage({ params }: { params: Promise<{ subjectSlug: string, mainTopicSlug: string }> }) {
    const { subjectSlug, mainTopicSlug } = use(params);
    const [topic, setTopic] = useState<any>(null);
    const [subTopics, setSubTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        fetchData(isMounted);
        return () => {
            isMounted = false;
        };
    }, [mainTopicSlug]);

    const fetchData = async (isMounted: boolean) => {
        try {
            if (isMounted) {
                setLoading(true);
                setErrorMsg(null);
            }
            const { data: topicData } = await supabase
                .from('main_topics')
                .select('*')
                .eq('slug', mainTopicSlug)
                .single();

            if (topicData && isMounted) {
                setTopic(topicData);
                const { data: subData, error: subError } = await supabase
                    .from('sub_topics')
                    .select('*')
                    .eq('main_topic_id', topicData.id)
                    .order('name');
                if (subError) throw subError;
                if (subData && isMounted) setSubTopics(subData);
            }
        } catch (error: any) {
            console.error('Error fetching sub topics:', error);
            if (isMounted) setErrorMsg(error.message || 'Failed to load sub topics.');
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    const filteredSubTopics = subTopics.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Sub Topics...</p>
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
                <button onClick={() => fetchData(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition">
                    Retry
                </button>
                <Link href={`/subjects/${subjectSlug}`} className="text-slate-500 font-bold text-sm hover:text-indigo-600 transition">
                    Go Back
                </Link>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-4">
                    <Link href={`/subjects/${subjectSlug}`} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 gujarati-text">{topic?.name || 'Sub Topics'}</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Select Sub Topic</p>
                    </div>
                </div>
                {/* JSON-LD for Breadcrumbs */}
                {topic && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": "Home",
                                        "item": "https://currentadda.vercel.app"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": "Subjects",
                                        "item": "https://currentadda.vercel.app/subjects"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 3,
                                        "name": topic.name,
                                        "item": `https://currentadda.vercel.app/subjects/${subjectSlug}/${mainTopicSlug}`
                                    }
                                ]
                            })
                        }}
                    />
                )}
            </header>

            <div className="max-w-xl mx-auto px-5 pt-8">
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search sub topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm text-slate-700 text-sm font-bold placeholder:text-slate-400 focus:shadow-md transition-all outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                <div className="grid gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredSubTopics.map((sub, index) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/subjects/${subjectSlug}/${mainTopicSlug}/${sub.slug}`}
                                    className="group block bg-white p-5 rounded-2xl shadow-sm hover:border-indigo-100 border border-transparent transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                                <ListTodo className="w-4 h-4 text-indigo-600 group-hover:text-white" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text">
                                                {sub.name}
                                            </h3>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
