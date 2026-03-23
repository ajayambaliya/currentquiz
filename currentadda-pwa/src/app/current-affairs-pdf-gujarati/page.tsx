import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileDown,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trophy,
  AlertCircle,
  Send,
} from 'lucide-react';

// ─── SEO Metadata ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Current Affairs PDF in Gujarati 2026 Free Download | Monthly | GPSC GSSSB | CurrentAdda',
  description:
    'Download Monthly Current Affairs PDF in Gujarati 2026 for free. January, February, December PDF in Gujarati for GPSC, GSSSB CCE, PSI, Constable, Talati. Best Gujarati current affairs PDF — updated every month!',
  keywords: [
    'current affairs pdf in gujarati',
    'current affairs pdf in gujarati 2026',
    'monthly current affairs pdf gujarati',
    'gujarati current affairs pdf download',
    'current affairs in gujarati pdf free download',
    'january 2026 current affairs pdf gujarati',
    'february 2026 current affairs pdf gujarati',
    'december 2025 current affairs pdf gujarati',
    'gpsc current affairs pdf gujarati',
    'gsssb cce current affairs pdf gujarati',
    'psi current affairs gujarati pdf',
    'talati current affairs pdf in gujarati',
    'constable current affairs gujarati pdf',
    'current affairs gujarati pdf 2025',
    'current affairs gujarati pdf 2026',
    'best current affairs pdf gujarati',
    'free current affairs pdf gujarati',
    'monthly current affairs gujarati 2026',
    'currentadda pdf download',
    'current affairs notes gujarati pdf',
    'ગુજરાતી કરંટ અફેર્સ PDF',
    'ગુજરાતી current affairs PDF 2026',
    'monthly current affairs in gujarati',
    'ice rajkot current affairs gujarati alternative',
    'crack gpsc current affairs gujarati pdf',
  ].join(', '),
  alternates: {
    canonical: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
  },
  openGraph: {
    title: 'Current Affairs PDF in Gujarati 2026 Free Download | CurrentAdda',
    description:
      'Free monthly current affairs PDF in Gujarati — January, February, December 2026 & more. Best resource for GPSC, GSSSB CCE, PSI, Talati, Constable exam preparation.',
    url: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
    type: 'website',
    siteName: 'CurrentAdda',
    locale: 'gu_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Current Affairs PDF in Gujarati 2026 Free Download | CurrentAdda',
    description:
      'Free monthly current affairs PDF in Gujarati for GPSC, GSSSB CCE, PSI, Talati. Updated every month on our Telegram channel.',
  },
};

export const revalidate = 86400;

// ─── PDF Data — easy to edit each month ─────────────────────────────────────
const PDF_LIST = [
  {
    id: 'feb-2026',
    month: 'February 2026',
    monthGu: 'ફેબ્રુઆરી ૨૦૨૬',
    label: 'Latest',
    labelColor: 'bg-emerald-500',
    size: '~4 MB',
    pages: '80+',
    topics: ['National Events', 'Awards', 'Sports', 'Economy', 'Science', 'Defence'],
    telegramUrl: 'https://t.me/currentadda/20530',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    badge: '🔥 Most Downloaded',
    badgeColor: 'text-orange-600 bg-orange-50 border-orange-200',
    exams: ['GPSC', 'GSSSB CCE', 'PSI', 'Talati', 'Constable'],
  },
  {
    id: 'jan-2026',
    month: 'January 2026',
    monthGu: 'જાન્યુઆરી ૨૦૨૬',
    label: 'New Year Edition',
    labelColor: 'bg-blue-500',
    size: '~4 MB',
    pages: '80+',
    topics: ['Republic Day', 'Budget Session', 'Sports', 'International', 'Science'],
    telegramUrl: 'https://t.me/currentadda/20351',
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    badge: '⭐ High Demand',
    badgeColor: 'text-blue-600 bg-blue-50 border-blue-200',
    exams: ['GPSC', 'GSSSB CCE', 'PSI', 'Talati', 'Constable'],
  },
  {
    id: 'dec-2025',
    month: 'December 2025',
    monthGu: 'ડિસેમ્બર ૨૦૨૫',
    label: 'Year-end Edition',
    labelColor: 'bg-rose-500',
    size: '~4 MB',
    pages: '80+',
    topics: ['Year Review', 'Awards', 'Sports', 'National', 'Economy'],
    telegramUrl: 'https://t.me/currentadda/20075',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    badge: '📅 Year-End Revision',
    badgeColor: 'text-rose-600 bg-rose-50 border-rose-200',
    exams: ['GPSC', 'GSSSB CCE', 'PSI', 'Talati', 'Constable'],
  },
  {
    id: 'jul-nov-2025',
    month: 'July – November 2025',
    monthGu: 'જુલાઈ – નવેમ્બર ૨૦૨૫',
    label: '5-Month Mega Bundle',
    labelColor: 'bg-amber-500',
    size: '~18 MB',
    pages: '400+',
    topics: ['Complete 5-Month Coverage', 'All Categories', 'Exam-Ready Notes'],
    telegramUrl: 'https://t.me/currentadda/19692',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    badge: '📦 Mega Bundle',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    exams: ['GPSC', 'GSSSB CCE', 'PSI', 'Talati', 'Constable'],
  },
];

const FAQS = [
  {
    q: 'Current Affairs PDF in Gujarati free download ક્યાં મળે?',
    a: 'CurrentAdda Telegram channel (t.me/currentadda) પર દর મહિને Current Affairs PDF in Gujarati free download માટે ઉપલબ્ધ છે. આ page પર download links update થતા રહે છે.',
  },
  {
    q: 'CurrentAdda Current Affairs PDF Gujarati — GPSC, GSSSB, PSI Exam mates useful che ke?',
    a: 'હા! CurrentAdda monthly current affairs PDF ખાસ GPSC Class 1-2, GSSSB CCE 2026, PSI, Police Constable, Talati cum Mantri, And Bin Sachivalay Clerk exam mates design karelī che. Darak PDF maa National, International, Sports, Economy, Science, Awards categories cover thay che.',
  },
  {
    q: 'Monthly Current Affairs PDF Gujarati — exam mate keva topics cover thay che?',
    a: 'National Events, International Affairs, Sports (Cricket, Olympics, Asian Games), Economy (RBI, GDP, Budget), Science (ISRO, DRDO, Nobel Prize), Awards (Padma, Oscar, Filmfare), Important Days, Persons (New Appointments), Defence and Environment — badha categories cover thay che.',
  },
  {
    q: 'Current Affairs PDF Gujarati download karva mate Telegram join karvu pade?',
    a: 'CurrentAdda Telegram channel (t.me/currentadda) public che — join karya vagar pan PDF open thashe. Parantu channel join karva thi darak mahine notification maltu rhashe jyare navo PDF upload thay.',
  },
  {
    q: 'Best Monthly Current Affairs Gujarati PDF — 2026?',
    a: 'CurrentAdda ej 2026 maa best monthly current affairs PDF in Gujarati provide kare chhe — Scribd, CrackGPSC, Praajasv Foundation karta CurrentAdda PDF maa MCQs, explanations, and topic-wise coverage included hoy che. All free!',
  },
  {
    q: 'January 2026 Current Affairs PDF Gujarati ky thi download karu?',
    a: 'CurrentAdda na is page par Jan 2026 PDF link available che. Direct Telegram link par click karo ane PDF open thashe. No login required.',
  },
  {
    q: 'February 2026 Current Affairs PDF in Gujarati — free download?',
    a: 'Haa! February 2026 Current Affairs PDF in Gujarati is page par available je. Telegram link click karva thi direct PDF open thashe — bilkul free!',
  },
  {
    q: 'GSSSB CCE 2026 mate Current Affairs PDF kevo hovo joive?',
    a: 'GSSSB CCE 2026 (7338 Vacancy) maa Prelims maa 30 marks ane Group B Mains maa 30 marks Current Affairs mathi aave chhe. CurrentAdda PDF maa badha important topic cover thay chhe ane MCQ format maa practice pan kari shakay chhe.',
  },
];

// ─── Structured Data ─────────────────────────────────────────────────────────
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://currentadda.vercel.app' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Current Affairs PDF in Gujarati',
      item: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
    },
  ],
};

const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Current Affairs PDF in Gujarati 2026 Free Download',
  description:
    'Monthly Current Affairs PDF in Gujarati for GPSC, GSSSB CCE, PSI, Constable, Talati. Free download every month.',
  url: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
  inLanguage: 'gu',
  publisher: { '@type': 'Organization', name: 'CurrentAdda', url: 'https://currentadda.vercel.app' },
  hasPart: PDF_LIST.map((p) => ({
    '@type': 'DigitalDocument',
    name: `${p.month} Current Affairs PDF in Gujarati`,
    description: `Monthly current affairs PDF in Gujarati for ${p.month}. Topics: ${p.topics.join(', ')}.`,
    url: p.telegramUrl,
    encodingFormat: 'application/pdf',
    inLanguage: 'gu',
    keywords: p.exams.join(', '),
  })),
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function CurrentAffairsPdfGujaratiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_PAGE_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors" aria-label="Go to Home">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
              Current Affairs PDF Gujarati
            </h1>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5 gujarati-text">
              ગુજરાતી PDF – Free Download 2026
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative px-5 pt-12 pb-14 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 via-rose-50 to-transparent rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">
              Free Download • Updated Monthly • 100% Gujarati
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4">
            Monthly{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Current Affairs PDF in Gujarati
            </span>{' '}
            2026 — Free Download
          </h1>

          <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed gujarati-text mb-2">
            <strong>GPSC, GSSSB CCE 2026, PSI, Constable, Talati</strong> exam mates best monthly current affairs PDF
            in Gujarati — bilkul <strong>free</strong>. Darak mahine new PDF add thay chhe.
          </p>
          <p className="text-slate-500 font-medium text-xs max-w-xl mx-auto leading-relaxed gujarati-text">
            ગુજરાતી ભાષામાં માસિક કરંટ અફેર્સ PDF — National, International, Sports, Economy, Awards, Science
            categories cover thay che. Telegram thi direct download karo.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: '📄', val: '4+', label: 'PDFs Available' },
              { icon: '📅', val: 'Monthly', label: 'New PDF Added' },
              { icon: '🆓', val: '100%', label: 'Free Forever' },
              { icon: '📲', val: 'Telegram', label: 'Instant Access' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm text-center"
              >
                <div className="text-lg mb-0.5">{s.icon}</div>
                <div className="text-base font-black text-slate-900">{s.val}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        {/* ── Telegram CTA Banner ── */}
        <section className="mb-10">
          <a
            href="https://t.me/currentadda"
            target="_blank"
            rel="noopener noreferrer"
            id="join-telegram-btn"
            className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#229ED9] to-[#1A7FBF] text-white px-6 py-5 rounded-3xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-100 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-black text-base leading-tight">Join @CurrentAdda on Telegram</div>
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-0.5 gujarati-text">
                  નવો PDF upload થાય ત્યારે notification મળશે • Free
                </div>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
          </a>
        </section>

        {/* ── PDF Cards ── */}
        <section className="mb-14" aria-label="Current Affairs PDF Downloads in Gujarati">
          <div className="flex items-center gap-2 mb-6">
            <FileDown className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
              Monthly Current Affairs PDF — Free Download
            </h2>
          </div>

          <div className="grid gap-5">
            {PDF_LIST.map((pdf) => (
              <article
                key={pdf.id}
                id={`pdf-${pdf.id}`}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all group"
              >
                {/* Top gradient strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${pdf.gradient}`} />

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pdf.gradient} flex items-center justify-center text-white flex-shrink-0 shadow-md`}
                    >
                      <span className="text-2xl">📄</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {pdf.month} Current Affairs PDF in Gujarati
                        </h3>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${pdf.badgeColor}`}>
                          {pdf.badge}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-400 gujarati-text mb-3">
                        {pdf.monthGu} — કરંટ અફેર્સ PDF ગુજરાતીમાં
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                          <Calendar className="w-3 h-3" /> {pdf.month}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                          📑 {pdf.pages} pages
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wide">
                          💾 {pdf.size}
                        </span>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {pdf.topics.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Exams */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {pdf.exams.map((e) => (
                          <span
                            key={e}
                            className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-1 rounded-full"
                          >
                            {e}
                          </span>
                        ))}
                      </div>

                      {/* Download CTA */}
                      <a
                        href={pdf.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`download-${pdf.id}`}
                        className={`inline-flex items-center gap-2 bg-gradient-to-r ${pdf.gradient} text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all`}
                      >
                        <FileDown className="w-4 h-4" />
                        Download Free PDF — Telegram
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>

                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        Opens in Telegram. No login required. 100% Free.
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── How to Download Steps ── */}
        <section className="mb-14">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[2.5rem] p-8 border border-indigo-100">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">📲</span>
              Current Affairs PDF Gujarati — Download કેવી રીતે કરવી?
            </h2>
            <ol className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'PDF Card પર Click કરો',
                  desc: 'ઉપર listed PDF cards માં Download બટન click કરો.',
                },
                {
                  step: '2',
                  title: 'Telegram ખૂલશે',
                  desc: 'Telegram app અથવા web browser માં file automatically open થશે.',
                },
                {
                  step: '3',
                  title: 'PDF Save કરો',
                  desc: 'Download button click કરીને PDF phone/computer માં save કરો.',
                },
                {
                  step: '4',
                  title: 'Channel Join કરો',
                  desc: '@currentadda join કરો — new PDF upload ત્‍યારે instant notification.',
                },
              ].map((s) => (
                <li key={s.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-sm">{s.title}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5 gujarati-text">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Why CurrentAdda PDF ── */}
        <section className="mb-14">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6 leading-tight">
              CurrentAdda Current Affairs PDF{' '}
              <span className="text-indigo-600">Gujarati</span> — Best Resources 2026?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-600 gujarati-text leading-relaxed">
              {[
                {
                  emoji: '🎯',
                  title: '100% Gujarati Language',
                  desc: 'PDF સંપૂર્ણ ગુજરાતી ભાષામાં — Gujarat exam aspirants માટે best.',
                },
                {
                  emoji: '📋',
                  title: 'MCQ Format With Explanations',
                  desc: 'Simple notes નહીં — MCQ format + detailed Gujarati explanations.',
                },
                {
                  emoji: '🔄',
                  title: 'Monthly Updated',
                  desc: 'દર મહિને fresh PDF — January, February, March … December 2026.',
                },
                {
                  emoji: '✅',
                  title: 'Expert Verified Content',
                  desc: 'Questions verified by GPSC & GSSSB exam experts before publishing.',
                },
                {
                  emoji: '📲',
                  title: 'Instant via Telegram',
                  desc: 'PDF Telegram channel પરથી instantly download — no sign-up needed.',
                },
                {
                  emoji: '🆓',
                  title: 'Completely Free',
                  desc: 'No paid subscription — forever free. Subscribe for updates.',
                },
              ].map((f) => (
                <div key={f.title} className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
                  <span className="text-2xl flex-shrink-0">{f.emoji}</span>
                  <div>
                    <div className="font-black text-slate-800 text-sm mb-0.5">{f.title}</div>
                    <div className="text-xs text-slate-500">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Content Coverage ── */}
        <section className="mb-14">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2.5rem] p-8 border border-amber-100">
            <h2 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <span>📚</span> Monthly PDF maa shu cover thay che?
            </h2>
            <p className="text-xs text-slate-500 font-medium gujarati-text mb-6">
              (What topics are covered in Current Affairs PDF Gujarati?)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { emoji: '🏛️', cat: 'National Events', gu: 'રાષ્ટ્રીય ઘટનાઓ' },
                { emoji: '🌍', cat: 'International', gu: 'આંતરરાષ્ટ્રીય' },
                { emoji: '🏅', cat: 'Sports', gu: 'રમત-ગમત' },
                { emoji: '📈', cat: 'Economy', gu: 'અર્થતંત્ર' },
                { emoji: '🔬', cat: 'Science & Tech', gu: 'વિજ્ઞાન' },
                { emoji: '🏆', cat: 'Awards', gu: 'પુરસ્કાર' },
                { emoji: '🛡️', cat: 'Defence', gu: 'સંરક્ષણ' },
                { emoji: '📅', cat: 'Important Days', gu: 'મહત્વના દિવસો' },
                { emoji: '👤', cat: 'Appointments', gu: 'નિમણૂક' },
                { emoji: '🌿', cat: 'Environment', gu: 'પર્યાવરણ' },
                { emoji: '📜', cat: 'Bills & Acts', gu: 'બિલ અને અધિનિયમ' },
                { emoji: '🎨', cat: 'Art & Culture', gu: 'કળા-સંસ્કૃતિ' },
              ].map((c) => (
                <div
                  key={c.cat}
                  className="bg-white/80 border border-amber-100 rounded-2xl p-3 flex items-center gap-2"
                >
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{c.cat}</div>
                    <div className="text-[9px] text-slate-400 gujarati-text">{c.gu}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Exam Relevance ── */}
        <section className="mb-14">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Kon Kon exams mate CurrentAdda PDF useful che?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { exam: 'GSSSB CCE 2026', detail: '7338 Posts — 30 Marks Current Affairs in Prelims & Mains', hot: true },
                { exam: 'GPSC Class 1-2', detail: 'General Studies maa Current Affairs high weightage', hot: true },
                { exam: 'PSI (Police Sub-Inspector)', detail: 'Current Affairs part of General Knowledge section', hot: false },
                { exam: 'Police Constable', detail: 'Gujarat & National Current Events important', hot: false },
                { exam: 'Talati cum Mantri', detail: 'Local + National Current Affairs tested', hot: false },
                { exam: 'Bin Sachivalay Clerk', detail: 'GK & Current Affairs section in exam', hot: false },
                { exam: 'TET / TAT / HTAT', detail: 'Current Events in General Knowledge', hot: false },
                { exam: 'Revenue Talati', detail: 'Gujarat State + National events tested', hot: false },
              ].map((e) => (
                <div
                  key={e.exam}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${
                    e.hot ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${e.hot ? 'text-amber-500' : 'text-indigo-400'}`}
                  />
                  <div>
                    <div className={`text-sm font-black ${e.hot ? 'text-amber-800' : 'text-slate-700'}`}>
                      {e.exam} {e.hot && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-1">Hot</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 gujarati-text">{e.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO Rich Text Content ── */}
        <section className="mb-14">
          <div className="bg-white/60 rounded-[2.5rem] p-8 border border-slate-100 space-y-5 text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              Current Affairs PDF in Gujarati 2026 — Free Monthly Download
            </h2>

            <p>
              <strong>Current Affairs PDF in Gujarati</strong> (ગુજરાતી current affairs PDF) ગુજરાત ના
              competitive exam aspirants માટે સૌથી ઉપયોગી study material છે. GPSC, GSSSB CCE 2026, PSI, Police
              Constable, Talati, Bin Sachivalay — તમામ Gujarat Government Exams અ current affairs PDF ની
              direct demand છે.
            </p>

            <p>
              CurrentAdda ના monthly current affairs PDF ખાસ ગુજરાતી ભાષામાં design kerel chhe. PDF maa MCQ
              questions, detailed Gujarati explanations, important events summary, ane exam-relevant
              highlights included hoy chhe — je other websites kem provide karta nathi.
            </p>

            <h3 className="text-lg font-black text-slate-800 pt-2">
              Monthly Current Affairs PDF Gujarati 2026 — Available Months
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'February 2026 Current Affairs PDF Gujarati',
                'January 2026 Current Affairs PDF Gujarati',
                'December 2025 Current Affairs PDF Gujarati',
                'July–November 2025 Current Affairs PDF Gujarati (Mega Bundle)',
              ].map((m) => (
                <li key={m} className="flex items-center gap-2 text-sm">
                  <span className="text-indigo-500">✅</span>
                  {m}
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-black text-slate-800 pt-4">
              Current Affairs PDF Gujarati vs Other Sources — Why CurrentAdda?
            </h3>
            <p>
              CrackGPSC, Praajasv Foundation, RIJADEJA, Scribd — badha platforms current affairs provide
              kare chhe, parantu CurrentAdda na PDF exclusively Gujarati maa chhe, MCQ format maa chhe, ane
              exam-ready chhe. No watermarks, no paid access — completely free on our public Telegram channel
              <strong> @currentadda</strong>.
            </p>

            <h3 className="text-lg font-black text-slate-800 pt-4">
              GSSSB CCE 2026 — Current Affairs PDF Gujarati
            </h3>
            <p>
              GSSSB CCE 2026 (7338 vacancies, Advt. No. 378/202526) maa Prelims maa{' '}
              <strong>30 marks</strong> ane Group B Mains maa <strong>30 marks</strong> — kul 60 marks Current
              Affairs mathi! Aa PDF thi revision fast ane effective bane chhe. 0.25 negative marking chhe,
              etle accuracy jaruri chhe — MCQ practice thi accuracy improve thay chhe.
            </p>

            <div className="flex gap-3 flex-wrap pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Practice Daily Quiz Free
              </Link>
              <Link
                href="/current-affairs-in-gujarati"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-100 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-indigo-300 transition-all"
              >
                Current Affairs in Gujarati
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-14">
          <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
            <span>❓</span> Frequently Asked Questions — Current Affairs PDF Gujarati
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden group"
                open={i === 0}
              >
                <summary className="px-5 py-4 cursor-pointer font-bold text-sm text-slate-800 list-none flex items-start justify-between gap-3 hover:text-indigo-600 transition-colors">
                  <span className="gujarati-text leading-snug">{faq.q}</span>
                  <svg
                    className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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

        {/* ── Notice Banner ── */}
        <section className="mb-14">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-amber-800 text-sm mb-1">📢 New PDF Every Month!</div>
              <p className="text-xs text-amber-700 font-medium gujarati-text leading-relaxed">
                CurrentAdda Telegram channel (@currentadda) join karo — darak mahine navo current affairs PDF
                upload thay tyare direct notification malashe. Channel bilkul public ane free chhe.
              </p>
              <a
                href="https://t.me/currentadda"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest text-amber-800 hover:text-amber-900 transition-colors"
              >
                Join Telegram Channel <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Internal Links ── */}
        <section className="mb-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/current-affairs-in-gujarati"
            id="link-current-affairs"
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <BookOpen className="w-5 h-5 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">
                  Current Affairs in Gujarati
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily MCQ Quiz</p>
              </div>
            </div>
          </Link>
          <Link
            href="/categories"
            id="link-categories"
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-all">
                <span className="text-lg">🗂️</span>
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-purple-600 transition-colors text-sm">
                  Category-wise Current Affairs
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Sports, National, Economy...
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/subjects"
            id="link-subjects"
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-600 transition-all">
                <span className="text-lg">📚</span>
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-amber-600 transition-colors text-sm">
                  Subject-wise Practice
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  History, Geography, Polity...
                </p>
              </div>
            </div>
          </Link>
          <Link
            href="/leaderboard"
            id="link-leaderboard"
            className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                <Trophy className="w-5 h-5 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-emerald-600 transition-colors text-sm">
                  Leaderboard
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Compete & rank with students
                </p>
              </div>
            </div>
          </Link>
        </section>

        {/* Footer credit */}
        <div className="py-8 text-center">
          <Link href="/author" className="inline-block group">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] opacity-60">
              Crafted with ❤️ by
            </span>
            <br />
            <span className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-all">
              Ajay Ambaliya
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
