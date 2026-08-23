import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Clock, PlayCircle, Trophy } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 86400; // Revalidate exam-specific pages once per day

const EXAMS: Record<string, { title: string; metaDesc: string; gujaratiTitle: string; marksText: string; faqs: { q: string; a: string }[] }> = {
  'gpsc': {
    title: 'GPSC Current Affairs in Gujarati 2026',
    metaDesc: 'Best GPSC Current Affairs in Gujarati 2026 (કરંટ અફેર્સ). 10,000+ Free MCQs for Class 1-2 & DySO with detailed Gujarati explanations.',
    gujaratiTitle: 'GPSC કરંટ અફેર્સ',
    marksText: 'GPSC Class 1-2 અને DySO માટે કરંટ અફેર્સનું વેઇટેજ 50 માર્ક્સનું હોય છે.',
    faqs: [
      { q: 'GPSC Current Affairs in Gujarati ની તૈયારી કેવી રીતે કરવી?', a: 'CurrentAdda પર GPSC Class 1-2 માટે દૈનિક MCQs, વિગતવાર ગુજરાતી સમજૂતી, અર્થતંત્ર, બંધારણ અને આંતરરાષ્ટ્રીય ઘટનાઓના વિશેષ પ્રશ્નો ફ્રીમાં પ્રેક્ટિસ કરી શકાય છે.' },
      { q: 'GPSC માં કરંટ અફેર્સના કેટલા માર્ક્સ હોય છે?', a: 'GPSC Prelims (General Studies) માં Current Affairs ના આશરે 40-50 પ્રશ્નો પૂછાય છે.' },
    ]
  },
  'gsssb': {
    title: 'GSSSB Current Affairs in Gujarati 2026',
    metaDesc: 'GSSSB 2026 Current Affairs in Gujarati (7338 Posts). Free MCQs and daily questions for Group A & Group B exams.',
    gujaratiTitle: 'GSSSB કરંટ અફેર્સ',
    marksText: 'CCE પ્રિલિમ્સમાં 30 માર્ક્સ અને મેન્સમાં 30 માર્ક્સ.',
    faqs: [
      { q: 'GSSSB પરીક્ષા માટે કરંટ અફેર્સ કેટલા માર્ક્સનું પૂછાય છે?', a: 'GSSSB CCE પ્રિલિમ્સમાં 30 માર્ક્સ અને ગ્રૂપ B મેન્સમાં 30 માર્ક્સનું કરંટ અફેર્સ પૂછાય છે.' }
    ]
  },
  'cce': {
    title: 'GSSSB CCE Current Affairs in Gujarati 2026',
    metaDesc: 'GSSSB CCE 2026 Current Affairs in Gujarati (7338 Vacancies). 30 Marks weightage. Free MCQs and daily questions for Group A & Group B exams.',
    gujaratiTitle: 'GSSSB CCE કરંટ અફેર્સ',
    marksText: 'CCE પ્રિલિમ્સમાં 30 માર્ક્સ અને મેન્સમાં 30 માર્ક્સ.',
    faqs: [
      { q: 'GSSSB CCE 2026 માં કરંટ અફેર્સનું શું વેઇટેજ છે?', a: 'CCE Prelims (150 Marks) માં General Awareness & Current Affairs માટે 30 માર્ક્સ અને Group B Mains (200 Marks) માં કરંટ અફેર્સ માટે 30 માર્ક્સ ફાળવાયેલા છે.' },
      { q: 'CCE 2026 Current Affairs PDF ક્યાંથી મળશે?', a: 'CurrentAdda વેબસાઇટ પર સ્ટડી નોટ્સ અને Telegram channel @currentadda પરથી PDF ફ્રીમાં ડાઉનલોડ કરી શકો છો.' }
    ]
  },
  'talati': {
    title: 'Talati Current Affairs in Gujarati 2026',
    metaDesc: 'Talati and Panchayat exams Current Affairs in Gujarati 2026. Daily questions and MCQs for Talati cum Mantri preparation.',
    gujaratiTitle: 'તલાટી કરંટ અફેર્સ',
    marksText: 'તલાટી ની પરીક્ષામાં કરંટ અફેર્સ ના અંદાજે 10-15 પ્રશ્નો પૂછાય છે.',
    faqs: [
      { q: 'તલાટી પરીક્ષા માટે કરંટ અફેર્સ કેવી રીતે વાંચવું?', a: 'છેલ્લા 6 મહિનાના ગુજરાત અને રાષ્ટ્રીય કરંટ અફેર્સ CurrentAdda પર દરરોજ 15 મિનિટ ક્વિઝ રમીને તૈયાર કરો.' }
    ]
  },
  'psi': {
    title: 'PSI Current Affairs in Gujarati 2026',
    metaDesc: 'Police Sub Inspector (PSI) Current Affairs in Gujarati 2026. Free MCQs, Law, Defence and National events in Gujarati for PSI preparation.',
    gujaratiTitle: 'PSI કરંટ અફેર્સ',
    marksText: 'PSI પ્રિલિમ્સ અને મેન્સ જનરલ નોલેજ પેપરમાં કરંટ અફેર્સનું મોટું વેઇટેજ છે.',
    faqs: [
      { q: 'PSI પરીક્ષા માટે કયા કરંટ અફેર્સ ટોપિક્સ મહત્વના છે?', a: 'સંરક્ષણ (Defence), કાયદાકીય સુધારાઓ (Bills & Acts), નવી નિમણૂકો અને રાષ્ટ્રીય સુરક્ષા સંબંધિત મુદ્દાઓ PSI માટે ખૂબ ઉપયોગી છે.' }
    ]
  },
  'police-constable': {
    title: 'Police Constable Current Affairs in Gujarati 2026',
    metaDesc: 'Gujarat Police Constable Bharti Current Affairs in Gujarati 2026. Daily GK, Sports, Awards and State news MCQs with Gujarati explanation.',
    gujaratiTitle: 'પોલીસ કોન્સ્ટેબલ કરંટ અફેર્સ',
    marksText: 'પોલીસ કોન્સ્ટેબલ પરીક્ષામાં વર્તમાન પ્રવાહ અને જનરલ નોલેજના સીધા પ્રશ્નો પૂછાય છે.',
    faqs: [
      { q: 'પોલીસ કોન્સ્ટેબલ માટે કરંટ અફેર્સની પ્રેક્ટિસ ક્યાં કરવી?', a: 'CurrentAdda પર કોન્સ્ટેબલ ભરતી માટે દૈનિક MCQs અને રમત-ગમત, એવોર્ડ્સ, મહત્વના દિવસોના સ્પેશિયલ સેટ્સ ઉપલબ્ધ છે.' }
    ]
  },
  'bin-sachivalay': {
    title: 'Bin Sachivalay Clerk Current Affairs in Gujarati 2026',
    metaDesc: 'GSSSB Bin Sachivalay Clerk Current Affairs in Gujarati 2026. Free MCQs, government schemes, and state current affairs.',
    gujaratiTitle: 'બિન સચિવાલય કરંટ અફેર્સ',
    marksText: 'બિન સચિવાલય ક્લાર્ક પરીક્ષા માટે સરકારી યોજનાઓ અને વર્તમાન પ્રવાહો અતિ મહત્વના છે.',
    faqs: [
      { q: 'બિન સચિવાલય પરીક્ષા માટે કયા પ્રશ્નો પૂછાય છે?', a: 'ગુજરાત સરકારની નવી યોજનાઓ, બજેટ, બંધારણીય સુધારાઓ અને મહત્વના વ્યક્તિઓની નિમણૂક બિન સચિવાલયમાં વધુ પૂછાય છે.' }
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(EXAMS).map((exam) => ({ exam }));
}

export async function generateMetadata({ params }: { params: Promise<{ exam: string }> }): Promise<Metadata> {
  const { exam } = await params;
  const examData = EXAMS[exam.toLowerCase()];
  
  if (!examData) {
    return { title: 'Not Found' };
  }

  return {
    title: `${examData.title} | Free Daily Quiz & MCQs`,
    description: examData.metaDesc,
    alternates: {
      canonical: `https://currentadda.vercel.app/current-affairs-gujarati/${exam}`,
    },
    openGraph: {
      title: examData.title,
      description: examData.metaDesc,
      url: `https://currentadda.vercel.app/current-affairs-gujarati/${exam}`,
      type: 'website',
      siteName: 'CurrentAdda',
      locale: 'gu_IN',
    },
  };
}

export default async function ExamCurrentAffairsPage({ params }: { params: Promise<{ exam: string }> }) {
  const { exam } = await params;
  const examKey = exam.toLowerCase();
  const examData = EXAMS[examKey];

  if (!examData) {
    notFound();
  }

  // Fetch latest 20 quizzes
  const { data: latestQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, slug, quiz_date, date_str')
    .order('quiz_date', { ascending: false })
    .limit(20);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Current Affairs in Gujarati", "item": "https://currentadda.vercel.app/current-affairs-in-gujarati" },
      { "@type": "ListItem", "position": 3, "name": examData.title, "item": `https://currentadda.vercel.app/current-affairs-gujarati/${exam}` }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": examData.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="bg-white/70 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center gap-3">
          <Link href="/current-affairs-in-gujarati" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
              {examData.title}
            </span>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.15em] mt-0.5">
              {examData.gujaratiTitle}
            </span>
          </div>
        </div>
      </header>

      <section className="relative px-5 pt-10 pb-14 overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900 mb-4">
            <span className="text-indigo-600 uppercase">{exam}</span> Current Affairs in Gujarati 2026
          </h1>
          <p className="text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed gujarati-text mb-4">
            {examData.gujaratiTitle} ની પરીક્ષા માટે ઉપયોગી દૈનિક કરંટ અફેર્સ. ફ્રી MCQ Quiz અને PDF સ્ટડી મટીરીયલ.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
             <Trophy className="w-4 h-4 text-amber-600" />
             <span className="text-xs font-bold text-amber-800 gujarati-text">{examData.marksText}</span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">Latest Practice Quizzes</h2>
            </div>
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
                    <Link href={`/quiz/${quiz.slug}`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-100 hover:shadow-md transition-all">
                      <PlayCircle className="w-3.5 h-3.5" />
                      Play MCQ Quiz
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {examKey === 'cce' && (
          <section className="mb-12">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase border-b pb-4">Gujarat GSSSB CCE Exam Pattern & Syllabus (7000+ Vacancies)</h2>
              
              <div className="space-y-6 text-slate-700 text-sm leading-relaxed gujarati-text font-medium">
                <p>
                  Gujarat Subordinate Service Selection Board (GSSSB) દ્વારા <strong>Combined Competitive Examination (CCE)</strong> ની જાહેરાત કરવામાં આવી છે. જેમાં Group A અને Group B ની વિવિધ 7000+ જગ્યાઓ માટે ભરતી પ્રક્રિયા હાથ ધરવામાં આવશે. આ પરીક્ષા માટે કરંટ અફેર્સનું ખૂબ જ મોટું યોગદાન છે.
                </p>

                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-black text-indigo-900 mb-4">1. CCE Preliminary Exam (પ્રિલિમ્સ પરીક્ષા)</h3>
                  <p className="mb-4">
                    પ્રિલિમ્સ પરીક્ષા માત્ર ક્વોલિફાઇંગ (Screening Test) તરીકે લેવામાં આવશે અને તે Computer Based Recruitment Test (CBRT) પદ્ધતિથી 1 કલાકની રહેશે. સાચા જવાબ પર 1 માર્ક અને ખોટા જવાબ પર -0.25 નેગેટિવ માર્કિંગ છે.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl"><span className="font-bold text-indigo-600">40 Marks:</span> Reasoning Ability</li>
                    <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl"><span className="font-bold text-indigo-600">30 Marks:</span> Quantitative Aptitude</li>
                    <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl"><span className="font-bold text-indigo-600">15 Marks:</span> English Language</li>
                    <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl"><span className="font-bold text-indigo-600">15 Marks:</span> Gujarati Language</li>
                  </ul>
                  <p className="text-indigo-800 font-black">Total: 100 Marks | Time: 60 Minutes</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-lg font-black text-slate-900 mb-4">2. CCE Mains Exam (મેન્સ પરીક્ષા)</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-2">Group A (Descriptive Type - 350 Marks)</h4>
                    <p className="text-slate-600">
                      હેડ ક્લાર્ક અને સિનિયર ક્લાર્ક જેવી પોસ્ટ્સ માટે. જેમાં ત્રણ પેપર હશે: ગુજરાતી ભાષા (100 માર્ક્સ), English Language (100 Marks) અને General Studies (150 Marks). જનરલ સ્ટડીઝના પેપરમાં વર્તમાન પ્રવાહો (Current Affairs) ના સીધા પ્રશ્નો જોવા મળશે.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 mb-2">Group B (Objective MCQ Type - 200 Marks)</h4>
                    <p className="text-slate-600 mb-3">
                      જુનિયર ક્લાર્ક અને અન્ય સંબંધિત પોસ્ટ્સ માટે 200 માર્ક્સનું MCQ આધારિત એક સિંગલ પેપર રહેશે (સમય: 120 મિનિટ).
                    </p>
                    <p className="bg-yellow-100 text-yellow-900 p-4 rounded-xl border border-yellow-200 font-bold">
                      🔥 Group B ના સિલેબસમાં સ્પષ્ટપણે "Current Affairs and Current Trends" ને 30 માર્ક્સનું સીધું વેઇટેજ આપવામાં આવ્યું છે. જેમાં રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય મહત્વના બનાવો, સરકારી યોજનાઓ, અને ગુજરાત સરકારના વર્તમાન મુદ્દાઓ પૂછાશે.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-black text-slate-900 mb-3">How CurrentAdda Helps You Crack CCE?</h3>
                  <p>
                    જેમ તમે જોઈ શકો છો, <strong>GSSSB CCE Group B</strong> માટે એકલું કરંટ અફેર્સ 30 માર્ક્સનું વેઇટેજ ધરાવે છે. CurrentAdda પર અમે દરરોજ પરીક્ષાલક્ષી અગત્યના પ્રશ્નોની Daily MCQ ક્વિઝ અપડેટ કરીએ છીએ. અમારી "Daily Current Affairs in Gujarati" ક્વિઝ સાથે જોડાવાથી તમે ગોખણપટ્ટી કર્યા વગર CCE માં મેક્સિમમ માર્ક્સ સ્કોર કરી શકશો.
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-200">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Frequently Asked Questions (GSSSB CCE 2026)</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Q1. Where can I download the GSSSB CCE current affairs monthly PDF?</h4>
                      <p className="text-slate-600">
                        તમે CurrentAdda પરથી દર મહિનાની <strong>GSSSB CCE current affairs monthly PDF</strong> અને <strong>Weekly current affairs Gujarati PDF for GSSSB</strong> ફ્રી માં ડાઉનલોડ કરી શકો છો. આ મટીરીયલ CCE Group A & B ના નવા અભ્યાસક્રમ મુજબ તૈયાર થયેલું છે.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Q2. What is the syllabus for GSSSB CCE Current Affairs?</h4>
                      <p className="text-slate-600">
                        સિલેબસમાં મુખ્યત્વે <strong>Gujarat government schemes</strong>, રાષ્ટ્રીય અને આંતરરાષ્ટ્રીય બનાવો, અર્થવ્યવસ્થા (Indian Economy), અને રમતગમત (Sports) નો સમાવેશ થાય છે. CCE માં 30 માર્ક્સનું કરંટ અફેર્સ પૂછાય છે.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-2">Q3. How to practice MCQ tests for CCE Preliminary Exam?</h4>
                      <p className="text-slate-600">
                        CurrentAdda એ <strong>CCE MCQ practice test in Gujarati</strong> માટે બેસ્ટ પ્લેટફોર્મ છે. તમે રોજિંદા <strong>Current affairs for GSSSB CCE 2026</strong> ની ઓનલાઈન ક્વિઝ આપીને તમારી સ્પીડ વધારી શકો છો.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        <section className="mb-12">
          <div className="bg-white/50 rounded-[2.5rem] p-8 border border-slate-100">
             <h2 className="text-xl font-black text-slate-900 mb-6 uppercase">{exam} Exam Preparation Strategy</h2>
             <div className="space-y-4 text-slate-600 text-sm leading-relaxed gujarati-text font-medium">
                <p>
                  <strong>{examData.title}</strong> ની તૈયારી માટે કરંટ અફેર્સ સૌથી વધુ સ્કોરિંગ વિષય છે. 
                  અહીં દૈનિક ક્વિઝ આપીને તમે તમારી સ્પીડ અને એક્યુરસી વધારી શકો છો.
                </p>
                <p>
                  CurrentAdda પર આપેલ MCQ પ્રશ્નો <strong>{exam.toUpperCase()}</strong> ના લેટેસ્ટ સિલેબસ અને ટ્રેન્ડ 
                  મુજબ તૈયાર કરવામાં આવ્યા છે. 
                </p>
             </div>
          </div>
        </section>
      </div>
    </main>
  );
}
