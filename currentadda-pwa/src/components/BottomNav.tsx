'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Book, LayoutGrid, Trophy, User, FileDown } from 'lucide-react';

interface BottomNavProps {
    theme?: 'light' | 'dark';
}

export default function BottomNav({ theme = 'light' }: BottomNavProps) {
    const pathname = usePathname() || '';

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    const containerStyle = theme === 'light'
        ? 'bg-white/80 border-slate-200/50 shadow-slate-900/10'
        : 'bg-[#0a0d14]/90 border-white/10 shadow-black/50';

    const defaultIconStyle = theme === 'light'
        ? 'text-slate-400 hover:bg-slate-50'
        : 'text-slate-500 hover:bg-white/5';

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-5 pb-6 pt-2 pointer-events-none">
            <div className={`${containerStyle} backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl border flex justify-around items-center pointer-events-auto`}>
                <Link href="/" className="relative" aria-label="Home">
                    <div className={`${isActive('/') ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' : `${defaultIconStyle} hover:text-indigo-600`} p-3.5 rounded-2xl transition-all`}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                </Link>
                
                <Link href="/pdf" className="relative group" aria-label="PDFs">
                    <div className={`${isActive('/pdf') ? 'bg-rose-50 border border-rose-200 text-rose-600 shadow-sm' : `${defaultIconStyle} hover:text-rose-600`} p-3.5 rounded-2xl transition-all flex items-center justify-center`}>
                        <FileDown className="w-5 h-5" />
                    </div>
                    {/* Tiny "PDF" Label indicator */}
                    <div className="absolute -top-2 -right-1 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm">
                        PDF
                    </div>
                </Link>

                <Link href="/categories" className="relative" aria-label="Categories">
                    <div className={`${isActive('/categories') ? 'bg-indigo-50 text-indigo-600' : `${defaultIconStyle} hover:text-indigo-600`} p-3.5 rounded-2xl transition-all`}>
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                </Link>

                <Link href="/leaderboard" className="relative" aria-label="Leaderboard">
                    <div className={`${isActive('/leaderboard') ? 'bg-orange-50 text-orange-600' : `${defaultIconStyle} hover:text-indigo-600`} p-3.5 rounded-2xl transition-all`}>
                        <Trophy className="w-5 h-5" />
                    </div>
                </Link>

                <Link href="/profile" className="relative" aria-label="Profile">
                    <div className={`${isActive('/profile') ? 'bg-indigo-50 text-indigo-600' : `${defaultIconStyle} hover:text-indigo-600`} p-3.5 rounded-2xl transition-all`}>
                        <User className="w-5 h-5" />
                    </div>
                </Link>
            </div>
        </nav>
    );
}
