'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sprout, Palette, Trophy, Landmark, FileText, Briefcase,
    Shield, TrendingUp, GraduationCap, TreePine, PartyPopper,
    Banknote, Calendar, Globe2, Flag, Cross, Users, MapPin,
    Vote, FlaskConical, Map, Film, Cpu, LayoutGrid, ChevronRight,
    ArrowLeft, Home, User, Search, Zap, Clock, Book
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const categories = [
    { name: 'Agriculture', icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Art and Culture', icon: Palette, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Awards and Honours', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Banking', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50' },
    { name: 'Bills and Acts', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
    { name: 'Business', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Defence', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Economy', icon: TrendingUp, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { name: 'Education', icon: GraduationCap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Environment', icon: TreePine, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Festivity', icon: PartyPopper, color: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
    { name: 'Finance', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Important Days', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'International', icon: Globe2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'National', icon: Flag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Obituary', icon: Cross, color: 'text-slate-400', bg: 'bg-slate-50' },
    { name: 'Persons', icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
    { name: 'Places', icon: MapPin, color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Politics', icon: Vote, color: 'text-blue-700', bg: 'bg-blue-50' },
    { name: 'Science', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50' },
    { name: 'Sports', icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'State', icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Talkies', icon: Film, color: 'text-pink-500', bg: 'bg-pink-50' },
    { name: 'Technology', icon: Cpu, color: 'text-slate-700', bg: 'bg-slate-50' },
    { name: 'Miscellaneous', icon: LayoutGrid, color: 'text-slate-500', bg: 'bg-slate-50' },
];

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loadingCounts, setLoadingCounts] = useState(true);

    useEffect(() => {
        fetchCategoryDistribution();
    }, []);

    async function fetchCategoryDistribution() {
        try {
            setLoadingCounts(true);

            // Perform parallel HEAD queries for each category to get exact counts
            // This bypasses the 1000-row limit of .select() and is very accurate
            const countPromises = categories.map(async (cat) => {
                const { count, error } = await supabase
                    .from('questions')
                    .select('*', { count: 'exact', head: true })
                    .eq('category', cat.name);

                if (error) {
                    console.error(`Error counting ${cat.name}:`, error);
                    return { name: cat.name, count: 0 };
                }
                return { name: cat.name, count: count || 0 };
            });

            const results = await Promise.all(countPromises);
            const distribution = results.reduce((acc: any, curr: any) => {
                acc[curr.name] = curr.count;
                return acc;
            }, {});

            setCounts(distribution);
        } catch (err) {
            console.error('Error fetching categories distribution:', err);
        } finally {
            setLoadingCounts(false);
        }
    }

    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const activeCategories = useMemo(() => {
        return categories
            .filter(cat => counts[cat.name] > 0)
            .sort((a, b) => counts[b.name] - counts[a.name])
            .slice(0, 4);
    }, [counts]);

    return (
        <main className="min-h-screen pb-32 overflow-x-hidden bg-[#fdfdfd]">
            {/* Premium Navigation Header */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 transition-colors hover:bg-slate-50 rounded-xl">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black text-slate-900 leading-none">
                                Categories
                            </h1>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Smart Learning</span>
                        </div>
                    </div>
                </div>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ItemList",
                            "itemListElement": categories.map((cat, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": cat.name,
                                "url": `https://currentadda.vercel.app/categories/${encodeURIComponent(cat.name)}`
                            }))
                        })
                    }}
                />
            </header>

            <div className="max-w-xl mx-auto px-6 pt-8 space-y-8">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-[1.25rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        placeholder="શોધો (દા.ત. Sports, Science)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.25rem] focus:border-indigo-200 focus:shadow-xl focus:shadow-indigo-50/20 transition-all text-slate-700 font-bold placeholder:text-slate-300 relative z-10"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 z-10" />
                </div>

                {/* Trending / Active Categories */}
                {!searchQuery && activeCategories.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                                Trending Topics
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {activeCategories.map((cat) => (
                                <Link
                                    key={`trending-${cat.name}`}
                                    href={`/categories/${encodeURIComponent(cat.name)}`}
                                    className="p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-100 transition-all shadow-sm hover:shadow-lg group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                        <cat.icon className={`w-5 h-5 ${cat.color}`} />
                                    </div>
                                    <h3 className="font-black text-slate-800 text-xs truncate">{cat.name}</h3>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase">{counts[cat.name]} Questions</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Category List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <LayoutGrid className="w-3 h-3" />
                            All Subjects
                        </h2>
                        {!loadingCounts && (
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                                {Object.values(counts).reduce((a, b) => a + b, 0)} Total
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filteredCategories.map((cat, idx) => (
                                <motion.div
                                    key={cat.name}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.01 }}
                                >
                                    <Link
                                        href={`/categories/${encodeURIComponent(cat.name)}`}
                                        className="flex items-center justify-between p-4 bg-white rounded-[1.75rem] border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/10 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center transition-all group-hover:rotate-12`}>
                                                <cat.icon className={`w-7 h-7 ${cat.color}`} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="font-black text-slate-800 tracking-tight">{cat.name}</span>
                                                <div className="flex items-center gap-2">
                                                    {loadingCounts ? (
                                                        <div className="w-12 h-2 bg-slate-50 rounded-full animate-pulse" />
                                                    ) : (
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${counts[cat.name] > 0 ? 'text-indigo-400' : 'text-slate-200'}`}>
                                                            {counts[cat.name] || 0} Questions
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Attribution */}
            <footer className="py-20 text-center space-y-6 opacity-30 group hover:opacity-100 transition-all">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-[1px] bg-slate-200" />
                    <Link href="/author" className="text-[10px] font-black uppercase tracking-[0.5em] hover:text-indigo-600 transition-colors">
                        Crafted by Ajay Ambaliya
                    </Link>
                    <div className="w-12 h-[1px] bg-slate-200" />
                </div>
            </footer>

            {/* Docked Modern Tab Bar */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass p-2 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl bg-white/80 backdrop-blur-xl">
                    <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><HomeIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/subjects" className="p-3.5 text-slate-400 hover:text-indigo-600 transition-all rounded-2xl hover:bg-slate-50">
                        <Book className="w-6 h-6" />
                    </Link>
                    <Link href="/categories" className="flex flex-col items-center gap-1 text-indigo-600">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><LayoutGrid className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><TrophyIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><UserIcon className="w-6 h-6" /></div>
                    </Link>
                </div>
            </nav>
        </main>
    );
}

function HomeIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
}

function TrophyIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 21h8m-4-4v4M7 4h10M4 7h3m13 0h-3m-1 0v4a5 5 0 01-10 0V7" /></svg>;
}

function UserIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
