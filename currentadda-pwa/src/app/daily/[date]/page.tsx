import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, BookOpen, CheckCircle2, XCircle, HelpCircle, PlayCircle, Sparkles } from 'lucide-react';
import { notFound } from 'next/navigation';
import SoftAuthWall from '@/components/SoftAuthWall';

export const revalidate = 604800; // Revalidate every 7 days (historical daily notes are permanent)



const GUJARATI_MONTHS: Record<string, string> = {
  '01': 'જાન્યુઆરી', '02': 'ફેબ્રુઆરી', '03': 'માર્ચ', '04': 'એપ્રિલ',
  '05': 'મે', '06': 'જૂન', '07': 'જુલાઈ', '08': 'ઓગસ્ટ',
  '09': 'સપ્ટેમ્બર', '10': 'ઓક્ટોબર', '11': 'નવેમ્બર', '12': 'ડિસેમ્બર',
};

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const parts = date.split('-');
  if (parts.length !== 3) return { title: 'Not Found' };

  const [year, month, day] = parts;
  const guMonth = GUJARATI_MONTHS[month] || month;
  const displayDate = `${day} ${guMonth} ${year}`;

  return {
    title: `Current Affairs ${displayDate} in Gujarati - Daily GK Notes & MCQs | CCE, GPSC`,
    description: `Free Current Affairs ${day}/${month}/${year} in Gujarati with answers & explanations. Daily GK notes for GSSSB CCE 2026, GPSC, PSI, Constable & Talati exam preparation. કરંટ અફેર્સ ${displayDate}`,
    keywords: `Current Affairs ${date} Gujarati, કરંટ અફેર્સ ${displayDate}, Daily GK ${date}, CCE Current Affairs ${date}, GPSC Current Affairs ${date}`,
    alternates: {
      canonical: `https://currentadda.vercel.app/daily/${date}`,
    },
    openGraph: {
      title: `Current Affairs ${displayDate} in Gujarati | Daily GK Notes`,
      description: `Daily current affairs ${displayDate} with MCQs and detailed explanations in Gujarati for GSSSB CCE, GPSC & all Gujarat govt exams.`,
      url: `https://currentadda.vercel.app/daily/${date}`,
      type: 'article',
      siteName: 'CurrentAdda',
      locale: 'gu_IN',
    },
  };
}

export default async function DailyNotesPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) notFound();

  const parts = date.split('-');
  const [year, month, day] = parts;
  const guMonth = GUJARATI_MONTHS[month] || month;
  const displayDate = `${day} ${guMonth} ${year}`;

  // Fetch quizzes for this date
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str')
    .eq('quiz_date', date)
    .order('created_at', { ascending: true });

  if (!quizzes || quizzes.length === 0) notFound();

  // Fetch all questions for these quizzes
  const quizIds = quizzes.map(q => q.id);
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .in('quiz_id', quizIds)
    .order('q_index', { ascending: true });

  // Fetch adjacent dates for navigation
  const { data: prevQuiz } = await supabase
    .from('quizzes')
    .select('quiz_date')
    .lt('quiz_date', date)
    .order('quiz_date', { ascending: false })
    .limit(1);

  const { data: nextQuiz } = await supabase
    .from('quizzes')
    .select('quiz_date')
    .gt('quiz_date', date)
    .order('quiz_date', { ascending: true })
    .limit(1);

  const totalQuestions = questions?.length || 0;

  // Schema.org
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `Current Affairs ${displayDate} in Gujarati - Daily GK Notes`,
    "datePublished": `${date}T00:00:00+05:30`,
    "dateModified": `${date}T23:59:59+05:30`,
    "author": {
      "@type": "Person",
      "name": "Ajay Ambaliya",
      "url": "https://currentadda.vercel.app/author"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CurrentAdda",
      "url": "https://currentadda.vercel.app"
    },
    "description": `Daily current affairs ${displayDate} in Gujarati with ${totalQuestions} MCQs and detailed explanations for GSSSB CCE, GPSC and all Gujarat competitive exams.`,
    "mainEntityOfPage": `https://currentadda.vercel.app/daily/${date}`,
    "inLanguage": "gu"
  };

  // Learning Resource Schema (Crucial for AI Education Search)
  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": `Current Affairs ${displayDate} Notes in Gujarati`,
    "description": `Comprehensive study notes and MCQs for current affairs dated ${displayDate} specifically for Gujarat Govt Exams.`,
    "learningResourceType": "Study Guide",
    "educationalLevel": ["GSSSB CCE", "GPSC", "Gujarat Govt Exams"],
    "author": {
      "@type": "Person",
      "name": "Ajay Ambaliya",
      "url": "https://currentadda.vercel.app/author"
    },
    "datePublished": `${date}T00:00:00+05:30`,
    "inLanguage": "gu-IN",
    "about": {
      "@type": "Thing",
      "name": "Current Affairs"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Current Affairs in Gujarati", "item": "https://currentadda.vercel.app/current-affairs-in-gujarati" },
      { "@type": "ListItem", "position": 3, "name": `Daily CA - ${displayDate}`, "item": `https://currentadda.vercel.app/daily/${date}` }
    ]
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema) }} />

      {/* Bot-friendly Direct Answer Block (Targeting ChatGPT Search) */}
      <div className="sr-only" aria-hidden="true" id="ai-search-summary">
          <h2>Summary: {displayDate} Current Affairs in Gujarati</h2>
          <p>This page contains comprehensive daily current affairs for {displayDate} specifically for Gujarat Govt Exams.</p>
          <ul>
              {questions?.slice(0, 15).map((q: any, i: number) => (
                  <li key={i}>
                      <strong>Q:</strong> {q.text} 
                      <strong>A:</strong> {q.explanation || `Correct: ${q.answer}`}
                  </li>
              ))}
          </ul>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/current-affairs-in-gujarati" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col flex-1">
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              Daily Current Affairs Notes
            </h1>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              {displayDate} • {totalQuestions} Questions
            </span>
          </div>
          <Link href={`/quiz/${quizzes[0].slug}`} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide hover:bg-indigo-700 transition-all">
            <PlayCircle className="w-3.5 h-3.5" />
            Play Quiz
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 pt-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <Link href="/current-affairs-in-gujarati" className="hover:text-indigo-600 transition-colors">Current Affairs</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-indigo-600">{displayDate}</span>
        </nav>

        {/* Title Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
            <Calendar className="w-3 h-3 text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">{date}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
            Current Affairs <span className="text-indigo-600">{displayDate}</span> in Gujarati
          </h2>
          <p className="text-slate-500 text-sm font-medium gujarati-text leading-relaxed">
            {displayDate} ની Current Affairs MCQs ગુજરાતી ભાષામાં, વિગતવાર સમજૂતી સાથે.
            GSSSB CCE 2026, GPSC, PSI, Constable અને તમામ Gujarat Govt Exams ની તૈયારી માટે ઉપયોગી.
          </p>
        </div>

        {/* CCE Relevance Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">🔥</div>
          <p className="text-xs text-amber-700 font-bold">
            <strong>CCE 2026 Relevant:</strong> આ Current Affairs questions GSSSB CCE Prelims (30 Marks) અને Group B Mains (30 Marks) માટે ખૂબ ઉપયોગી છે.
          </p>
        </div>

        {/* Questions & Answers (Text Format) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">All Questions & Answers</h3>
          </div>

          {/* First 3 Questions (Preview) */}
          {(questions || []).slice(0, 3).map((q: any, index: number) => (
            <QuestionCard key={q.id} q={q} index={index} />
          ))}

          {/* Remaining Questions (Behind SoftAuthWall) */}
          {(questions?.length || 0) > 3 && (
            <SoftAuthWall>
              <div className="space-y-6 mt-6">
                {(questions || []).slice(3).map((q: any, index: number) => (
                  <QuestionCard key={q.id} q={q} index={index + 3} />
                ))}
              </div>
            </SoftAuthWall>
          )}
        </section>

        {/* Quiz CTA */}
        <section className="mt-10 mb-10">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] p-8 text-center text-white">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-white/80" />
            <h3 className="text-lg font-black mb-2">Interactive Quiz Mode Available! 🎮</h3>
            <p className="text-white/80 text-xs font-medium mb-4 gujarati-text max-w-md mx-auto">
              આ જ પ્રશ્નો interactive quiz format માં રમો — score તપાસો, leaderboard પર rank મેળવો, અને streak maintain કરો!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {quizzes.map((quiz: any) => (
                <Link
                  key={quiz.id}
                  href={`/quiz/${quiz.slug}`}
                  className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Play Quiz
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation to Previous/Next Day */}
        <nav className="flex justify-between items-center mb-10">
          {prevQuiz && prevQuiz.length > 0 ? (
            <Link href={`/daily/${prevQuiz[0].quiz_date}`} className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Previous Day
            </Link>
          ) : <div />}
          {nextQuiz && nextQuiz.length > 0 ? (
            <Link href={`/daily/${nextQuiz[0].quiz_date}`} className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">
              Next Day
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </nav>

        {/* SEO Bottom Content */}
        <section className="mb-8">
          <div className="bg-white/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 mb-3">Current Affairs {displayDate} - Key Points for GSSSB CCE & GPSC</h3>
            <p className="text-xs text-slate-500 font-medium gujarati-text leading-relaxed">
              {displayDate} ના Current Affairs notes GSSSB CCE 2026 (Advt. No. 378/202526, 7338 જગ્યા) Prelims (30 Marks) અને Group B Mains (30 Marks),
              GPSC Class 1-2, Police Constable, PSI, Talati, Bin Sachivalay Clerk, અને તમામ Gujarat Government Exams ની તૈયારી માટે ઉપયોગી છે.
              CurrentAdda પર દરરોજ updated Current Affairs in Gujarati મળે છે — <Link href="/current-affairs-in-gujarati" className="text-indigo-600 hover:underline">View Complete Guide</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function QuestionCard({ q, index }: { q: any; index: number }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Question */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-black text-indigo-600">Q{index + 1}</span>
        </div>
        <h4 className="text-sm font-black text-slate-900 gujarati-text leading-relaxed flex-1">
          {q.text}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-2 ml-11 mb-4">
        {q.options && (() => {
          try {
            const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
            return opts.map((opt: string, optIndex: number) => {
              const isCorrect = opt === q.answer;
              return (
                <div
                  key={optIndex}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium gujarati-text ${
                    isCorrect
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border border-slate-100 text-slate-600'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                  )}
                  <span>{opt}</span>
                  {isCorrect && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest ml-auto">✓ Correct</span>}
                </div>
              );
            });
          } catch { return null; }
        })()}
      </div>

      {/* Explanation */}
      {q.explanation && (
        <div className="ml-11 bg-blue-50/50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Explanation</span>
          </div>
          <p className="text-xs text-slate-600 font-medium gujarati-text leading-relaxed">
            {q.explanation}
          </p>
        </div>
      )}
    </article>
  );
}
