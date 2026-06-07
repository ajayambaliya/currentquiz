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
  Users2
} from 'lucide-react';

// SEO Meta Data
export const metadata: Metadata = {
  title: 'Current Affairs in Gujarati PDF May 2026 | GPSC UPSC | VisionIAS Gujarati | કરંટ અફેર્સ',
  description: 'મે 2026 ગુજરાતી કરંટ અફેર્સ PDF – 265 Articles, 15 Categories. VisionIAS-level quality, Gujarati language. Free PDF download for GPSC, UPSC, Talati, PSI. Oct 2025 to May 2026. Download directly from Telegram.',
  keywords: 'May 2026 Current Affairs in Gujarati PDF, May 2026 Current Affairs MCQ PDF, current affairs in gujarati, current affairs gujarati, current affairs 2026 in gujarati, current affairs 2026 questions and answers in gujarati, April 2026 Current Affairs in Gujarati PDF, VisionIAS Current Affairs Gujarati, GPSC Current Affairs Gujarati, ગુજરાતી કરંટ અફેર્સ, Monthly Current Affairs Gujarati PDF, UPSC Gujarati Notes, Current Affairs PDF Download Gujarati 2025 2026, મે 2026 ગુજરાતી PDF',
  openGraph: {
    title: 'May 2026 Gujarati Current Affairs PDF – 265 Articles | GPSC/UPSC Ready',
    description: 'મે 2026 – 265 Articles, 15 Categories. VisionIAS quality in Gujarati. Free Download on Telegram.',
    url: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
    type: 'website',
  },
  alternates: {
    canonical: 'https://currentadda.vercel.app/current-affairs-pdf-gujarati',
  }
};

export const revalidate = 86400;

// Data Definitions
const PDF_LIST = [
  {
    id: 'may-2026',
    monthEn: 'May 2026',
    monthGu: 'મે 2026',
    articles: '265 Articles',
    size: '15 Categories',
    telegramUrl: 'https://t.me/currentadda/20920',
    isNew: true,
  },
  {
    id: 'may-2026-mcq',
    monthEn: 'May 2026 MCQ',
    monthGu: 'મે 2026 MCQ',
    articles: '312 MCQs',
    size: '18 Categories',
    telegramUrl: 'https://t.me/currentadda/20919',
    isNew: true,
  },
  {
    id: 'apr-2026',
    monthEn: 'April 2026',
    monthGu: 'એપ્રિલ 2026',
    articles: '271 Articles',
    size: '60+ MB',
    telegramUrl: 'https://t.me/currentadda/20866',
    isNew: false,
  },
  {
    id: 'apr-2026-mcq',
    monthEn: 'April 2026 MCQ',
    monthGu: 'એપ્રિલ 2026 MCQ',
    articles: '300+ MCQs',
    size: '10+ MB',
    telegramUrl: 'https://t.me/currentadda/20867',
    isNew: false,
  },
  {
    id: 'mar-2026',
    monthEn: 'March 2026',
    monthGu: 'માર્ચ 2026',
    articles: '227 Articles',
    size: '59.38 MB',
    telegramUrl: 'https://t.me/currentadda/20718',
    isNew: false,
  },
  {
    id: 'feb-2026',
    monthEn: 'February 2026',
    monthGu: 'ફેબ્રુઆરી 2026',
    articles: '224+ Articles',
    size: '58+ MB',
    telegramUrl: 'https://t.me/currentadda/20529',
    isNew: false,
  },
  {
    id: 'jan-2026',
    monthEn: 'January 2026',
    monthGu: 'જાન્યુઆરી 2026',
    articles: '224 Articles',
    size: '58.89 MB',
    telegramUrl: 'https://t.me/currentadda/20733',
    isNew: false,
  },
  {
    id: 'dec-2025',
    monthEn: 'December 2025',
    monthGu: 'ડિસેમ્બર 2025',
    articles: '162 Articles',
    size: '46.11 MB',
    telegramUrl: 'https://t.me/currentadda/20733',
    isNew: false,
  },
  {
    id: 'nov-2025',
    monthEn: 'November 2025',
    monthGu: 'નવેમ્બર 2025',
    articles: '224 Articles',
    size: '58.88 MB',
    telegramUrl: 'https://t.me/currentadda/20734',
    isNew: false,
  },
  {
    id: 'oct-2025',
    monthEn: 'October 2025',
    monthGu: 'ઓક્ટોબર 2025',
    articles: '224 Articles',
    size: '58.86 MB',
    telegramUrl: 'https://t.me/currentadda/20735',
    isNew: false,
  },
];

const CATEGORIES = [
  { icon: <Landmark className="w-5 h-5 text-[#f4900c]" />, en: 'Economy', gu: 'અર્થતંત્ર', count: '30 per month' },
  { icon: <Globe2 className="w-5 h-5 text-[#f4900c]" />, en: 'International Relations', gu: 'આંતરરાષ્ટ્રીય સંબંધો', count: '30 per month' },
  { icon: <FlaskConical className="w-5 h-5 text-[#f4900c]" />, en: 'Science & Tech', gu: 'વિજ્ઞાન અને ટેકનોલોજી', count: '30 per month' },
  { icon: <Trees className="w-5 h-5 text-[#f4900c]" />, en: 'Environment', gu: 'પર્યાવરણ', count: '29 per month' },
  { icon: <BookMarked className="w-5 h-5 text-[#f4900c]" />, en: 'Polity & Governance', gu: 'રાજનીતિ અને શાસન', count: '30 per month' },
  { icon: <Shield className="w-5 h-5 text-[#f4900c]" />, en: 'Defence & Security', gu: 'સુરક્ષા', count: '16 per month' },
  { icon: <MapPin className="w-5 h-5 text-[#f4900c]" />, en: 'Places in News', gu: 'સમાચારમાં સ્થળો', count: '10 per month' },
  { icon: <ClipboardList className="w-5 h-5 text-[#f4900c]" />, en: 'Schemes in News', gu: 'સમાચારમાં યોજનાઓ', count: '12 per month' },
  { icon: <Users2 className="w-5 h-5 text-[#f4900c]" />, en: 'Social Issues', gu: 'સામાજિક મુદ્દા', count: '29 per month' },
  { icon: <BookOpen className="w-5 h-5 text-[#f4900c]" />, en: 'History & Culture', gu: 'સંસ્કૃતિ અને ઇતિહાસ', count: '18 per month' },
  { icon: <Globe2 className="w-5 h-5 text-[#f4900c]" />, en: 'Geography', gu: 'ભૂગોળ', count: '15 per month' },
  { icon: <Users className="w-5 h-5 text-[#f4900c]" />, en: 'Persons in News', gu: 'સમાચારમાં વ્યક્તિત્વ', count: '20 per month' },
  { icon: <Award className="w-5 h-5 text-[#f4900c]" />, en: 'Awards & Rankings', gu: 'પુરસ્કારો અને ક્રમ', count: '10 per month' },
  { icon: <Trophy className="w-5 h-5 text-[#f4900c]" />, en: 'Sports', gu: 'રમતગમત', count: '12 per month' },
  { icon: <CheckCircle2 className="w-5 h-5 text-[#f4900c]" />, en: 'Ethics & Integrity', gu: 'નૈતિકતા', count: '8 per month' },
];

const EXAMS = [
  {
    titleEn: 'GPSC Current Affairs',
    titleGu: 'GPSC Current Affairs in Gujarati',
    desc: 'GPSC Class 1-2 Prelims અને Mains માટે સંપૂર્ણ exam-oriented coverage. VisionIAS level depth જે competitive advantage આપશે.'
  },
  {
    titleEn: 'UPSC Current Affairs',
    titleGu: 'UPSC Current Affairs in Gujarati',
    desc: 'UPSC CSE aspirants જે ગુજરાતી માધ્યમમાં તૈયારી કરે છે તેમના માટે સર્વશ્રેષ્ઠ source વિચાર્યા વગર.'
  },
  {
    titleEn: 'Talati / Mantri',
    titleGu: 'Talati Current Affairs Gujarati',
    desc: 'તલાટી અને ક્લાર્કની પરીક્ષાઓ માટે જરૂરી સચોટ અને મુદ્દાસર કરંટ અફેર્સ ડેટા.'
  },
  {
    titleEn: 'PSI / ASI / Police',
    titleGu: 'Police Bharti Current Affairs Gujarati',
    desc: 'ગુજરાત પોલીસ ભરતીની લેખિત પરીક્ષા માટે અત્યંત જરૂરી સંરક્ષણ અને ગુજરાતના વર્તમાન પ્રવાહો.'
  },
  {
    titleEn: 'GSSSB Exams',
    titleGu: 'GSSSB Current Affairs Gujarati',
    desc: 'GSSSB CCE (Group A & B) પરીક્ષા માટે MCQs અને સચોટ માહિતી જે સિલેબસ સ્પષ્ટપણે આવરી લે છે.'
  }
];

const FAQS = [
  {
    q: "મે 2026 Current Affairs in Gujarati PDF ક્યાંથી ડાઉનલોડ કરવી?",
    a: "મે 2026 ગુજરાતી કરંટ અફેર્સ PDF Telegram channel @currentadda પર free available છે. VisionIAS-based 265 articles PDF (link: t.me/currentadda/20920) અને 312 MCQ PDF (link: t.me/currentadda/20919) — બંને ઉપર download link આપેલ છે."
  },
  {
    q: "Current Affairs in Gujarati PDF free download ક્યાંથી મળે?",
    a: "Telegram channel @currentadda પર free download available છે. દર મહિને 265+ articles અને 312+ MCQs સાથે professional PDF publish થાય છે."
  },
  {
    q: "VisionIAS Current Affairs Gujarati PDF ક્યાં મળે?",
    a: "VisionIAS-level quality ની Gujarati Current Affairs PDF currentadda.in પર free available છે — same depth, same coverage, Gujarati language માં."
  },
  {
    q: "GPSC exam માટે best current affairs source ક્યો છે?",
    a: "GPSC preparation માટે monthly Gujarati current affairs PDF best છે — 15 categories, 265+ articles, 312+ MCQs, exam-oriented coverage."
  },
  {
    q: "Gujarati Current Affairs PDF ની size કેટલી છે?",
    a: "દર monthly PDF approx. 58–65 MB છે, જેમાં 265+ clean, formatted articles include છે."
  },
  {
    q: "Current Affairs ક્યા categories cover થાય છે?",
    a: "15 categories: રાજનીતિ, આંતરરાષ્ટ્રીય, અર્થતંત્ર, પર્યાવરણ, વિજ્ઞાન/ટેક, સુરક્ષા, સામાજિક, ઇતિહાસ, ભૂગોળ, સ્થળો, યોજનાઓ, વ્યક્તિત્વ, સંસ્કૃતિ, નીતિશાસ્ત્ર, રમતગમત."
  },
  {
    q: "કયા months ની Current Affairs Gujarati PDF available છે?",
    a: "અત્યારે October 2025 થી May 2026 સુધી ના તમામ Current Affairs PDF available છે. દરેક month ની સીધી Telegram link થી ડાઉનલોડ કરી શકો છો."
  }
];

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Current Adda – Gujarati Current Affairs",
  "description": "Gujarati Current Affairs PDF for GPSC UPSC – VisionIAS quality translated content",
  "url": "https://currentadda.vercel.app/current-affairs-pdf-gujarati",
  "sameAs": ["https://t.me/currentadda"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR",
    "description": "Free Gujarati Current Affairs PDF Download"
  }
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

export default function GujaratiCurrentAffairsPdfPage() {
  return (
    <main lang="gu" className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-32 gujarati-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* Header Sticky */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </Link>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-[#1a2744] leading-none">
                CurrentAdda
              </h1>
            </div>
          </div>
          <Link href="https://t.me/currentadda" target="_blank" className="font-bold text-xs bg-[#f4900c]/10 text-[#f4900c] px-4 py-2 rounded-full hidden sm:flex items-center gap-2">
            Join Telegram <Send className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#1a2744] text-white pt-16 pb-20 px-5 relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f4900c] rounded-full blur-[100px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-10" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Freshness Signal */}
          <time dateTime="2026-05-31" className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#f4900c] bg-[#f4900c]/10 px-3 py-1 rounded-full border border-[#f4900c]/20 mb-6">
            🆕 Last Updated: May 2026
          </time>

          <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
            <span className="block mb-2">ગુજરાતી કરંટ અફેર્સ 2025-2026</span>
            <span className="text-2xl sm:text-3xl text-slate-300 font-bold font-serif italic">Current Affairs in Gujarati – GPSC / UPSC Edition</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            VisionIAS-level Current Affairs <br className="hidden sm:block" />
            <span className="font-bold text-white">— હવે સંપૂર્ણ ગુજરાતી ભાષામાં</span>
          </p>

          <div className="flex justify-center mb-10 flex-wrap gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg">✅ VisionIAS Quality</span>
            <span className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg">📚 265+ Articles | 312 MCQs</span>
            <span className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg">📂 15 Categories</span>
            <span className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg text-[#16a34a] bg-[#16a34a]/10">🆓 Free PDF</span>
            <span className="flex items-center gap-2 text-sm font-bold bg-white/10 px-4 py-2 rounded-lg">📱 10,000+ Students</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#pdf-grid" className="w-full sm:w-auto bg-[#f4900c] hover:bg-[#d97c0a] text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#f4900c]/20">
              <Download className="w-5 h-5" /> 📥 Free PDF Download કરો
            </a>
            <a href="https://t.me/currentadda" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
              Join Telegram Channel <Send className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 px-5 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a2744] mb-4">
            VisionIAS Current Affairs Gujarati <br /> <span className="text-[#f4900c]">India's Best, Now In Your Language</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            અમારી Gujarati Current Affairs PDF <strong className="text-[#1a2744]">Vision IAS</strong> ના સ્ત્રોત પર આધારિત છે —
            ભારતની #1 IAS coaching — અને સંપૂર્ણ ગુજરાતી ભાષામાં ઉપલબ્ધ છે.
            GPSC Class 1-2, UPSC CSE, PSI, Talati, GSSSB, અને અન્ય
            competitive exams માટે exam-oriented content. દર મહિને 224+
            important articles, 14 categories, clean PDF format.
            આ Gujarati Current Affairs PDF ખાસ GPSC aspirants માટે design
            કરવામાં આવ્યો છે જેઓ VisionIAS-level preparation Gujarati medium માં ઇચ્છે છે.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                <th className="p-4 font-black text-slate-800">Feature</th>
                <th className="p-4 font-black text-slate-500">Other Sites</th>
                <th className="p-4 font-black text-[#1a2744] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">Current Adda</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100/50">
                <td className="p-4 font-bold text-slate-700">Quality Source</td>
                <td className="p-4 text-slate-500">Unknown / Varied</td>
                <td className="p-4 font-bold text-[#f4900c] bg-[#ffecd0]/30 border-l border-[#f4900c]/20"><span className="text-[#1a2744]">VisionIAS</span> (India's Best)</td>
              </tr>
              <tr className="border-b border-slate-100/50">
                <td className="p-4 font-bold text-slate-700">Language</td>
                <td className="p-4 text-slate-500">Mixed (Guj/Eng)</td>
                <td className="p-4 font-bold text-[#1a2744] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">100% Gujarati</td>
              </tr>
              <tr className="border-b border-slate-100/50">
                <td className="p-4 font-bold text-slate-700">Articles / Month</td>
                <td className="p-4 text-slate-500">50–100 articles</td>
                <td className="p-4 font-black text-[#1a2744] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">271+ Articles</td>
              </tr>
              <tr className="border-b border-slate-100/50">
                <td className="p-4 font-bold text-slate-700">Categories</td>
                <td className="p-4 text-slate-500">5–8 Basic</td>
                <td className="p-4 font-bold text-[#1a2744] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">15 Categories Depth</td>
              </tr>
              <tr className="border-b border-slate-100/50">
                <td className="p-4 font-bold text-slate-700">PDF Depth</td>
                <td className="p-4 text-slate-500">Small summaries</td>
                <td className="p-4 font-bold text-[#1a2744] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">58+ MB Professional</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-slate-700">Cost</td>
                <td className="p-4 text-slate-500">Paid / Partial Free</td>
                <td className="p-4 font-black text-[#16a34a] bg-[#ffecd0]/30 border-l border-[#f4900c]/20">Free</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Monthly PDF Grid */}
      <section id="pdf-grid" className="py-16 bg-[#1a2744]/5 border-y border-[#1a2744]/10">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#1a2744]">Monthly Current Affairs in Gujarati PDF – 2025-2026</h2>
            <p className="text-slate-600 mt-2">Direct Telegram links for the highest quality monthly PDFs available. <strong className="text-[#f4900c]">May 2026 is now live!</strong></p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PDF_LIST.map((pdf) => (
              <article key={pdf.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all group flex flex-col relative ${pdf.isNew ? 'border-[#f4900c]/60 shadow-[#f4900c]/10 shadow-lg ring-1 ring-[#f4900c]/20' : 'border-slate-200 hover:border-[#f4900c]/50 hover:shadow-xl hover:shadow-[#f4900c]/5'}`} itemScope itemType="https://schema.org/DigitalDocument">
                {pdf.isNew && (
                  <div className="absolute -top-3 -right-2 bg-[#f4900c] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-[#f4900c]/30 animate-pulse">
                    🆕 New
                  </div>
                )}
                <div className="inline-block bg-[#1a2744] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full self-start mb-4">
                  {pdf.monthEn}
                </div>
                
                <h3 itemProp="name" className="text-base sm:text-lg font-black text-[#1a2744] mb-3 leading-tight">
                  {pdf.monthEn} Current Affairs in Gujarati PDF <br />
                  <span className="text-[#f4900c] text-sm mt-1 inline-block">{pdf.monthGu} ગુજરાતી કરંટ અફેર્સ</span>
                </h3>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">📚 {pdf.articles}</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">📦 {pdf.size}</span>
                  <span className="text-[10px] font-bold bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded">✅ GPSC Ready</span>
                </div>
                
                <p itemProp="description" className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">
                  {pdf.monthEn} 2025/2026 ના સૌથી important current affairs ગુજરાતી ભાષામાં.
                  GPSC, UPSC, Talati, PSI, GSSSB exam preparation માટે
                  exclusively exam-oriented articles. VisionIAS quality Gujarati PDF free download.
                </p>

                <a 
                  href={pdf.telegramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full bg-[#ffecd0] hover:bg-[#f4900c] text-[#f4900c] hover:text-white border border-[#f4900c]/30 font-bold p-3 rounded-xl text-xs text-center transition-all flex justify-center items-center gap-2 group-hover:bg-[#f4900c] group-hover:text-white"
                  aria-label={`Download ${pdf.monthEn} Current Affairs in Gujarati PDF`}
                >
                  <Download className="w-4 h-4" /> 📥 Download PDF on Telegram
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-5 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a2744]">વિભાગ મુજબ Current Affairs Coverage</h2>
          <p className="text-slate-600 mt-2">Comprehensive 14 category mapping matching the syllabus exactly.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                {cat.icon}
                <div className="font-bold text-[#1a2744] text-sm">
                  {cat.gu} <br />
                  <span className="text-xs font-medium text-slate-500">{(cat.en)}</span>
                </div>
              </div>
              <div className="text-[10px] uppercase font-black tracking-widest text-[#f4900c] mt-3 bg-[#ffecd0]/50 inline-block px-2 py-1 rounded">
                Approx. {cat.count}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Specific Sections */}
      <section className="py-16 bg-[#1a2744] text-white">
        <div className="max-w-4xl mx-auto px-5">
           <h2 className="text-2xl sm:text-3xl font-black text-center mb-12 text-white">Targeted Exam Preparation</h2>
           <div className="grid sm:grid-cols-2 gap-6">
             {EXAMS.map((exam, i) => (
               <div key={i} className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                 <h2 className="text-xl font-bold mb-1 text-[#f4900c]">{exam.titleEn}</h2>
                 <h3 className="text-sm font-medium mb-3 text-slate-300">{exam.titleGu}</h3>
                 <p className="text-sm leading-relaxed text-slate-300 opacity-90">{exam.desc}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 border-y border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#1a2744] mb-2">9</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Months Available</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#1a2744] mb-2">1,550+</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Articles Total</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#1a2744] mb-2">10K+</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Students</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#1a2744] mb-2">15</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Categories</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#1a2744] mb-2 text-[#16a34a]">Free</div>
              <div className="text-xs font-bold text-slate-500 uppercase">Telegram Channel</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-5 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-[#1a2744] text-center mb-10">Students ની Success Stories</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#ffecd0]/30 p-6 rounded-2xl border border-[#f4900c]/20 relative">
            <span className="text-4xl absolute top-4 left-4 opacity-10">❝</span>
            <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 pl-6 pt-2">
              GPSC Class 1-2 Prelims clear થઈ ગઈ. Current Adda ની PDF daily revision
              માટે best છે. 224 articles sufficient છે complete coverage માટે.
            </p>
            <div className="font-black text-[#1a2744] mt-4 pl-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a2744] text-white flex justify-center items-center text-xs">RP</div>
              Rajesh P., <span className="text-slate-500 font-medium">Ahmedabad</span>
            </div>
          </div>
          <div className="bg-[#ffecd0]/30 p-6 rounded-2xl border border-[#f4900c]/20 relative">
            <span className="text-4xl absolute top-4 left-4 opacity-10">❝</span>
            <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 pl-6 pt-2">
              Vision IAS જેટલી quality, ગુજરાતી ભાષામાં — આ combination powerful છે. કોઈ અન્ય platform પાસે આટલું detail analysis નથી.
            </p>
            <div className="font-black text-[#1a2744] mt-4 pl-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f4900c] text-white flex justify-center items-center text-xs">KS</div>
              Kavita S., <span className="text-slate-500 font-medium">Rajkot</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-5">
           <h2 className="text-2xl sm:text-3xl font-black text-[#1a2744] text-center mb-10">વારંવાર પૂછાતા પ્રશ્નો (FAQ)</h2>
           <div className="space-y-4">
             {FAQS.map((faq, i) => (
                <details key={i} className="bg-white border border-slate-200 rounded-2xl group overflow-hidden">
                  <summary className="p-5 font-bold cursor-pointer flex justify-between items-center text-[#1a2744] list-none">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-[#f4900c]" />
                  </summary>
                  <div className="p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#f8fafc]">
                    {faq.a}
                  </div>
                </details>
             ))}
           </div>
        </div>
      </section>

      {/* Footer Text */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-5 text-center pb-32 sm:pb-12 text-sm leading-loose border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          Current Affairs in Gujarati | May 2026 Current Affairs Gujarati PDF | ગુજરાતી કરંટ અફેર્સ | GPSC Current Affairs | UPSC Gujarati Notes | VisionIAS Gujarati PDF | Monthly Current Affairs Gujarati | Current Affairs 2026 in Gujarati | Current Adda
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 sm:hidden z-50 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <a href="#pdf-grid" className="flex-1 bg-[#f4900c] text-white text-xs font-black p-3 rounded-xl flex items-center justify-center gap-1.5 uppercase transition-transform active:scale-95">
           <Download className="w-4 h-4" /> Download PDF
        </a>
        <a href="https://t.me/currentadda" target="_blank" className="flex-1 bg-[#1a2744] text-white text-xs font-black p-3 rounded-xl flex items-center justify-center gap-1.5 uppercase transition-transform active:scale-95">
           <Send className="w-4 h-4" /> Join Telegram
        </a>
      </div>
    </main>
  );
}
