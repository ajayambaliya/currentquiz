'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Github, Instagram, MessageCircle, Mail, MapPin, Briefcase, Award, Code, ExternalLink, Cpu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthorProfile() {
    return (
        <main className="min-h-screen bg-white">
            {/* Header / Navigation */}
            <header className="p-6 fixed top-0 left-0 w-full z-50">
                <Link href="/" className="inline-flex items-center gap-2 px-5 py-3 glass rounded-2xl modern-shadow transition-all hover:pr-7 group">
                    <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-slate-600 text-sm">Back to Home</span>
                </Link>
            </header>

            {/* Hero Section */}
            <div className="relative h-[45vh] w-full overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900 z-10" />
                <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Profile Content */}
            <div className="max-w-2xl mx-auto px-6 -mt-32 relative z-20 pb-24">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-10"
                >
                    {/* Avatar & Title */}
                    <div className="text-center space-y-6">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                            <div className="relative w-40 h-40 rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100">
                                <Image
                                    src="/author_placeholder_1768048016185.png"
                                    alt="Ajay Ambaliya"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ajay Ambaliya</h1>
                            <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs">
                                <Briefcase className="w-4 h-4" />
                                <span>Senior Clerk, Health Department</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats / Badges */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <Badge icon={<Cpu className="w-3.5 h-3.5" />} text="IT Specialist" color="bg-indigo-50 text-indigo-600" />
                        <Badge icon={<Code className="w-3.5 h-3.5" />} text="Full Stack Dev" color="bg-emerald-50 text-emerald-600" />
                        <Badge icon={<Award className="w-3.5 h-3.5" />} text="Govt Service" color="bg-amber-50 text-amber-600" />
                    </div>

                    {/* About Section */}
                    <section className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border border-slate-100">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                            Professional Bio
                        </h2>
                        <p className="text-slate-600 leading-relaxed font-medium">
                            Dedicated Government employee with a passion for streamlining public services through digital innovation.
                            Beyond my role in the Health Department, I am a seasoned technologist specializing in web automation,
                            data scraping, and PWA development.
                        </p>
                        <p className="text-slate-600 leading-relaxed font-medium pt-2">
                            I build tools that make government operations more efficient, transforming complex manual tasks
                            into seamless automated workflows. CurrentAdda is part of my mission to provide high-quality educational
                            resources to every student in Gujarat.
                        </p>
                    </section>

                    {/* Grid Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard icon={<MapPin className="w-5 h-5" />} label="Location" value="Vadodara, Gujarat, India" />
                        <InfoCard icon={<Award className="w-5 h-5" />} label="Experience" value="Senior Clerk Service" />
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-4">
                        <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] text-center">Tech Arsenal</h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Next.js', 'TypeScript', 'Supabase', 'Python', 'Playwright', 'Automation'].map(tech => (
                                <span key={tech} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Social Connects */}
                    <div className="space-y-6 pt-4">
                        <h3 className="text-center font-black text-slate-400 uppercase tracking-widest text-xs">Let's Connect</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <SocialLink
                                icon={<MessageCircle className="w-5 h-5" />}
                                label="WhatsApp"
                                color="bg-[#25D366] text-white"
                                href="https://wa.me/918000212153"
                            />
                            <SocialLink
                                icon={<Instagram className="w-5 h-5" />}
                                label="Instagram"
                                color="bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white"
                                href="https://instagram.com/ajayambaliyaa"
                            />
                            <SocialLink
                                icon={<Github className="w-5 h-5" />}
                                label="GitHub"
                                color="bg-[#24292e] text-white"
                                href="https://github.com/ajayambaliya"
                            />
                            <SocialLink
                                icon={<Mail className="w-5 h-5" />}
                                label="Email"
                                color="bg-slate-100 text-slate-700"
                                href="mailto:ajay.ambaliya007@gmail.com"
                            />
                        </div>
                    </div>

                    {/* Footer attribution */}
                    <div className="pt-12 text-center text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em] space-y-4">
                        <p>Bridging Governance & Technology</p>
                        <div className="flex items-center justify-center gap-4 opacity-50">
                            <div className="w-12 h-px bg-slate-300" />
                            <div className="w-2 h-2 rounded-full border border-slate-300" />
                            <div className="w-12 h-px bg-slate-300" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Footer */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-6 pb-8 pt-2">
                <div className="glass p-2.5 rounded-[2rem] modern-shadow border border-white/40 flex justify-around items-center shadow-2xl">
                    <Link href="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><HomeIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-500 transition-all">
                        <div className="p-3"><TrophyIcon className="w-6 h-6" /></div>
                    </Link>
                    <Link href="/author" className="flex flex-col items-center gap-1 text-indigo-600">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100"><UserIcon className="w-6 h-6" /></div>
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

function Badge({ icon, text, color }: { icon: any, text: string, color: string }) {
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${color}`}>
            {icon}
            {text}
        </span>
    );
}

function InfoCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-700">{value}</p>
            </div>
        </div>
    );
}

function SocialLink({ icon, label, color, href }: { icon: any, label: string, color: string, href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-100/50 ${color}`}
        >
            {icon}
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </a>
    );
}
