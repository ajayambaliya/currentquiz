'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Book, ChevronRight, Search, Loader2, Sparkles,
    LayoutGrid, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .order('name');

        if (data) setSubjects(data);
        setLoading(false);
    };

    const filteredSubjects = subjects.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Subject Quiz</h1>
                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Master every topic</p>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-5 pt-8">
                {/* Search */}
                <div className="relative mb-8">
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm text-slate-700 text-sm font-bold placeholder:text-slate-400 focus:shadow-md transition-all outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Subjects...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredSubjects.map((subject, index) => (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={`/subjects/${subject.slug}`}
                                        className="group block bg-white p-5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all border border-transparent hover:border-indigo-100"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
                                                    <Book className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text">
                                                        {subject.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Topics</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSubjects.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold gujarati-text">કોઈ વિષય મળ્યો નથી</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Nav Placeholder (linked in layout or separate) */}
        </main>
    );
}
