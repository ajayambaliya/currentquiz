import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';
import { BookOpen, ChevronRight, Calendar, Sparkles, Trophy, Target, Clock, ArrowLeft, PlayCircle, FileText, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Current Affairs in Gujarati 2026 - Daily Quiz, MCQs & Notes | કરંટ અફેર્સ ગુજરાતી',
  description: 'Free Daily Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી 2026) for GPSC, GSSSB, PSI, Constable, Talati & Bin Sachivalay Exams. 10,000+ MCQs, Live Quizzes, Leaderboard, PDF Downloads. Updated daily with explanations!',
  keywords: [
    'Current Affairs in Gujarati',
    'current affairs in gujarati',
    'કરંટ અફેર્સ ગુજરાતી',
    'GPSC Current Affairs in Gujarati',
    'Daily Current Affairs Gujarati 2026',
    'Current Affairs Quiz Gujarati',
    'Gujarati Current Affairs MCQ',
    'GSSSB Current Affairs',
    'Current Affairs PDF Gujarati',
    'Monthly Current Affairs Gujarati',
  ].join(', '),
  alternates: {
    canonical: 'https://currentadda.vercel.app/current-affairs-in-gujarati',
  },
  openGraph: {
    title: 'Current Affairs in Gujarati 2026 | Daily Quiz & MCQs | CurrentAdda',
    description: 'Free daily current affairs quiz in Gujarati. 10,000+ MCQs for GPSC, GSSSB, PSI & all Gujarat govt exams. Live quizzes with leaderboard!',
    url: 'https://currentadda.vercel.app/current-affairs-in-gujarati',
    type: 'website',
    siteName: 'CurrentAdda',
    locale: 'gu_IN',
  },
};

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CurrentAffairsGujaratiPage() {
  // Fetch latest quizzes
  const { data: latestQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str, question_count')
    .order('quiz_date', { ascending: false })
    .limit(10);

  // Fetch total stats
  const { count: totalQuizzes } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact', head: true });

  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  // Generate months for archive links
  const end = new Date();
  const start = subMonths(end, 11);
  const months = eachMonthOfInterval({ start, end }).reverse();

  // Schema.org structured data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "CurrentAdda",
    "url": "https://currentadda.vercel.app",
    "description": "Daily Current Affairs in Gujarati for GPSC, GSSSB, and all Gujarat Government Competitive Exams",
    "founder": {
      "@type": "Person",
      "name": "Ajay Ambaliya"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Current Affairs in Gujarati", "item": "https://currentadda.vercel.app/current-affairs-in-gujarati" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Current Affairs in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી) refers to the latest national and international news events presented in the Gujarati language, specifically curated for competitive exam preparation like GPSC, GSSSB, PSI, Constable, and Talati exams."
        }
      },
      {
        "@type": "Question",
        "name": "How can I prepare Current Affairs in Gujarati for GPSC?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda provides free daily current affairs quizzes in Gujarati with detailed explanations. You can practice MCQs, take live quizzes, track your progress on the leaderboard, and use our subject-wise question banks covering all GPSC exam topics."
        }
      },
      {
        "@type": "Question",
        "name": "Which exams require Current Affairs in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Major Gujarat government exams that require Gujarati current affairs include GPSC Class 1-2, GSSSB Bin Sachivalay Clerk, Police Constable, PSI, Talati cum Mantri, TET/TAT/HTAT, GPRB, and various Panchayat level exams."
        }
      },
      {
        "@type": "Question",
        "name": "Is CurrentAdda free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! CurrentAdda is completely free. We provide daily updated current affairs quizzes, MCQs, live quizzes with leaderboard, subject-wise practice, and PDF downloads — all at no cost."
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
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
              Current Affairs in Gujarati
            </h1>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              કરંટ અફેર્સ ગુજરાતી 2026
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-5 pt-10 pb-14 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-100 via-purple-50 to-transparent rounded-full blur-3xl opacity-40 -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 via-rose-50 to-transparent rounded-full blur-3xl opacity-30 -ml-32 -mb-32" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">Daily Updated • Free Forever</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4">
              Best <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Current Affairs in Gujarati</span> for Exam Success
            </h2>
            <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed gujarati-text">
              GPSC, GSSSB, PSI, Constable, Talati અને તમામ ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓ માટે દૈનિક <strong>Current Affairs Quiz</strong> ગુજરાતી ભાષામાં. <strong>{totalQuestions?.toLocaleString() || '10,000'}+</strong> MCQs સાથે.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-2">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-slate-900">{totalQuizzes || '500'}+</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quizzes</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white mb-2">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-slate-900">{totalQuestions?.toLocaleString() || '10,000'}+</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MCQs</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
              <div className="inline-flex p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-2">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-xl font-black text-slate-900">Daily</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updated</div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide hover:shadow-lg hover:shadow-indigo-200 transition-all">
              <PlayCircle className="w-4 h-4" />
              Start Today's Quiz
            </Link>
            <Link href="/subjects" className="inline-flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-100 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wide hover:border-indigo-300 transition-all">
              <BookOpen className="w-4 h-4" />
              Subject-wise Quiz
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        {/* Latest Quizzes Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Latest Current Affairs Quiz</h3>
            </div>
            <Link href="/archive" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid gap-3">
            {(latestQuizzes || []).map((quiz: any, index: number) => (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.slug}`}
                className="block bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        {quiz.date_str || 'Practice Quiz'}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text leading-snug pr-4 line-clamp-2">
                      {quiz.title}
                    </h4>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-all flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Monthly Archive Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Monthly Current Affairs</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {months.map((month) => (
              <Link
                key={month.toISOString()}
                href={`/archive/${format(month, 'yyyy')}/${format(month, 'MM')}`}
                className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group text-center"
              >
                <div className="text-xs font-black text-slate-900 group-hover:text-indigo-600 uppercase transition-colors">
                  {format(month, 'MMMM yyyy')}
                </div>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                  Current Affairs
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Category-wise Current Affairs</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Politics', emoji: '🏛️', color: 'from-blue-400 to-blue-600' },
              { name: 'Sports', emoji: '⚽', color: 'from-orange-400 to-red-600' },
              { name: 'Science', emoji: '🔬', color: 'from-purple-400 to-purple-600' },
              { name: 'Technology', emoji: '💻', color: 'from-emerald-400 to-teal-600' },
              { name: 'Economy', emoji: '💰', color: 'from-amber-400 to-yellow-600' },
              { name: 'International', emoji: '🌍', color: 'from-sky-400 to-blue-600' },
              { name: 'Defence', emoji: '🛡️', color: 'from-slate-500 to-slate-700' },
              { name: 'Environment', emoji: '🌿', color: 'from-green-400 to-emerald-600' },
            ].map((cat) => (
              <Link key={cat.name} href="/categories" className="group">
                <div className={`bg-gradient-to-br ${cat.color} p-4 rounded-2xl text-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all`}>
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <span className="text-[8px] font-black text-white uppercase tracking-wide">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO Content: Gujarati */}
        <section className="mb-12">
          <div className="bg-white/50 rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">
              <span className="text-indigo-600">Current Affairs in Gujarati</span> - કરંટ અફેર્સ ગુજરાતી 2026
            </h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
              <p>
                <strong>Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી)</strong> એ ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓની તૈયારીનો સૌથી મહત્વનો ભાગ છે.
                ગુજરાત સરકારની તમામ પરીક્ષાઓમાં — પછી તે <strong>GPSC Class 1-2</strong> હોય, <strong>GSSSB Bin Sachivalay Clerk</strong> હોય,
                <strong>Police Constable / PSI</strong> હોય, <strong>Talati</strong> હોય કે <strong>TET/TAT/HTAT</strong> — કરંટ અફેર્સના પ્રશ્નો 25-30% વેઇટેજ ધરાવે છે.
              </p>

              <h3 className="text-lg font-black text-slate-800 pt-4">CurrentAdda પર Current Affairs in Gujarati શું મળે?</h3>

              <ul className="grid grid-cols-1 gap-3 mt-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Daily Updated Quiz (દૈનિક ક્વિઝ):</strong> દરરોજ નવા current affairs ના MCQ પ્રશ્નો ગુજરાતી ભાષામાં, વિગતવાર સમજૂતી સાથે.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Live Interactive Quiz:</strong> ઓનલાઇન ક્વિઝ રમો, તમારો સ્કોર તપાસો, અને leaderboard પર rank મેળવો.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Subject-wise Practice (વિષયવાર પ્રેક્ટિસ):</strong> History, Geography, Science, Polity, Economy — દરેક વિષયના અલગ MCQ sets.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Category-wise MCQs:</strong> Politics, Sports, International, Defence, Environment — category wise પ્રેક્ટિસ.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>PDF Downloads:</strong> Study Mode અને Practice Mode બંને format માં PDF ડાઉનલોડ કરો (Telegram Channel થકી).</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span><strong>Streak & Leaderboard:</strong> દૈનિક streak બનાવો, leaderboard પર compete કરો, અને motivation જાળવો.</span>
                </li>
              </ul>

              <h3 className="text-lg font-black text-slate-800 pt-4">Current Affairs in Gujarati કોના માટે છે?</h3>
              <p>
                CurrentAdda ખાસ કરીને ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓની તૈયારી કરતા વિદ્યાર્થીઓ માટે બનાવવામાં આવ્યું છે:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> GPSC Class 1-2 કરંટ અફેર્સ</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> GSSSB Bin Sachivalay Clerk</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> Police Constable & PSI</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> Talati cum Mantri</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> TET / TAT / HTAT</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> GPRB Exams</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> Revenue Talati</li>
                <li className="flex items-center gap-2"><span className="text-indigo-500">✅</span> Panchayat Level Exams</li>
              </ul>

              <h3 className="text-lg font-black text-slate-800 pt-4">Why Choose CurrentAdda for Current Affairs in Gujarati?</h3>
              <p>
                CurrentAdda માં premium features ફ્રીમાં ઉપલબ્ધ છે. <strong>Daily updated content</strong>, <strong>interactive quizzes</strong>,
                <strong>instant scores</strong>, <strong>detailed explanations in Gujarati</strong>, <strong>leaderboard competition</strong>, અને
                <strong>streak tracking</strong> — આ બધું એક જ platform પર. અન્ય websites ફક્ત text-based notes આપે છે,
                પરંતુ CurrentAdda તમને <strong>practice-by-doing</strong> approach આપે છે — જે proven study method છે.
              </p>

              <h3 className="text-lg font-black text-slate-800 pt-4">Daily Current Affairs Gujarati 2026 - કેવી રીતે તૈયારી કરવી?</h3>
              <p>
                Current Affairs ની અસરકારક તૈયારી માટે આ પગલાં અનુસરો:
              </p>
              <ol className="list-decimal list-inside space-y-2 mt-2">
                <li><strong>Daily Quiz Practice:</strong> દરરોજ CurrentAdda ની daily quiz રમો.</li>
                <li><strong>Read Explanations:</strong> દરેક પ્રશ્નની ગુજરાતી સમજૂતી ધ્યાનથી વાંચો.</li>
                <li><strong>Revise Monthly:</strong> મહિના અંતે monthly current affairs compilation review કરો.</li>
                <li><strong>Subject Practice:</strong> Subject-wise quiz section માં regularly practice કરો.</li>
                <li><strong>Track Progress:</strong> Leaderboard અને streak system થી તમારી progress track કરો.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* FAQ Section (Visible to users) */}
        <section className="mb-12">
          <div className="bg-white/50 rounded-[2.5rem] p-8 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6">
              Frequently Asked Questions - Current Affairs in Gujarati
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-2">❓ Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી) શું છે?</h3>
                <p className="text-sm text-slate-600 font-medium gujarati-text leading-relaxed">
                  Current Affairs in Gujarati એ રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય મહત્વની ઘટનાઓ છે જે ગુજરાતી ભાષામાં રજૂ થાય છે. GPSC, GSSSB, PSI, Constable, Talati જેવી ગુજરાત સ્પર્ધાત્મક પરીક્ષાઓ માટે આ ખૂબ જ મહત્વનું છે.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-2">❓ GPSC Current Affairs ની તૈયારી કેવી રીતે કરવી?</h3>
                <p className="text-sm text-slate-600 font-medium gujarati-text leading-relaxed">
                  CurrentAdda પર free daily current affairs quizzes ઉપલબ્ધ છે. દરરોજ MCQ practice કરો, detailed explanations વાંચો, leaderboard પર compete કરો, અને subject-wise question banks નો ઉપયોગ કરો.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-2">❓ કયા exams માટે Gujarati Current Affairs જરૂરી છે?</h3>
                <p className="text-sm text-slate-600 font-medium gujarati-text leading-relaxed">
                  GPSC Class 1-2, GSSSB Bin Sachivalay, Police Constable, PSI, Talati cum Mantri, TET/TAT/HTAT, GPRB, અને અન્ય તમામ Gujarat Government Exams માટે Gujarati Current Affairs Essential છે.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 mb-2">❓ CurrentAdda ફ્રી છે?</h3>
                <p className="text-sm text-slate-600 font-medium gujarati-text leading-relaxed">
                  હા! CurrentAdda સંપૂર્ણ ફ્રી છે. Daily quizzes, MCQs, live quizzes, leaderboard, subject-wise practice, અને PDF downloads — બધું ફ્રી.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links Section */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/subjects" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Subject-wise Quiz</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History, Polity, Geography & more</p>
              </div>
            </div>
          </Link>
          <Link href="/categories" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 transition-all">
                <FileText className="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-purple-600 transition-colors">Category-wise Practice</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sports, Politics, Science & more</p>
              </div>
            </div>
          </Link>
          <Link href="/leaderboard" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 transition-all">
                <Trophy className="w-6 h-6 text-amber-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-amber-600 transition-colors">Leaderboard</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compete & track your rank</p>
              </div>
            </div>
          </Link>
          <Link href="/archive" className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                <Calendar className="w-6 h-6 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 group-hover:text-emerald-600 transition-colors">Full Archive</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Browse all past quizzes</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Footer Content */}
        <div className="py-8 text-center">
          <Link href="/author" className="inline-block group">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] opacity-60">Crafted with ❤️ by</span>
            <br />
            <span className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-all">Ajay Ambaliya</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
