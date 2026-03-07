import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, BookOpen, PlayCircle, Target, Sparkles, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600;



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

function parseMonthYear(slug: string): { month: string; year: string } | null {
  // Format: march-2026 or 03-2026
  const parts = slug.toLowerCase().split('-');
  if (parts.length !== 2) return null;

  let month = parts[0];
  const year = parts[1];

  // Convert month name to number if needed
  const monthMap: Record<string, string> = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
  };

  if (monthMap[month]) {
    month = monthMap[month];
  }

  if (!/^\d{2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  return { month, year };
}

export async function generateMetadata({ params }: { params: Promise<{ monthYear: string }> }): Promise<Metadata> {
  const { monthYear } = await params;
  const parsed = parseMonthYear(monthYear);
  if (!parsed) return { title: 'Not Found' };

  const { month, year } = parsed;
  const monthName = MONTH_NAMES[month] || month;
  const guMonth = GUJARATI_MONTHS[month] || month;

  return {
    title: `Current Affairs ${monthName} ${year} in Gujarati - Monthly MCQs & Notes | CCE, GPSC | કરંટ અફેર્સ ${guMonth} ${year}`,
    description: `Complete ${monthName} ${year} Current Affairs in Gujarati (${guMonth} ${year} કરંટ અફેર્સ). All daily quizzes compiled with MCQs & explanations for GSSSB CCE 2026, GPSC, PSI, Constable & Talati exam preparation.`,
    keywords: `Current Affairs ${monthName} ${year} Gujarati, ${guMonth} ${year} કરંટ અફેર્સ, Monthly Current Affairs Gujarati, CCE ${monthName} ${year} Current Affairs, GPSC ${monthName} ${year}`,
    alternates: {
      canonical: `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}`,
    },
    openGraph: {
      title: `Current Affairs ${monthName} ${year} in Gujarati | Monthly Compilation`,
      description: `Free monthly current affairs ${monthName} ${year} in Gujarati. Complete MCQ compilation for GSSSB CCE, GPSC & all Gujarat govt exams.`,
      url: `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}`,
      type: 'article',
      siteName: 'CurrentAdda',
      locale: 'gu_IN',
    },
  };
}

export default async function MonthlyCurrentAffairsPage({ params }: { params: Promise<{ monthYear: string }> }) {
  const { monthYear } = await params;
  const parsed = parseMonthYear(monthYear);
  if (!parsed) notFound();

  const { month, year } = parsed;
  const monthName = MONTH_NAMES[month] || month;
  const guMonth = GUJARATI_MONTHS[month] || month;

  // Fetch all quizzes for this month
  const startDate = `${year}-${month}-01`;
  const endDate = `${year}-${month}-31`;

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str')
    .gte('quiz_date', startDate)
    .lte('quiz_date', endDate)
    .order('quiz_date', { ascending: false });

  if (!quizzes || quizzes.length === 0) notFound();

  // Calculate total question count (estimate ~10-15 questions per quiz)
  const totalQuestions = quizzes.length * 10;

  // Fetch adjacent months
  const prevMonthNum = parseInt(month) - 1;
  const nextMonthNum = parseInt(month) + 1;
  const prevMonth = prevMonthNum < 1
    ? { month: '12', year: String(parseInt(year) - 1) }
    : { month: String(prevMonthNum).padStart(2, '0'), year };
  const nextMonth = nextMonthNum > 12
    ? { month: '01', year: String(parseInt(year) + 1) }
    : { month: String(nextMonthNum).padStart(2, '0'), year };

  const prevMonthName = MONTH_NAMES[prevMonth.month]?.toLowerCase();
  const nextMonthName = MONTH_NAMES[nextMonth.month]?.toLowerCase();

  // Schema.org
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Current Affairs in Gujarati", "item": "https://currentadda.vercel.app/current-affairs-in-gujarati" },
      { "@type": "ListItem", "position": 3, "name": `${monthName} ${year}`, "item": `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}` }
    ]
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Current Affairs ${monthName} ${year} in Gujarati`,
    "description": `Monthly compilation of ${totalQuestions}+ current affairs MCQs for ${monthName} ${year} in Gujarati`,
    "url": `https://currentadda.vercel.app/current-affairs-in-gujarati/${monthYear}`,
    "numberOfItems": quizzes.length,
    "hasPart": quizzes.map((q: any) => ({
      "@type": "Quiz",
      "name": q.title,
      "url": `https://currentadda.vercel.app/quiz/${q.slug}`
    }))
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/current-affairs-in-gujarati" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col flex-1">
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              {monthName} {year} Current Affairs
            </h1>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              {guMonth} {year} • {totalQuestions}+ MCQs
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 pt-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <Link href="/current-affairs-in-gujarati" className="hover:text-indigo-600 transition-colors">Current Affairs</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-indigo-600">{monthName} {year}</span>
        </nav>

        {/* Hero Section */}
        <div className="relative mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-36 -mt-36" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Monthly Compilation</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
              Current Affairs <span className="text-indigo-600">{monthName} {year}</span> in Gujarati
            </h2>
            <p className="text-slate-500 text-sm font-medium gujarati-text leading-relaxed max-w-2xl">
              {guMonth} {year} ના સંપૂર્ણ Current Affairs compilation — <strong>{totalQuestions}+ MCQs</strong> ગુજરાતી ભાષામાં, {quizzes.length} daily quizzes.
              GSSSB CCE 2026, GPSC, PSI, Constable અને તમામ Gujarat Govt Exams ની તૈયારી માટે.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="text-xl font-black text-indigo-600">{totalQuestions}+</div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total MCQs</div>
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
          <p className="text-xs text-amber-700 font-bold gujarati-text">
            <strong>CCE 2026:</strong> {guMonth} {year} ના Current Affairs GSSSB CCE Prelims (30 Marks) અને Group B Mains (30 Marks) માટે essential છે.
          </p>
        </div>

        {/* Daily Quizzes List */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Daily Quizzes - {monthName} {year}</h3>
          </div>
          <div className="grid gap-3">
            {quizzes.map((quiz: any) => {
              const qDate = quiz.quiz_date;
              return (
                <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          {quiz.date_str || qDate}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 gujarati-text leading-snug line-clamp-2">
                        {quiz.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {qDate && (
                        <Link href={`/daily/${qDate}`} className="bg-slate-50 px-3 py-2 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Notes
                        </Link>
                      )}
                      <Link href={`/quiz/${quiz.slug}`} className="bg-indigo-600 px-3 py-2 rounded-xl text-[8px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" />
                        Quiz
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Navigation between months */}
        <nav className="flex justify-between items-center mb-10">
          {prevMonthName && (
            <Link href={`/current-affairs-in-gujarati/${prevMonthName}-${prevMonth.year}`} className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {MONTH_NAMES[prevMonth.month]} {prevMonth.year}
            </Link>
          )}
          {nextMonthName && (
            <Link href={`/current-affairs-in-gujarati/${nextMonthName}-${nextMonth.year}`} className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors">
              {MONTH_NAMES[nextMonth.month]} {nextMonth.year}
              <ChevronRight className="w-4 h-4" />
           </Link>
          )}
        </nav>

        {/* SEO Bottom Content */}
        <section className="mb-8">
          <div className="bg-white/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 mb-3 gujarati-text">
              {guMonth} {year} Current Affairs in Gujarati - Monthly Compilation
            </h3>
            <p className="text-xs text-slate-500 font-medium gujarati-text leading-relaxed">
              {guMonth} {year} ના completed Current Affairs MCQs GSSSB CCE 2026 (7338 જગ્યા, 30 Marks Prelims + 30 Marks Mains),
              GPSC Class 1-2, Police Constable, PSI, Talati, Bin Sachivalay Clerk, TET/TAT/HTAT, અને તમામ Gujarat Government Exams ની monthly revision માટે ઉપયોગી છે.
              દરેક quiz માં detailed explanations ગુજરાતી ભાષામાં ઉપલબ્ધ છે.
              <Link href="/current-affairs-in-gujarati" className="text-indigo-600 hover:underline ml-1">View Complete Current Affairs Guide →</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
