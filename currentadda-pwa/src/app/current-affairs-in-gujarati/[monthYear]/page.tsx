import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, BookOpen, PlayCircle, Target, Sparkles, FileText, Trophy } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 86400; // Revalidate once per day

// ── Static params: pre-render last 24 months at build time ─────────────────
export async function generateStaticParams() {
  const params: { monthYear: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const year = d.getFullYear();
    params.push({ monthYear: `${monthName}-${year}` });
  }
  return params;
}

export const dynamicParams = true;

// ── Data tables ─────────────────────────────────────────────────────────────
const MONTH_NAMES: Record<string, string> = {
  '01': 'January', '02': 'February', '03': 'March', '04': 'April',
  '05': 'May', '06': 'June', '07': 'July', '08': 'August',
  '09': 'September', '10': 'October', '11': 'November', '12': 'December',
};

const GUJARATI_MONTHS: Record<string, string> = {
  '01': 'જાન્યુઆરી', '02': 'ફેબ્રુઆરી', '03': 'માર્ચ', '04': 'એપ્રિલ',
  '05': 'મે', '06': 'જૂન', '07': 'જુલાઈ', '08': 'ઓગસ્ટ',
  '09': 'સપ્ટેમ્બર', '10': 'ઓક્ટોબર', '11': 'નવેમ્બર', '12': 'ડિસેમ્બર',
};

const GUJARATI_YEARS: Record<string, string> = {
  '2025': '૨૦૨૫', '2026': '૨૦૨૬', '2027': '૨૦૨૭',
};

function parseMonthYear(slug: string): { month: string; year: string } | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;
  let month = parts[0];
  const year = parts[1];
  const monthMap: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
  };
  if (monthMap[month]) month = monthMap[month];
  if (!/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  return { month, year };
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ monthYear: string }> }): Promise<Metadata> {
  const { monthYear } = await params;
  const parsed = parseMonthYear(monthYear);
  if (!parsed) return { title: 'Not Found' };

  const { month, year } = parsed;
  const monthName = MONTH_NAMES[month] || month;
  const guMonth = GUJARATI_MONTHS[month] || month;
  const guYear = GUJARATI_YEARS[year] || year;

  // Title exactly matches the search query format Googlebot sees
  const title = `Current Affairs ${monthName} ${year} in Gujarati - ${guMonth} ${year} MCQs & Questions | GPSC, CCE | CurrentAdda`;
  const description = `Best Current Affairs ${monthName} ${year} in Gujarati (${guMonth} ${guYear} કરંટ અફેર્સ) — Complete daily quiz compilation, questions & answers with Gujarati explanations for GSSSB CCE 2026, GPSC Class 1-2, PSI, Constable & Talati. 100% Free.`;

  return {
    title,
    description,
    keywords: [
      `current affairs ${monthName.toLowerCase()} ${year} in gujarati`,
      `${monthName.toLowerCase()} ${year} current affairs in gujarati`,
      `current affairs ${monthName.toLowerCase()} ${year} gujarati`,
      `${guMonth} ${year} કરંટ અફેર્સ`,
      `${guMonth} ${guYear} કરંટ અફેર ગુજરાતી`,
      `${monthName} ${year} current affairs questions and answers in gujarati`,
      `monthly current affairs ${monthName} ${year} gujarati`,
      `current affairs ${monthName} ${year} mcq`,
      `cce ${monthName.toLowerCase()} ${year} current affairs gujarati`,
      `gpsc current affairs ${monthName.toLowerCase()} ${year}`,
      `daily current affairs gujarati ${monthName.toLowerCase()} ${year}`,
      `${monthName.toLowerCase()} ${year} current affairs for gsssb`,
    ].join(', '),
    alternates: {
      canonical: `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}`,
    },
    openGraph: {
      title,
      description,
      url: `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}`,
      type: 'article',
      siteName: 'CurrentAdda',
      locale: 'gu_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function MonthlyCurrentAffairsPage({ params }: { params: Promise<{ monthYear: string }> }) {
  const { monthYear } = await params;
  const parsed = parseMonthYear(monthYear);
  if (!parsed) notFound();

  const { month, year } = parsed;
  const monthName = MONTH_NAMES[month] || month;
  const guMonth = GUJARATI_MONTHS[month] || month;
  const guYear = GUJARATI_YEARS[year] || year;
  const monthNameLower = monthName.toLowerCase();

  // Date range
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

  const { data: quizzes, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str')
    .gte('quiz_date', startDate)
    .lte('quiz_date', endDate)
    .order('quiz_date', { ascending: false });

  if (quizError) console.error('Monthly page error:', quizError);
  if (!quizzes || quizzes.length === 0) notFound();

  const totalQuestions = quizzes.length * 10; // ~10 questions per daily quiz

  // Adjacent months
  const prevMonthNum = parseInt(month) - 1;
  const nextMonthNum = parseInt(month) + 1;
  const prevMonth = prevMonthNum < 1
    ? { month: '12', year: String(parseInt(year) - 1) }
    : { month: String(prevMonthNum).padStart(2, '0'), year };
  const nextMonth = nextMonthNum > 12
    ? { month: '01', year: String(parseInt(year) + 1) }
    : { month: String(nextMonthNum).padStart(2, '0'), year };

  const prevMonthSlug = `${MONTH_NAMES[prevMonth.month]?.toLowerCase()}-${prevMonth.year}`;
  const nextMonthSlug = `${MONTH_NAMES[nextMonth.month]?.toLowerCase()}-${nextMonth.year}`;

  const BASE = 'https://currentadda.vercel.app';

  // ── JSON-LD schemas ──────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE },
      { "@type": "ListItem", "position": 2, "name": "Current Affairs in Gujarati", "item": `${BASE}/current-affairs-in-gujarati` },
      { "@type": "ListItem", "position": 3, "name": `${monthName} ${year} Current Affairs Gujarati`, "item": `${BASE}/current-affairs-in-gujarati/${monthYear}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Current affairs ${monthName} ${year} in Gujarati — ક્યાં practice કરવું?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `CurrentAdda પર ${monthName} ${year} current affairs in Gujarati completely free practice available. ${quizzes.length} daily quizzes, ${totalQuestions}+ MCQs with Gujarati explanations. GSSSB CCE, GPSC, PSI, Talati — all covered.`,
        },
      },
      {
        "@type": "Question",
        "name": `${monthName} ${year} current affairs questions and answers in Gujarati?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${monthName} ${year} current affairs questions and answers in Gujarati are available on CurrentAdda. ${totalQuestions}+ MCQs with detailed Gujarati explanations covering National, International, Sports, Economy, Science, Defence categories.`,
        },
      },
      {
        "@type": "Question",
        "name": `GSSSB CCE 2026 માટે ${guMonth} ${year} current affairs?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `GSSSB CCE 2026 ની Prelims (30 marks) અને Group B Mains (30 marks) ની current affairs preparation માટે ${guMonth} ${year} ના MCQs CurrentAdda પર practice કરો. 0.25 negative marking ધ્યાનમાં રાખો.`,
        },
      },
      {
        "@type": "Question",
        "name": `GPSC current affairs ${monthName} ${year} in Gujarati — how to prepare?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `For GPSC ${monthName} ${year} current affairs in Gujarati: Practice all ${quizzes.length} daily quizzes on CurrentAdda, read Gujarati explanations, and also practice category-wise MCQs for Economy, Politics, International, and Science topics.`,
        },
      },
      {
        "@type": "Question",
        "name": `${monthName} ${year} current affairs Gujarati PDF download?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${monthName} ${year} current affairs Gujarati PDF is available via CurrentAdda Telegram channel. Each daily quiz also has a Study Mode (Notes) where you can read all Q&As in text format — perfect for revision.`,
        },
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${monthName} ${year} Current Affairs in Gujarati — Daily Quiz List`,
    "description": `All ${quizzes.length} daily current affairs quizzes of ${monthName} ${year} in Gujarati with ${totalQuestions}+ MCQs`,
    "url": `${BASE}/current-affairs-in-gujarati/${monthYear}`,
    "numberOfItems": quizzes.length,
    "itemListElement": quizzes.map((q: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": q.title,
      "url": `${BASE}/quiz/${q.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      {/* Sticky header */}
      <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/current-affairs-in-gujarati" className="p-2 hover:bg-slate-50 rounded-xl transition-colors" aria-label="Back to Current Affairs">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col flex-1">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">
              {monthName} {year} Current Affairs
            </span>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              {guMonth} {year} • {totalQuestions}+ MCQs • {quizzes.length} Quizzes
            </span>
          </div>
          <Link
            href={`/quiz/${quizzes[0]?.slug}`}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex-shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Play
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 pt-6">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <Link href="/current-affairs-in-gujarati" className="hover:text-indigo-600 transition-colors">Current Affairs</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-indigo-600">{monthName} {year}</span>
        </nav>

        {/* ── TRUE H1 (visible, keyword-exact) ───────────────────────────────── */}
        <section className="relative mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-36 -mt-36" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Monthly Compilation • Free</span>
            </div>

            {/* Primary H1 — exactly matches search query */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">
              Current Affairs{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {monthName} {year}
              </span>{' '}
              in Gujarati
            </h1>
            {/* Gujarati subtitle — targets Gujarati search queries */}
            <p className="text-base font-black text-indigo-500 gujarati-text mb-4">
              {guMonth} {guYear} કરંટ અફેર્સ — MCQs, Questions &amp; Answers
            </p>
            <p className="text-slate-500 text-sm font-medium gujarati-text leading-relaxed max-w-2xl">
              {guMonth} {guYear} ના સંપૂર્ણ <strong>Current Affairs in Gujarati</strong> — <strong>{totalQuestions}+ MCQs</strong> ગુજરાતી explanations સાથે, {quizzes.length} daily quizzes.
              GSSSB CCE 2026, GPSC, PSI, Constable, Talati — બધા Gujarat Government Exams ની તૈયારી.
            </p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-indigo-600">{totalQuestions}+</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MCQs</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-purple-600">{quizzes.length}</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Daily Quizzes</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-emerald-600">Free</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">All Content</div>
          </div>
        </div>

        {/* CCE Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">🔥</div>
          <p className="text-xs text-amber-700 font-bold gujarati-text leading-relaxed">
            <strong>GSSSB CCE 2026:</strong> {guMonth} {year} ના Current Affairs Prelims (30 Marks) + Group B Mains (30 Marks) — dono stages mates essential. Practice all {quizzes.length} quizzes below.
          </p>
        </div>

        {/* ── Daily Quiz List ───────────────────────────────────────────────── */}
        <section className="mb-12" aria-label={`${monthName} ${year} Daily Current Affairs Quizzes`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                {monthName} {year} — Daily Current Affairs Quiz List
              </h2>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">
              {quizzes.length} Quizzes
            </span>
          </div>

          <div className="grid gap-3">
            {quizzes.map((quiz: any, index: number) => (
              <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[9px] font-black text-indigo-600">
                        {quizzes.length - index}
                      </div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {quiz.date_str || quiz.quiz_date}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 gujarati-text leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      ~10 Questions • Free Practice
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {quiz.quiz_date && (
                      <Link
                        href={`/daily/${quiz.quiz_date}`}
                        aria-label={`Study notes for ${quiz.title}`}
                        className="bg-slate-50 px-3 py-2 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Notes
                      </Link>
                    )}
                    <Link
                      href={`/quiz/${quiz.slug}`}
                      aria-label={`Play quiz: ${quiz.title}`}
                      className="bg-indigo-600 px-3 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm shadow-indigo-500/20"
                    >
                      <PlayCircle className="w-3 h-3" />
                      Quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Month Navigation */}
        <nav aria-label="Monthly navigation" className="flex justify-between items-center mb-10 bg-white rounded-2xl border border-slate-100 p-4">
          <Link
            href={`/current-affairs-in-gujarati/${prevMonthSlug}`}
            className="flex items-center gap-2 text-indigo-600 font-black text-xs hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <div className="text-left">
              <div className="text-[8px] text-slate-400 uppercase tracking-widest">Previous</div>
              <div>{MONTH_NAMES[prevMonth.month]} {prevMonth.year}</div>
            </div>
          </Link>
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{monthName} {year}</div>
          <Link
            href={`/current-affairs-in-gujarati/${nextMonthSlug}`}
            className="flex items-center gap-2 text-indigo-600 font-black text-xs hover:text-indigo-700 transition-colors text-right"
          >
            <div>
              <div className="text-[8px] text-slate-400 uppercase tracking-widest">Next</div>
              <div>{MONTH_NAMES[nextMonth.month]} {nextMonth.year}</div>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </nav>

        {/* ── SEO Rich Content ─────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="bg-white/60 rounded-3xl p-7 border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-4">
              {monthName} {year} Current Affairs in Gujarati — Complete Guide
            </h2>
            <div className="space-y-3 text-sm text-slate-600 font-medium gujarati-text leading-relaxed">
              <p>
                <strong>Current Affairs {monthName} {year} in Gujarati</strong> ({guMonth} {guYear} કરંટ અફેર્સ) ની complete compilation CurrentAdda પર ઉપલબ્ધ છે.
                {quizzes.length} daily quizzes, {totalQuestions}+ MCQs — National, International, Sports, Economy, Science, Defence, Politics, Awards — તમામ topics cover.
              </p>
              <p>
                <strong>GSSSB CCE 2026</strong> (7338 posts) ની Prelims + Mains mates <strong>{guMonth} {year} current affairs</strong> essential. CurrentAdda ની daily quiz practice
                accuracy improve કરવામાં help કરે — 0.25 negative marking ધ્યાનમાં રાખો.
              </p>
              <p>
                <strong>GPSC Class 1-2</strong>, PSI, Police Constable, Talati cum Mantri, Bin Sachivalay Clerk, TET/TAT/HTAT —
                {guMonth} {year} ના monthly current affairs MCQs revision revision.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {[
                  `${monthName} ${year} Current Affairs in Gujarati — ${totalQuestions}+ Free MCQs`,
                  `${guMonth} ${guYear} Current Affairs Questions & Answers`,
                  `GSSSB CCE ${year} — ${monthName} Current Affairs (30 Marks)`,
                  `GPSC ${monthName} ${year} Gujarati Current Affairs`,
                  `Daily Current Affairs ${monthName} ${year} Gujarati Quiz`,
                  `${monthName} ${year} Current Affairs PDF Gujarati`,
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-indigo-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ Section (visible) ─────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="text-lg">❓</span>
            FAQs — {monthName} {year} Current Affairs in Gujarati
          </h2>
          <div className="space-y-3">
            {[
              {
                q: `Current affairs ${monthName} ${year} in Gujarati ક્યાં practice કરવું?`,
                a: `CurrentAdda.vercel.app પર — ${quizzes.length} quizzes, ${totalQuestions}+ MCQs Gujarati explanations સાથે. Completely free!`,
              },
              {
                q: `${guMonth} ${year} current affairs questions and answers Gujarati?`,
                a: `CurrentAdda પર ${guMonth} ${year} ના ${totalQuestions}+ questions and answers Gujarati explanation સાથે available. Practice now!`,
              },
              {
                q: `GSSSB CCE 2026 mate ${guMonth} ${year} current affairs important che?`,
                a: `Yes! GSSSB CCE Prelims (30 marks) + Group B Mains (30 marks) mates ${guMonth} ${year} current affairs crucial. CurrentAdda par practice karo.`,
              },
              {
                q: `${monthName} ${year} current affairs PDF in Gujarati?`,
                a: `Telegram @currentadda par ${monthName} ${year} current affairs PDF free. Website par Study Mode (Notes) ma text format ma read kari shako.`,
              },
            ].map((faq, i) => (
              <details key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden group" open={i === 0}>
                <summary className="px-5 py-4 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-start justify-between gap-3 hover:text-indigo-600 transition-colors">
                  <span className="gujarati-text leading-snug">{faq.q}</span>
                  <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 font-medium leading-relaxed gujarati-text border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="mb-10 grid grid-cols-2 gap-3">
          <Link href="/current-affairs-in-gujarati" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <Calendar className="w-4 h-4 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-xs group-hover:text-indigo-600 transition-colors">All Months</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">Monthly Archive</div>
              </div>
            </div>
          </Link>
          <Link href="/categories" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-all">
                <Target className="w-4 h-4 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-xs group-hover:text-purple-600 transition-colors">Category MCQs</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">25 Categories</div>
              </div>
            </div>
          </Link>
          <Link href="/subjects" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                <BookOpen className="w-4 h-4 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-xs group-hover:text-emerald-600 transition-colors">Subject-wise</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">GK Practice</div>
              </div>
            </div>
          </Link>
          <Link href="/leaderboard" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-600 transition-all">
                <Trophy className="w-4 h-4 text-amber-600 group-hover:text-white" />
              </div>
              <div>
                <div className="font-black text-slate-800 text-xs group-hover:text-amber-600 transition-colors">Leaderboard</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-widest">Compete & Rank</div>
              </div>
            </div>
          </Link>
        </section>

        {/* sr-only keyword signals for Googlebot */}
        <div className="sr-only" aria-label="Additional SEO content">
          <h3>Current Affairs {monthName} {year} in Gujarati — All Topics</h3>
          <ul>
            <li>Current Affairs {monthName} {year} in Gujarati — National Events</li>
            <li>Current Affairs {monthName} {year} in Gujarati — International Events</li>
            <li>Current Affairs {monthName} {year} in Gujarati — Sports</li>
            <li>Current Affairs {monthName} {year} in Gujarati — Economy</li>
            <li>Current Affairs {monthName} {year} in Gujarati — Science & Technology</li>
            <li>Current Affairs {monthName} {year} in Gujarati — Awards & Honours</li>
            <li>Current Affairs {monthName} {year} in Gujarati — Appointments</li>
            <li>{guMonth} {guYear} કરંટ અફેર્સ — GPSC, GSSSB CCE</li>
            <li>{monthName} {year} current affairs questions and answers in Gujarati</li>
            <li>Daily current affairs Gujarati {monthName} {year}</li>
          </ul>
        </div>

      </div>
    </main>
  );
}
