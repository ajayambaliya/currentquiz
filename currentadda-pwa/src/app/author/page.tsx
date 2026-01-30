'use client';

import { User, Youtube, Twitter, Award, BookOpen, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AuthorPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-xl mx-auto space-y-8">
                {/* Profile Card */}
                <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10" />

                    <div className="relative pt-4">
                        <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            <User className="w-16 h-16 text-indigo-400" />
                        </div>

                        <div className="mt-6 space-y-2">
                            <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                                Ajay Ambaliya
                                <CheckCircle className="w-5 h-5 text-indigo-500 fill-indigo-50" />
                            </h1>
                            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">
                                Educational Content Expert
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-50 pt-8">
                        <div>
                            <div className="text-lg font-black text-slate-900">10k+</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Users</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900">500+</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quizzes</div>
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900">4.9/5</div>
                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</div>
                        </div>
                    </div>
                </div>

                {/* About Content */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">About the Expert</h2>
                    </div>

                    <div className="text-sm text-slate-600 leading-relaxed space-y-4 gujarati-text">
                        <p>
                            અજય અંબાલિયા ગુજરાતની સ્પર્ધાત્મક પરીક્ષાઓ (GPSC, GSSSB, Police Bharti) ના તૈયારી ક્ષેત્રે ૨૦૧૯ થી કાર્યરત છે.
                            તેઓનું મુખ્ય લક્ષ્ય વિદ્યાર્થીઓને સરળ ભાષામાં અને પરીક્ષાલક્ષી કરંટ અફેર્સ અને મટીરિયલ પૂરું પાડવાનું છે.
                        </p>
                        <p>
                            CurrentAdda પ્લેટફોર્મના માધ્યમથી તેઓ દરરોજ સેંકડો વિદ્યાર્થીઓને તેમની કારકિર્દીના લક્ષ્યો પ્રાપ્ત કરવામાં મદદરૂપ થાય છે.
                            અહીં મૂકેલા તમામ પ્રશ્નો અને તેની સમજૂતી તેઓ દ્વારા જાતે ચકાસવામાં આવે છે.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <a href="https://youtube.com/@ajayambaliya" target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
                            <Youtube className="w-4 h-4" /> YouTube
                        </a>
                        <a href="https://twitter.com/ajayambaliya" target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-sky-50 text-sky-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all">
                            <Twitter className="w-4 h-4" /> Twitter
                        </a>
                    </div>
                </div>

                <Link href="/" className="block text-center text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-all">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
