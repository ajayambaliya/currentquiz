import { Metadata } from 'next';
import { User, Youtube, Twitter, Award, CheckCircle, ShieldCheck, BookCheck, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ajay Ambaliya — Founder, Author & Content Curator | CurrentAdda',
  description: 'Ajay Ambaliya is the founder and chief educational content curator of CurrentAdda, specializing in Gujarat competitive exams (GPSC, GSSSB, CCE, PSI, Talati). Learn about our editorial guidelines, fact-checking methodology and verified sources.',
  alternates: {
    canonical: 'https://currentadda.vercel.app/author',
  },
  openGraph: {
    title: 'Ajay Ambaliya — Founder & Content Curator | CurrentAdda',
    description: 'Educational content expert specializing in Gujarat competitive exams current affairs. Editorial policies and verified fact-checking standards.',
    url: 'https://currentadda.vercel.app/author',
    type: 'profile',
    siteName: 'CurrentAdda',
    locale: 'gu_IN',
  },
};

export default function AuthorPage() {
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://currentadda.vercel.app/#author",
    "name": "Ajay Ambaliya",
    "url": "https://currentadda.vercel.app/author",
    "jobTitle": "Founder & Chief Educational Curator",
    "worksFor": {
      "@type": "EducationalOrganization",
      "name": "CurrentAdda",
      "url": "https://currentadda.vercel.app"
    },
    "sameAs": [
      "https://youtube.com/@ajayambaliya",
      "https://twitter.com/ajayambaliya",
      "https://t.me/currentadda"
    ],
    "description": "Ajay Ambaliya is an educator and content creator specialized in Gujarat government competitive exams preparation (GPSC, GSSSB, CCE, PSI, Talati).",
    "knowsAbout": [
      "Current Affairs in Gujarati",
      "GPSC Exam Preparation",
      "GSSSB CCE Exam Syllabus",
      "Gujarat Government Schemes",
      "Indian Polity & Constitution",
      "General Knowledge & MCQs"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
      { "@type": "ListItem", "position": 2, "name": "Author & Editorial Standards", "item": "https://currentadda.vercel.app/author" }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10" />

          <div className="relative pt-4">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              <User className="w-16 h-16 text-indigo-400" />
            </div>

            <div className="mt-6 space-y-2">
              <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
                Ajay Ambaliya
                <CheckCircle className="w-5 h-5 text-indigo-500 fill-indigo-50" />
              </h1>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full">
                Founder &amp; Educational Content Expert
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-50 pt-8">
            <div>
              <div className="text-lg font-black text-slate-900">10,000+</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Learners</div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">500+</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Quizzes</div>
            </div>
            <div>
              <div className="text-lg font-black text-slate-900">100%</div>
              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Free Educational Access</div>
            </div>
          </div>
        </div>

        {/* About & Mission */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">About &amp; Background</h2>
          </div>

          <div className="text-sm text-slate-600 leading-relaxed space-y-4 gujarati-text font-medium">
            <p>
              અજય અંબાલિયા ગુજરાતની સ્પર્ધાત્મક પરીક્ષાઓ (GPSC Class 1-2, GSSSB CCE, Police Bharti, PSI, Talati) ના તૈયારી ક્ષેત્રે ૨૦૧૯ થી કાર્યરત છે.
              તેઓનું મુખ્ય લક્ષ્ય વિદ્યાર્થીઓને સરળ ભાષામાં, પરીક્ષાલક્ષી અને સચોટ <strong>Current Affairs in Gujarati</strong> અને મોક ટેસ્ટ પૂરું પાડવાનું છે.
            </p>
            <p>
              CurrentAdda પ્લેટફોર્મના માધ્યમથી તેઓ દરરોજ સેંકડો વિદ્યાર્થીઓને તેમની કારકિર્દીના લક્ષ્યો પ્રાપ્ત કરવામાં મદદરૂપ થાય છે.
              અહીં પ્રકાશિત થતા તમામ દૈનિક પ્રશ્નો અને તેની વિગતવાર સમજૂતી પ્રાથમિક સ્ત્રોતોના આધારે ચકાસીને તૈયાર કરવામાં આવે છે.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <a href="https://youtube.com/@ajayambaliya" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all">
              <Youtube className="w-4 h-4" /> YouTube
            </a>
            <a href="https://twitter.com/ajayambaliya" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-sky-50 text-sky-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all">
              <Twitter className="w-4 h-4" /> Twitter
            </a>
          </div>
        </div>

        {/* Editorial Standards & Fact-Checking (E-E-A-T) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Editorial &amp; Verification Methodology</h2>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-medium">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-black text-slate-800 text-sm mb-1 flex items-center gap-2">
                <BookCheck className="w-4 h-4 text-indigo-600" />
                Primary Sources Used
              </h3>
              <p className="text-slate-600">
                અમારા તમામ પ્રશ્નો અને નોટ્સ અધિકૃત સરકારી સ્ત્રોતો જેવા કે <strong>Press Information Bureau (PIB)</strong>, ભારત સરકારના મંત્રાલયો, <strong>ગુજરાત માહિતી ખાતું (Gujarat Information)</strong>, <strong>RBI</strong>, <strong>ISRO</strong>, <strong>DRDO</strong>, <strong>Supreme Court Judgements</strong> અને ઓફિશિયલ સરકારી ગેઝેટ્સના આધારે તૈયાર થાય છે.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-black text-slate-800 text-sm mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Fact-Checking &amp; Update Policy
              </h3>
              <p className="text-slate-600">
                દરેક પ્રશ્ન અને જવાબની ચકાસણી કરવામાં આવે છે. જો કોઈ સરકારી નીતિ કે હોદ્દામાં ફેરફાર થાય તો નોટ્સ તરત અપડેટ કરવામાં આવે છે.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/current-affairs-in-gujarati" className="text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all">
            Explore Current Affairs in Gujarati →
          </Link>
        </div>
      </div>
    </div>
  );
}
