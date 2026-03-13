import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'IndiaBIX Current Affairs in Gujarati 2026 - Daily MCQ Quiz | CurrentAdda',
  description: 'Practice IndiaBIX Current Affairs in Gujarati translation. National and International MCQ quizzes simplified for GPSC and GSSSB exam preparation. Updated daily for 2026.',
  keywords: 'IndiaBIX current affairs in gujarati, IndiaBIX MCQ gujarati, gpsc current affairs, daily quiz 2026',
  alternates: {
    canonical: 'https://currentadda.vercel.app/indiabix-current-affairs-gujarati',
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600;

export default async function IndiaBixPage() {
  let initialQuizzes: any[] = [];

  try {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .ilike('title', '%indiabix%')
      .order('quiz_date', { ascending: false })
      .range(0, 9);

    if (data) {
      initialQuizzes = data;
    }
  } catch (error) {
    console.error('Error fetching IndiaBix quizzes:', error);
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I get IndiaBIX questions in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CurrentAdda provide simplified Gujarati translations for popular IndiaBIX current affairs questions, helping students prepare for national level exams in their mother tongue."
        }
      },
      {
        "@type": "Question",
        "name": "Are IndiaBIX Gujarati quizzes updated daily?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we monitor and translate national and international news daily to provide the latest IndiaBIX style MCQ quizzes in Gujarati."
        }
      }
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Informational SEO Header Section */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-12 px-5">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Special Topic
          </div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            IndiaBIX Current Affairs in Gujarati <span className="text-indigo-600">2026</span>
          </h1>
          <p className="text-sm text-slate-600 gujarati-text leading-relaxed font-medium">
            IndiaBIX એક ખૂબ જ લોકપ્રિય પ્લેટફોર્મ છે જે નેશનલ લેવલના કરંટ અફેર્સ માટે જાણીતું છે. 
            ઘણા વિદ્યાર્થીઓને ગુજરાતી ભાષામાં આ પ્રશ્નો જોઈતા હોય છે, તેથી CurrentAdda પર અમે IndiaBIX સ્ટાઈલના 
            મહત્વના કરંટ અફેર્સનું ગુજરાતી ભાષામાં શ્રેષ્ઠ સંકલન પ્રદાન કરીએ છીએ.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <BookOpen className="w-5 h-5 text-indigo-500 mb-2" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Daily Quiz</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Updated Daily for 2026</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <HelpCircle className="w-5 h-5 text-emerald-500 mb-2" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">Explanations</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Detailed Gujarati Notes</p>
            </div>
          </div>
        </div>
      </section>

      <HomeClient initialQuizzes={initialQuizzes} />
    </div>
  );
}
