import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ChevronRight, Clock, ArrowLeft, PlayCircle, BookOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const metadata: Metadata = {
  title: "Daily Current Affairs in Gujarati 2026 (દૈનિક કરંટ અફેર્સ) | Today's GK Notes & Quiz",
  description: "દરરોજ અપડેટ થતા Daily Current Affairs in Gujarati (આજના વર્તમાન પ્રવાહ) — GPSC, GSSSB CCE, PSI, Talati માટે દૈનિક GK નોટ્સ, MCQs અને ફ્રી ક્વિઝ.",
  keywords: [
    'daily current affairs in gujarati',
    'daily current affairs gujarati 2026',
    'today current affairs in gujarati',
    'current affairs today gujarati',
    'આજના કરંટ અફેર્સ',
    'દૈનિક વર્તમાન પ્રવાહ',
    'daily current affairs for gpsc in gujarati',
    'daily quiz current affairs gujarati'
  ].join(', '),
  alternates: {
    canonical: 'https://currentadda.vercel.app/daily-current-affairs-in-gujarati',
  },
  openGraph: {
    title: "Daily Current Affairs in Gujarati 2026 (દૈનિક કરંટ અફેર્સ) | Today's GK Notes & Quiz",
    description: "દરરોજ અપડેટ થતા Daily Current Affairs in Gujarati — GPSC, GSSSB CCE, PSI, Talati માટે દૈનિક GK નોટ્સ, MCQs અને ફ્રી ક્વિઝ.",
    url: 'https://currentadda.vercel.app/daily-current-affairs-in-gujarati',
    type: 'website',
    siteName: 'CurrentAdda',
    locale: 'gu_IN',
  },
};

export const revalidate = 86400; // Revalidate daily list once per day

export default async function DailyCurrentAffairsGujaratiPage() {
  // Fetch latest 30 daily quizzes
  const { data: latestQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str, question_count')
    .order('quiz_date', { ascending: false })
    .limit(30);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Daily Current Affairs in Gujarati", "item": "https://currentadda.vercel.app/daily-current-affairs-in-gujarati" }
    ]
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/current-affairs-in-gujarati" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
              Daily Current Affairs
            </span>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              રોજિંદા કરંટ અફેર્સ 2026
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-5 pt-10 pb-14 overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4">
            Daily <span className="text-indigo-600">Current Affairs in Gujarati</span> 2026
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed gujarati-text">
            દરરોજ અપડેટ થતા કરંટ અફેર્સ પ્રશ્નો અને જવાબો. GPSC, GSSSB CCE, PSI, Talati પરીક્ષાઓ માટે ઉપયોગી દૈનિક પ્રેક્ટિસ.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Last 30 Days Current Affairs</h2>
          </div>
          <div className="grid gap-3">
            {(latestQuizzes || []).map((quiz: any) => {
              const date = quiz.quiz_date;
              return (
                <div key={quiz.id} className="bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        {quiz.date_str || date}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug line-clamp-2">
                      {quiz.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/daily/${date}`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">
                      <BookOpen className="w-3.5 h-3.5" />
                      Read Notes
                    </Link>
                    <Link href={`/quiz/${quiz.slug}`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-100 hover:shadow-md hover:shadow-indigo-100 transition-all">
                      <PlayCircle className="w-3.5 h-3.5" />
                      Play Quiz
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SEO Content block */}
        <section className="mb-12">
          <div className="bg-white/50 rounded-[2.5rem] p-8 border border-slate-100">
             <h2 className="text-xl font-black text-slate-900 mb-6">Daily Current Affairs Gujarati 2026 Importance</h2>
             <div className="space-y-4 text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
                <p>
                  <strong>Daily Current Affairs in Gujarati</strong> ની તૈયારી કરવી એ સફળતા માટે ચાવીરૂપ છે. જો તમે દરરોજ માત્ર 15-20 મિનિટ 
                  અમારી ડેઇલી ક્વિઝ રમો છો, તો તમારે મહિનાના અંતે કરંટ અફેર્સ માટે કોઈ મોટી પીડીએફ ગોખવાની જરૂર પડશે નહીં.
                </p>
                <p>
                  CurrentAdda દરરોજ સવારે નવા <strong>Current Affairs MCQ in Gujarati</strong> અપડેટ કરે છે. જેમાં National, International, Sports, Defence, 
                  અને Gujarat specific ન્યૂઝ નો સમાવેશ થાય છે.
                </p>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}
