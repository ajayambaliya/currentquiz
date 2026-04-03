import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileDown,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Zap,
  Book
} from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'All PDF Downloads | CurrentAdda',
  description: 'Download highly optimized, free Current Affairs and IndiaBix PDFs in Gujarati.',
  alternates: {
    canonical: 'https://currentadda.vercel.app/pdf',
  }
};

export default function PdfHubPage() {
  return (
    <main lang="gu" className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-32">
      {/* Header Sticky */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-indigo-700" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              PDF Downloads
            </h1>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
              Available Resources
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-5 pt-12 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-50 -mr-48 -mt-48 pointer-events-none" />
        
        <div className="max-w-xl mx-auto relative z-10 text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <FileDown className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">PDF Collection Center</h2>
            <p className="text-slate-600 font-medium text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                Here you can find all our professionally compiled free PDFs for GPSC, CCE, PSI, and more. Select a category below!
            </p>

            <div className="grid gap-5 text-left">
                {/* Gujarati Current Affairs Main PDF */}
                <Link href="/current-affairs-pdf-gujarati" className="group bg-white p-6 rounded-[2rem] border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BookOpen className="w-24 h-24" />
                   </div>
                   <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">VisionIAS Quality</span>
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-2 gujarati-text leading-tight group-hover:text-indigo-600 transition-colors">
                      Gujarati Current Affairs
                   </h3>
                   <p className="text-slate-500 text-xs font-medium mb-6 relative z-10">
                      Standard monthly compiled PDFs matching high-level competitive requirements with 14 categories.
                   </p>
                   <div className="mt-auto flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest">
                      Enter Directory <ChevronRight className="w-4 h-4" />
                   </div>
                </Link>

                {/* IndiaBix PDFs */}
                <Link href="/indiabix-current-affairs-gujarati-pdf" className="group bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-6 rounded-[2rem] border border-indigo-900 hover:shadow-2xl hover:shadow-indigo-900/40 transition-all flex flex-col relative overflow-hidden text-white">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-24 h-24 text-rose-500" />
                   </div>
                   <div className="flex items-center gap-2 mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">Most Demanded</span>
                   </div>
                   <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-rose-400 transition-colors">
                      IndiaBix In Gujarati
                   </h3>
                   <p className="text-indigo-200 text-xs font-medium mb-6 relative z-10">
                      Direct translations of the best National questions in beautifully formatted monthly PDFs.
                   </p>
                   <div className="mt-auto flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-widest">
                      Enter Directory <ChevronRight className="w-4 h-4" />
                   </div>
                </Link>
            </div>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
