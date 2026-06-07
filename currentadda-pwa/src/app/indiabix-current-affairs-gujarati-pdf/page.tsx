import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileDown,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Trophy,
  Send,
  Users,
  Award,
  BookMarked,
  Download,
  ChevronDown,
  ChevronRight,
  Landmark,
  Globe2,
  FlaskConical,
  Trees,
  Shield,
  MapPin,
  ClipboardList,
  Users2,
  Zap
} from 'lucide-react';

// SEO Meta Data Optimized for AI Overview & Direct Search Intent
export const metadata: Metadata = {
  title: 'IndiaBix Current Affairs in Gujarati PDF May 2026 | 312 MCQs Free Download',
  description: 'Download IndiaBix Current Affairs in Gujarati PDF May 2026 free. 312 MCQs, 18 Categories, 31 Days. Best for GPSC, GSSSB, PSI. Get translated IndiaBix MCQ PDF for May 2026, April 2026, March 2026 & more directly via Telegram.',
  keywords: 'indiabix current affairs in gujarati, may 2026 indiabix gujarati pdf, indiabix current affairs gujarati, indiabix gujarati current affairs, indiabix gujarati, indiabix current affairs in gujarati pdf, May 2026 IndiaBix Gujarati PDF, Indiabix current affairs in gujarati pdf download, Indiabix MCQ Gujarati PDF, National current affairs indiabix gujarati, GPSC exam preparation PDF',
  openGraph: {
    title: 'IndiaBix Current Affairs in Gujarati PDF May 2026 | 312 MCQs Free',
    description: 'May 2026: 312 MCQs, 18 Categories. Instant free download of translated IndiaBix Current Affairs MCQs in Gujarati. Perfect for CCE, GPSC, and Police Bharati.',
    url: 'https://currentadda.vercel.app/indiabix-current-affairs-gujarati-pdf',
    type: 'website',
  },
  alternates: {
    canonical: 'https://currentadda.vercel.app/indiabix-current-affairs-gujarati-pdf',
  }
};

export const revalidate = 86400;

// Data Definitions
const PDF_LIST = [
  {
    id: 'may-2026-mcq',
    monthEn: 'May 2026 MCQ',
    monthGu: 'મે 2026 MCQ',
    articles: '312 MCQs | 31 Days',
    size: '18 Categories',
    telegramUrl: 'https://t.me/currentadda/20919',
    badge: 'New 🔥'
  },
  {
    id: 'apr-2026',
    monthEn: 'April 2026',
    monthGu: 'એપ્રિલ 2026',
    articles: '300+ MCQs',
    size: '~15 MB',
    telegramUrl: 'https://t.me/currentadda/20867',
    badge: 'Latest'
  },
  {
    id: 'mar-2026',
    monthEn: 'March 2026',
    monthGu: 'માર્ચ 2026',
    articles: 'Full Coverage',
    size: '~60 MB',
    telegramUrl: 'https://t.me/currentadda/20716',
    badge: 'Trending'
  },
  {
    id: 'feb-2026',
    monthEn: 'February 2026',
    monthGu: 'ફેબ્રુઆરી 2026',
    articles: 'Full Coverage',
    size: '~58 MB',
    telegramUrl: 'https://t.me/currentadda/20530',
    badge: 'Trending'
  },
  {
    id: 'jan-2026',
    monthEn: 'January 2026',
    monthGu: 'જાન્યુઆરી 2026',
    articles: 'Full Coverage',
    size: '~55 MB',
    telegramUrl: 'https://t.me/currentadda/20351',
    badge: 'Hot'
  },
  {
    id: 'dec-2025',
    monthEn: 'December 2025',
    monthGu: 'ડિસેમ્બર 2025',
    articles: 'Full Coverage',
    size: '~48 MB',
    telegramUrl: 'https://t.me/currentadda/20066',
    badge: ''
  },
  {
    id: 'jul-nov-2025',
    monthEn: 'July - November 2025',
    monthGu: 'જુલાઈ થી નવેમ્બર 2025 (Mega Bundle)',
    articles: '5 Months Combo',
    size: 'Mega PDF',
    telegramUrl: 'https://t.me/currentadda/19692',
    badge: 'Mega Bundle'
  }
];

const FAQS = [
  {
    q: "How to download May 2026 IndiaBix Current Affairs in Gujarati PDF?",
    a: "May 2026 IndiaBix Current Affairs Gujarati PDF is now available for free! It contains 312 MCQs across 18 categories covering all 31 days of May 2026. Click the download button above or visit t.me/currentadda/20919 directly on Telegram. No login or sign-up required."
  },
  {
    q: "How to download IndiaBix current affairs in Gujarati PDF?",
    a: "You can download the IndiaBix Current Affairs Gujarati translated PDF absolutely free from CurrentAdda. We provide direct Telegram links for months like May 2026, April 2026, March 2026, February 2026, and more without any complicated redirects. Just click the download button below."
  },
  {
    q: "Is IndiaBix Current Affairs Gujarati PDF useful for GPSC & GSSSB?",
    a: "Yes! IndiaBix focuses heavily on National and International MCQs which form the core of GPSC Class 1-2 and GSSSB CCE (Group A/B) General Awareness sections. Our translated PDF makes this high-quality dataset accessible to Gujarati medium students."
  },
  {
    q: "What topics are covered in the IndiaBix Gujarati PDF?",
    a: "The PDF covers categorized MCQs including National News, International Affairs, Sports, Awards, Science & Technology, and Defence — all translated faithfully from standard national sources with detailed Gujarati explanations."
  },
  {
    q: "Where can I get daily IndiaBix Current Affairs in Gujarati?",
    a: "Apart from the monthly PDF compilation, you can practice daily current affairs quizzes mapped from IndiaBix sources straight on the CurrentAdda platform or join our Telegram channel @currentadda for daily updates."
  }
];

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Current Adda – IndiaBix Gujarati PDFs",
  "description": "Download free IndiaBix Current Affairs MCQs translated in Gujarati PDF format for Gujarat competitive exams.",
  "url": "https://currentadda.vercel.app/indiabix-current-affairs-gujarati-pdf",
  "sameAs": ["https://t.me/currentadda"],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQS.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

export default function IndiabixCurrentAffairsPdfPage() {
  return (
    <main lang="gu" className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans pb-32 gujarati-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* Header Sticky */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-indigo-50 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-indigo-700" />
            </Link>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                IndiaBix Gujarati
              </h1>
            </div>
          </div>
          <a href="https://t.me/currentadda" target="_blank" className="font-bold text-xs bg-indigo-600 text-white px-5 py-2.5 rounded-full hidden sm:flex items-center gap-2 hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
            Join Telegram <Send className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Ultra-Powerful Hero Section */}
      <section className="bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white pt-20 pb-28 px-5 relative overflow-hidden">
        {/* Dynamic Light Rays & Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500 rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-indigo-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-200">
              Highly Requested Format • 100% Free Access
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight tracking-tight">
            IndiaBix Current Affairs <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent italic pr-2">in Gujarati PDF</span>
          </h1>

          <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
             નેશનલ લેવલના <strong>IndiaBix MCQs</strong> હવે સંપૂર્ણ ગુજરાતી ભાષામાં! <br className="hidden sm:block" />
             <span className="text-rose-200">🆕 મે 2026: <strong className="text-white">312 MCQs | 18 Categories | 31 Days</strong></span><br />
             <span className="text-indigo-200">GPSC 1-2, CCE, અને PSI માટે 2026/2025 ની ડાયરેક્ટ PDF ડાઉનલોડ કરો.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <a href="#indiabix-pdf-grid" className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(244,63,94,0.5)] transform hover:-translate-y-1">
              <Download className="w-6 h-6" /> Download Free PDF Now
            </a>
          </div>

          {/* Trust Matrix */}
          <div className="flex justify-center mt-12 flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-10">
            <div className="flex items-center gap-2">
               <Shield className="w-5 h-5 text-indigo-300" />
               <span className="text-sm font-bold text-slate-200">Verified IndiaBix Source</span>
            </div>
            <div className="flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-rose-300" />
               <span className="text-sm font-bold text-slate-200">Fully Translated in Gujarati</span>
            </div>
            <div className="flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-300" />
               <span className="text-sm font-bold text-slate-200">Direct Telegram Links</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation / Intro for AI Overviews */}
      <section className="py-16 px-5 max-w-5xl mx-auto -mt-10 relative z-20">
         <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl shadow-indigo-900/5 border border-indigo-50 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
               <h2 className="text-2xl sm:text-3xl font-black text-[#0f172a] mb-6 leading-tight">
                  <span className="text-indigo-600">IndiaBix Current Affairs Gujarati PDF</span> શા માટે ગુજરાતના ટોપર સ્ટુડન્ટ્સ પસંદ કરે છે?
               </h2>
               <div className="text-slate-600 font-medium leading-relaxed space-y-4">
                  <p>
                     જ્યારે <strong>National and International events</strong> ની વાત આવે ત્યારે <strong>IndiaBix</strong> એ સૌથી વિશ્વસનીય સોર્સ માનવામાં આવે છે. પરંતુ 
                     તે માત્ર ઇંગ્લિશમાં જ ઉપલબ્ધ હોવાથી ગુજરાતી માધ્યમના વિદ્યાર્થીઓને તકલીફ પડતી હતી.
                  </p>
                  <p>
                     <strong>CurrentAdda</strong> એ આ સમસ્યાનું કાયમી સમાધાન લાવ્યું છે! અમે IndiaBix ના તમામ મહત્વપૂર્ણ પ્રશ્નોનું સરળ ગુજરાતીમાં ટ્રાન્સલેટ કરીને એક શાનદાર <strong>Monthly PDF</strong> રજૂ કરી છે. 
                     જે સ્પર્ધકો <em>Indiabix current affairs in gujarati pdf download</em> કરવા માંગે છે તેમના માટે નીચે અમે સીધી ટેલિગ્રામ લિંક્સ આપી છે. 
                     કોઈપણ જાતની જાહેરાતો કે રુકાવટ વગર સીધી જ ફાઇલ સ્માર્ટફોનમાં ઓપન કરી શકાશે.
                  </p>
               </div>
            </div>
            <div className="md:w-1/3 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex-shrink-0 w-full">
               <h3 className="font-black text-indigo-900 mb-4">Highlights</h3>
               <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span className="text-sm font-bold text-slate-700">100% Gujarati Language</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span className="text-sm font-bold text-slate-700">MCQ Format with Explanations</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span className="text-sm font-bold text-slate-700">Completely Free of Cost</span>
                  </li>
                  <li className="flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                     <span className="text-sm font-bold text-slate-700">No Sign-up required</span>
                  </li>
               </ul>
            </div>
         </div>
      </section>

      {/* Main Grid Section */}
      <section id="indiabix-pdf-grid" className="py-20 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">Direct PDF Download Links</h2>
          <p className="text-slate-500 mt-3 font-medium text-lg">Clicking on any month will securely open the official PDF file via our Telegram.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PDF_LIST.map((pdf) => (
            <article key={pdf.id} className="group relative bg-white rounded-[2rem] p-8 border-2 border-slate-100 hover:border-indigo-500 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15)] transition-all duration-300 flex flex-col" itemScope itemType="https://schema.org/DigitalDocument">
              
              {pdf.badge && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black uppercase tracking-wider text-[9px] px-3 py-1.5 rounded-full shadow-lg">
                  {pdf.badge}
                </div>
              )}

              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                 <FileDown className="w-8 h-8" />
              </div>
              
              <h3 itemProp="name" className="text-xl font-black text-[#0f172a] mb-2 leading-tight">
                {pdf.monthEn} <br />
                <span className="text-indigo-600 block mt-1 text-base">{pdf.monthGu}</span>
              </h3>
              
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" /> {pdf.articles}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> {pdf.size}
                </span>
              </div>
              
              <p itemProp="description" className="text-xs text-slate-500 mb-8 flex-grow leading-relaxed font-medium">
                IndiaBix કરંટ અફેર્સ {pdf.monthGu} ની સંપૂર્ણ PDF. 
                ઇન્ટરનેશનલ અને નેશનલ MCQs ગુજરાતીમાં.
              </p>

              <a 
                href={pdf.telegramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full bg-slate-900 group-hover:bg-indigo-600 text-white font-bold px-6 py-4 rounded-xl text-sm text-center transition-all flex justify-center items-center gap-2 group-hover:scale-[1.02] active:scale-95 shadow-md"
                aria-label={`Download ${pdf.monthEn} IndiaBix Gujarati PDF`}
              >
                📥 Download via Telegram
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SEO Value Addition for "IndiaBix current affairs in gujarati pdf download" */}
      <section className="py-20 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-4xl mx-auto px-5 relative z-10 text-center">
           <h2 className="text-2xl sm:text-4xl font-black mb-6 leading-tight">આ PDF માં કયા કયા વિષયો આવરી લેવામાં આવ્યા છે?</h2>
           <p className="text-indigo-200 text-lg mb-12 max-w-2xl mx-auto">
              IndiaBix નું વિશાળ ડોમેન જ્ઞાન હવે એક ક્લિક પર. અમારી PDF નીચે દર્શાવેલ તમામ મુદ્દાઓને ઊંડાણપૂર્વક આવરી લે છે.
           </p>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {[
                { icon: '🌍', t: 'World Events' },
                { icon: '🇮🇳', t: 'National Policy' },
                { icon: '🏆', t: 'Sports & Awards' },
                { icon: '🚀', t: 'ISRO & Science' },
                { icon: '📈', t: 'Indian Economy' },
                { icon: '⚔️', t: 'Defence Ex' },
                { icon: '🤝', t: 'Global Summits' },
                { icon: '💡', t: 'Technology' },
              ].map(s => (
                <div key={s.t} className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/5 hover:bg-white/20 transition">
                   <div className="text-3xl mb-3">{s.icon}</div>
                   <div className="font-bold text-sm tracking-wide">{s.t}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Rich FAQ targeted for AI overview */}
      <section className="py-24 max-w-3xl mx-auto px-5">
         <div className="text-center mb-12">
           <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] mb-4">વારંવાર પૂછાતા પ્રશ્નો (FAQ)</h2>
           <p className="text-slate-500 font-medium">Clear your doubts regarding the translated IndiaBix materials.</p>
         </div>

         <div className="space-y-5">
           {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="font-black text-lg sm:text-xl text-slate-900 mb-3 flex gap-3 items-start">
                   <span className="text-rose-500 mt-1">Q.</span> {faq.q}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium pl-8">
                   {faq.a}
                </p>
              </div>
           ))}
         </div>
      </section>

      {/* Super Footer CTA */}
      <section className="px-5 mb-10 max-w-5xl mx-auto">
         <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-[3rem] p-10 sm:p-16 text-center text-white shadow-2xl shadow-rose-900/20 relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-3xl sm:text-5xl font-black mb-6">Start Your Journey Today!</h2>
               <p className="text-rose-100 text-lg mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join our Telegram family of 10,000+ top aspirants. Get daily PDF updates without ever searching the web again. 
               </p>
               <a href="https://t.me/currentadda" target="_blank" className="inline-flex items-center gap-3 bg-white text-rose-600 hover:bg-slate-50 px-10 py-5 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                  <Send className="w-6 h-6" /> Join @CurrentAdda
               </a>
            </div>
         </div>
      </section>

    </main>
  );
}
