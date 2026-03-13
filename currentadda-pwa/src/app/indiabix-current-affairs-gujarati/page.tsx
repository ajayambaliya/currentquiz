import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { BookOpen, ChevronRight, Calendar, Sparkles, Trophy, Target, Clock, ArrowLeft, PlayCircle, FileText, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'IndiaBIX Current Affairs in Gujarati 2026 - Daily MCQ Quiz | કરંટ અફેર્સ ગુજરાતી',
  description: 'Practice IndiaBIX Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી) for GPSC, GSSSB CCE, PSI and Constable exams. National and International MCQ quizzes simplified in Gujarati. Updated daily for 2026.',
  keywords: [
    'IndiaBIX current affairs in gujarati',
    'indiabix gujarati current affairs',
    'IndiaBIX MCQ gujarati translation',
    'GPSC current affairs in gujarati',
    'GSSSB CCE current affairs',
    'daily current affairs gujarati 2026',
    'national current affairs in gujarati',
    'international news in gujarati for exams'
  ].join(', '),
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
  let totalQuizzesCount = 0;
  let totalQuestionsCount = 0;

  try {
    // 1. Fetch IndiaBix specific quizzes
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .ilike('title', '%indiabix%')
      .order('quiz_date', { ascending: false })
      .range(0, 5);

    if (data) initialQuizzes = data;

    // 2. Fetch global stats for trust signals
    const { count: qCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true });
    const { count: quesCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    
    totalQuizzesCount = qCount || 500;
    totalQuestionsCount = quesCount || 10000;

  } catch (error) {
    console.error('Error fetching data for IndiaBix page:', error);
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "IndiaBIX Current Affairs Gujarati", "item": "https://currentadda.vercel.app/indiabix-current-affairs-gujarati" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I get IndiaBIX questions in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CurrentAdda provides simplified and accurate Gujarati translations for popular IndiaBIX current affairs, helping students prepare for national level topics in their native language."
        }
      },
      {
        "@type": "Question",
        "name": "Is IndiaBIX relevant for GPSC and GSSSB exams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. IndiaBIX covers major national and international events which are frequently asked in GPSC Class 1-2 and GSSSB CCE exams as part of the General Awareness section."
        }
      },
      {
        "@type": "Question",
        "name": "How to practice IndiaBIX MCQ in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can visit CurrentAdda daily to practice IndiaBIX-style MCQs in Gujarati. We provide interactive quizzes with instant scores and detailed explanations."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              IndiaBIX Gujarati
            </h1>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              નેશનલ કરંટ અફેર્સ 2026
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-5 pt-12 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />
        
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">IndiaBIX Translation • Expert Curated</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent italic">IndiaBIX</span> Current Affairs <br /> in Gujarati
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-lg max-w-2xl mx-auto leading-relaxed gujarati-text">
                IndiaBIX એ નેશનલ અને ઈન્ટરનેશનલ કરંટ અફેર્સ માટે જાણીતું પોર્ટલ છે. CurrentAdda પર અમે તેના પ્રશ્નોનું 
                <strong> ગુજરાતી ભાષામાં શ્રેષ્ઠ સંકલન </strong> અને વિગતવાર સમજૂતી પ્રદાન કરીએ છીએ, જે GPSC અને CCE જેવી 
                પરીક્ષાઓમાં ખૂબ જ ઉપયોગી સાબિત થાય છે.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-2xl bg-indigo-500 text-white mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">Daily</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Updates</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-2xl bg-rose-500 text-white mb-3">
                <Target className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">MCQs</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Practice</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2.5 rounded-2xl bg-emerald-500 text-white mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">Leader</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Board</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        
        {/* Quiz List Section */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Latest IndiaBIX Gujarati Quizzes</h3>
          </div>
          <div className="grid gap-4">
            {initialQuizzes.length > 0 ? initialQuizzes.map((quiz: any) => (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.slug}`}
                className="block bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-wider">IndiaBIX Series</span>
                      <span className="text-[10px] font-bold text-slate-300">• {quiz.date_str}</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug pr-6">
                      {quiz.title}
                    </h4>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            )) : (
              <div className="p-12 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                 <p className="text-slate-400 font-bold">Refreshing latest IndiaBIX content...</p>
              </div>
            )}
          </div>
          <div className="mt-6">
             <Link href="/" className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all">
                View All Quizzes on Homepage <ChevronRight className="w-4 h-4" />
             </Link>
          </div>
        </section>

        {/* Detailed Content Pillar */}
        <section className="mb-16">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-white">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 leading-tight">
                IndiaBIX કરંટ અફેર્સ ગુજરાતીમાં શા માટે જરૂરી છે?
            </h2>
            
            <div className="space-y-8 text-slate-600 text-sm md:text-base leading-relaxed gujarati-text font-medium">
              <p>
                સ્પર્ધાત્મક પરીક્ષાઓની દુનિયામાં <strong>IndiaBIX</strong> એક મોટું નામ છે. ખાસ કરીને જ્યારે નેશનલ લેવલના 
                Awards, Sports, Science અને International Relation ના પ્રશ્નોની વાત આવે ત્યારે IndiaBIX નું Content 
                સૌથી વધુ સચોટ માનવામાં આવે છે.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h3 className="font-black text-indigo-600 mb-3 uppercase tracking-wide text-xs">GPSC Preparation</h3>
                    <p className="text-xs">GPSC Class 1-2 ની પ્રિલિમ પરીક્ષામાં ઈન્ટરનેશનલ કરંટ અફેર્સ માટે IndiaBIX નો ડેટા ખૂબ જ મહત્વનો છે.</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h3 className="font-black text-rose-600 mb-3 uppercase tracking-wide text-xs">CCE 2026 Strategy</h3>
                    <p className="text-xs">GSSSB CCE માં 30 marks ના કરંટ અફેર્સમાં નેશનલ ઇવેન્ટ્સ કવર કરવા માટે આ બેસ્ટ સોર્સ છે.</p>
                 </div>
              </div>

              <h3 className="text-xl font-black text-slate-900 pt-6">CurrentAdda - IndiaBIX Gujarati ના મુખ્ય ફીચર્સ:</h3>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-black text-[10px]">01</span>
                  </div>
                  <span><strong>સરળ ગુજરાતી અનુવાદ:</strong> ઇંગ્લિશ પ્રશ્નોને સરળ ગુજરાતીમાં ટ્રાન્સલેટ કરવામાં આવ્યા છે જેથી સમજવામાં સરળતા રહે.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-black text-[10px]">02</span>
                  </div>
                  <span><strong>Daily Mock Test:</strong> દરરોજ નવા 10-15 પ્રશ્નોની ક્વિઝ રમી શકાય છે.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 font-black text-[10px]">03</span>
                  </div>
                  <span><strong>વિગતવાર સમજૂતી:</strong> માત્ર જવાબ નહીં, પણ તે પ્રશ્ન પાછળનું ફેક્ટ પણ ગુજરાતીમાં સમજાવવામાં આવ્યું છે.</span>
                </li>
              </ul>

              <div className="mt-10 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] text-white">
                 <h4 className="text-xl font-black mb-4 italic">Own the Competition!</h4>
                 <p className="text-sm opacity-90 leading-relaxed mb-6">
                    સ્પર્ધાત્મક પરીક્ષામાં સફળ થવા માટે માત્ર વાંચવું પૂરતું નથી, પ્રેક્ટિસ કરવી જરૂરી છે. 
                    અમારા રીઅલ-ટાઇમ લીડરબોર્ડ પર અન્ય વિદ્યાર્થીઓ સાથે કોમ્પિટિશન કરો અને તમારો રેન્ક સુધારો.
                 </p>
                 <Link href="/leaderboard" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide">
                    Go to Leaderboard <ChevronRight className="w-4 h-4" />
                 </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
              IndiaBIX Gujarati FAQ
            </h2>
            
            <div className="space-y-8">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-base font-black text-indigo-300 mb-3">શું IndiaBIX ગુજરાતીમાં ઉપલબ્ધ છે?</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed gujarati-text">
                  ઓફિશિયલ IndiaBIX સાઇટ પર માત્ર ઇંગ્લિશમાં જ પ્રશ્નો હોય છે, પરંતુ CurrentAdda પર અમે એ જ લેવલના પ્રશ્નોને ગુજરાતીમાં ટ્રાન્સલેટ કરીને ક્વિઝ ફોર્મેટમાં આપીએ છીએ.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-base font-black text-indigo-300 mb-3">GPSC માટે IndiaBIX કેટલું ઉપયોગી છે?</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed gujarati-text">
                  GPSC Class 1-2 ની પરીક્ષામાં નેશનલ લેવલના કરંટ અફેર્સ પૂછાય ત્યારે IndiaBIX ના સોર્સમાંથી ઘણા પ્રશ્નો હોય છે. તેથી ગુજરાતીમાં તેની પ્રેક્ટિસ તમને બહુ મોટી લીડ અપાવી શકે છે.
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-base font-black text-indigo-300 mb-3">શું આ સર્વિસ ફ્રી છે?</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed gujarati-text">
                  હા, CurrentAdda ના તમામ ફીચર્સ - ડેઈલી ક્વિઝ, ઈન્ડિયાબિક્સ સિરીઝ અને લીડરબોર્ડ - બિલકુલ ફ્રી છે.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Internal Links Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <Link href="/current-affairs-in-gujarati" className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-200 shadow-sm transition-all group">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
               <FileText className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            </div>
            <h3 className="font-black text-slate-900 mb-1">Full Guide</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Current Affairs 2026</p>
          </Link>
          <Link href="/categories" className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-purple-200 shadow-sm transition-all group">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
               <BookOpen className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="font-black text-slate-900 mb-1">Categories</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Subject-wise Practice</p>
          </Link>
        </section>

        <footer className="text-center py-12 opacity-40">
           <Link href="/author" className="inline-flex flex-col items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-[0.4em]">Crafted by Ajay Ambaliya</span>
              <div className="w-12 h-px bg-slate-300" />
           </Link>
        </footer>
      </div>
    </main>
  );
}
