'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronLeft, Github, Mail, MapPin,
    Code, Cpu, LayoutGrid, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

export default function AuthorProfile() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        offset: ["start start", "end end"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    return (
        <main ref={containerRef} className="min-h-screen bg-[#05070a] text-white overflow-x-hidden selection:bg-indigo-500/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-purple-600/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-600/5 rounded-full blur-[80px]" />
            </div>

            {/* Header / Navigation */}
            <header className="p-6 fixed top-0 left-0 w-full z-[100]">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                        <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold text-slate-300 text-sm">Home</span>
                    </Link>
                    <div className="flex gap-3">
                        <SocialIconButton href="https://github.com/ajayambaliya" icon={<Github className="w-5 h-5" />} />
                        <SocialIconButton href="mailto:ajay.ambaliya007@gmail.com" icon={<Mail className="w-5 h-5" />} />
                    </div>
                </div>
            </header>

            {/* Author Hero Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: backgroundY, opacity: opacityHero }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-transparent to-[#05070a]" />
                </motion.div>

                <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative inline-block"
                    >
                        <div className="absolute inset-0 bg-indigo-600 rounded-[3.5rem] blur-3xl opacity-30 animate-pulse" />
                        <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-[3.5rem] border-2 border-white/20 p-2 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl overflow-hidden">
                            <div className="relative w-full h-full rounded-[2.8rem] overflow-hidden bg-[#10141d]">
                                <Image
                                    src="/author_placeholder_1768048016185.png"
                                    alt="Ajay Ambaliya"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
                            Ajay Ambaliya
                        </h1>
                        <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-sm">Visionary Developer & Strategist</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3">
                        <Badge icon={<Cpu className="w-3.5 h-3.5" />} text="Govt Service (Health)" color="bg-white/5 border-white/10" />
                        <Badge icon={<Code className="w-3.5 h-3.5" />} text="Full Stack Architect" color="bg-white/5 border-white/10" />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="container max-w-5xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    <div className="md:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3.5rem] space-y-8">
                        <h2 className="text-3xl font-black flex items-center gap-4">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                            The Developer
                        </h2>
                        <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
                            <p>I am a dedicated Government professional serving in the Health Department, Gujarat.</p>
                            <p>My mission with CurrentAdda is to provide the best Gujarati current affairs resources to all aspirants of GPSC, GSSSB, and other competitive exams.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Navigation Dock */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] px-6 pb-8 pt-2">
                <div className="bg-[#10141d]/80 backdrop-blur-2xl p-2.5 rounded-[2.5rem] border border-white/10 flex justify-around items-center shadow-2xl">
                    <Link href="/" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><HomeIcon className="w-6 h-6" /></Link>
                    <Link href="/categories" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><LayoutGrid className="w-6 h-6" /></Link>
                    <Link href="/leaderboard" className="p-4 text-slate-500 hover:text-indigo-400 transition-all rounded-2xl"><TrophyIcon className="w-6 h-6" /></Link>
                    <Link href="/author" className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30"><UserIcon className="w-6 h-6" /></Link>
                </div>
            </nav>
        </main>
    );
}

function SocialIconButton({ href, icon }: { href: string, icon: any }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white">
            {icon}
        </a>
    );
}

function Badge({ icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border ${color}`}>
            {icon}
            {text}
        </span>
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
