import { notFound } from 'next/navigation';
import '@/print.css';
import '@/app/globals.css';

interface PageProps {
    params: Promise<{ fromDate: string; toDate: string }>;
}

// --- Components ---

const PageHeader = ({ title = "", subtitle = "" }) => (
    <div className="page-header">
        <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <span className="font-bold tracking-wide">CurrentAdda Series</span>
        </div>
        {title && (
            <div className="flex items-center gap-2">
                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                <span className="text-brand-orange font-bold">{title}</span>
                {subtitle && <span className="text-gray-400 text-[10px]">{subtitle}</span>}
            </div>
        )}
    </div>
);

const PageFooter = ({ pageNum = 0 }) => (
    <div className="page-footer">
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>Crafted with ❤️ by Ajay Ambaliya</span>
        </div>
        <a href="https://currentadda.vercel.app" target="_blank" className="font-bold text-brand-blue no-underline hover:text-blue-800 transition-colors">
            currentadda.vercel.app
        </a>
        <div className="text-[10px] text-gray-400">
            © 2025 CurrentAdda • Page {pageNum}
        </div>
    </div>
);

const Watermark = () => (
    <div className="watermark">CurrentAdda</div>
);

// --- Data Fetching ---

async function fetchQuestions(fromDate: string, toDate: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    try {
        const res = await fetch(`${baseUrl}/api/questions?from=${fromDate}&to=${toDate}`, {
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (err) {
        return null;
    }
}

// --- Main Page Component ---

export default async function GeneratePage({ params }: PageProps) {
    const { fromDate, toDate } = await params;
    const data = await fetchQuestions(fromDate, toDate);

    if (!data) return <div className="p-10 text-center text-red-600 font-bold">Error loading data. Server might be down.</div>;

    const { questionsType1, questionsType2 } = data;
    const categories = Object.keys(questionsType2 || {});
    const dateStr = `${new Date(fromDate).toLocaleDateString('gu-IN')} - ${new Date(toDate).toLocaleDateString('gu-IN')}`;

    // Helper: Parse Options
    const parseOptions = (options: any) => {
        if (typeof options === 'object' && options !== null) return options;
        if (typeof options === 'string') {
            try { return JSON.parse(options); } catch { return {}; }
        }
        return {};
    };

    // Helper: Question Card (Matches Premium Spec)
    const QuestionCard = ({ question, index }: { question: any, index: number }) => {
        const options = parseOptions(question.options);
        return (
            <div className="question-card mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange to-brand-blue"></div>

                {/* Question Header */}
                <div className="flex gap-4 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center font-bold text-xl border border-orange-100 shadow-sm">
                        {index}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-lg font-bold text-gray-900 leading-snug font-gujarati">
                            {question.text}
                        </h3>
                    </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5 pl-16">
                    {Object.entries(options).map(([key, value]) => {
                        const isCorrect = key === question.answer;
                        return (
                            <div
                                key={key}
                                className={`relative p-3 rounded-lg border flex items-center gap-3 transition-all
                  ${isCorrect
                                        ? 'bg-green-50 border-brand-green text-green-900 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-700'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border transition-colors
                   ${isCorrect ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-50 text-gray-500 border-gray-200'}
                `}>
                                    {key}
                                </div>
                                <span className="text-sm font-medium leading-tight font-gujarati">{value as string}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Explanation Box */}
                <div className="pl-16">
                    <div className="bg-blue-50 border-l-4 border-brand-blue p-4 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-brand-blue text-sm">💡</span>
                            <strong className="text-brand-blue text-[10px] font-black uppercase tracking-widest">Explanation / સમજૂતી</strong>
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed text-justify font-gujarati">
                            {question.explanation || 'No explanation provided.'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    let pageCounter = 1;

    return (
        <div className="print-container bg-gray-100 min-h-screen">

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-50 no-print">
                <button className="print-btn bg-brand-blue hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full shadow-2xl flex items-center gap-3 transform transition hover:-translate-y-1">
                    <span className="text-2xl">🖨️</span>
                    <span>Download PDF</span>
                </button>
            </div>
            <script dangerouslySetInnerHTML={{ __html: `document.querySelector('.print-btn').addEventListener('click', () => window.print());` }} />

            {/* ================= PAGE 1: COVER PAGE ================= */}
            <div className="page p-0 relative overflow-hidden flex flex-col bg-white text-gray-900">
                {/* Decorative Elements - Safely Visible */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-blue-900"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none opacity-60"></div>

                {/* Top Logo Area */}
                <div className="pt-16 pb-8 text-center z-10">
                    <div className="inline-block bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8 border border-orange-200">
                        Premium Edition
                    </div>
                    {/* Logo Image */}
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="CurrentAdda Logo" className="h-24 object-contain drop-shadow-sm" />
                    </div>
                </div>

                {/* Hero Content */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-12 z-10 mt-[-40px]">
                    <h2 className="text-[42px] font-black leading-tight mb-6 text-blue-950 font-gujarati drop-shadow-sm">
                        તમારી GPSC, GSSSB અને તલાટી<br />PSI, Constable પરીક્ષાની સફળતા અહીંથી શરૂ થાય છે!
                    </h2>
                    <p className="text-xl font-medium text-gray-600 mb-12 tracking-wide font-gujarati max-w-2xl">
                        Daily Updated Current Affairs Quiz in Gujarati for Competitive Exams
                    </p>

                    {/* Floating Cards - High Contrast */}
                    <div className="flex gap-6 mb-16">
                        {[
                            { icon: '📅', t1: 'Daily', t2: 'Updates', b: 'border-orange-500' },
                            { icon: '🎯', t1: 'Exam', t2: 'Focused', b: 'border-blue-600' },
                            { icon: '🆓', t1: '100%', t2: 'Free', b: 'border-green-600' }
                        ].map((item, i) => (
                            <div key={i} className={`bg-white text-gray-900 w-[180px] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] transform hover:-translate-y-1 transition-transform border-t-4 ${item.b}`}>
                                <div className="text-4xl mb-3">{item.icon}</div>
                                <div className="font-bold text-lg leading-none text-gray-800">{item.t1}</div>
                                <div className="text-sm font-medium text-gray-400">{item.t2}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pb-16 text-center z-10 px-8">
                    <a
                        href="https://currentadda.vercel.app"
                        target="_blank"
                        className="inline-block bg-blue-900 text-white px-12 py-5 rounded-full text-2xl font-bold shadow-xl mb-8 border-4 border-blue-50 hover:bg-blue-800 transition-colors no-underline"
                    >
                        Join Free Now
                    </a>

                    <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-8 w-full max-w-4xl mx-auto">
                        <div className="text-left">
                            <div className="text-gray-400 text-xs font-mono mb-1 uppercase tracking-wider">Visit Website</div>
                            <a href="https://currentadda.vercel.app" target="_blank" className="text-3xl font-black text-blue-900 hover:text-orange-600 transition-colors no-underline">
                                currentadda.vercel.app
                            </a>
                        </div>
                        {/* QR Code */}
                        <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
                            <img src="/myqr.png" alt="Scan QR" className="w-[100px] h-[100px] object-contain" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= PAGE 2: ABOUT & INTRODUCTION ================= */}
            <div className="page bg-white">
                <PageHeader title="About Us" />

                <div className="mt-12 mb-12 border-b-4 border-brand-orange pb-6">
                    <h1 className="text-4xl font-bold text-brand-orange font-gujarati">CurrentAdda વિશે</h1>
                </div>

                <div className="grid grid-cols-[1.5fr_1fr] gap-12 h-[60%]">
                    <div className="space-y-6 text-lg text-gray-700 leading-relaxed font-gujarati text-justify">
                        <p><span className="text-2xl font-bold text-brand-blue">નમસ્તે! 👋</span> CurrentAdda એ ગુજરાત રાજ્યની સ્પર્ધાત્મક પરીક્ષાઓ માટે બનાવેલ એક અનોખું પ્લેટફોર્મ છે.</p>
                        <p>અમારો મુખ્ય ઉદ્દેશ્ય છે તમને દરરોજ અપડેટેડ કરંટ અફેર્સ પ્રશ્નો પૂરા પાડવા જેથી તમે તમારી પરીક્ષા માટે સારી રીતે તૈયાર થઈ શકો. અમે ખાસ કરીને GPSC, GSSSB, Constable, PSI અને તલાટી જેવી પરીક્ષાઓ પર ધ્યાન કેન્દ્રિત કરીએ છીએ.</p>
                        <p>ગુજરાતી ભાષામાં શ્રેષ્ઠ અને સચોટ માહિતી પૂરી પાડવી એ અમારી પ્રાથમિકતા છે. અમારી ટીમ દરરોજ વિવિધ ન્યૂઝ પેપર્સ અને સોર્સમાંથી માહિતી એકત્રિત કરે છે.</p>
                    </div>

                    <div className="bg-gradient-to-b from-[#E6F2FF] to-white rounded-3xl p-8 border border-blue-100 shadow-sm flex flex-col justify-center gap-8">
                        {[
                            { num: 'Top', lbl: 'Ranked' },
                            { num: '19+', lbl: 'Categories' },
                            { num: '100%', lbl: 'Gujarati' },
                            { num: 'Free', lbl: 'Forever' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-4xl font-black text-brand-blue">{stat.num}</div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mt-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-brand-orange">Why Choose Us?</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                        {['📅 Daily Content', '📚 Organized', '📱 Mobile First', '📊 Tracking'].map((f, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm text-center font-bold text-gray-700 text-sm border border-gray-100">
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                <PageFooter pageNum={++pageCounter} />
            </div>

            {/* ================= PAGE 3: FEATURES ================= */}
            <div className="page bg-white">
                <PageHeader title="Features Layout" />

                <div className="text-center mt-12 mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 font-gujarati">
                        CurrentAdda ની <span className="text-brand-orange border-b-4 border-brand-orange">શક્તિશાળી વિશેષતાઓ</span>
                    </h1>
                    <p className="text-gray-500 font-medium tracking-wide">POWERFUL FEATURES DESIGNED FOR YOUR SUCCESS</p>
                </div>

                <div className="grid grid-cols-2 gap-8 px-4 mb-16">
                    {[
                        { icon: '📅', title: 'Daily Updates', desc: 'નવા પ્રશ્નો દરરોજ સવારે અપડેટ થાય છે', color: 'border-orange-500' },
                        { icon: '🎯', title: 'Exam-Focused', desc: 'GPSC, GSSSB, તલાટી માટે ખાસ તૈયાર કરેલ', color: 'border-blue-600' },
                        { icon: '📚', title: 'Category-Wise', desc: 'Politics, Sports, Science, Tech અલગ વિભાગો', color: 'border-green-600' },
                        { icon: '🆓', title: 'Free Access', desc: 'કોઈ પણ છુપી ફી વગર, સંપૂર્ણ ફ્રી', color: 'border-purple-500' },
                        { icon: '📱', title: 'Mobile Friendly', desc: 'કોઈપણ સમયે, ગમે ત્યાંથી પ્રેક્ટિસ કરો', color: 'border-pink-500' },
                        { icon: '📊', title: 'Progress Tracking', desc: 'તમારી તૈયારીનું મૂલ્યાંકન કરો', color: 'border-yellow-500' }
                    ].map((feature, i) => (
                        <div key={i} className={`bg-white p-6 rounded-2xl shadow-md border-t-4 ${feature.color} hover:shadow-lg transition-shadow`}>
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 font-gujarati">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed font-gujarati">{feature.desc}</p>
                            <div className="mt-4 text-xs font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1">
                                Learn More <span className="text-lg">›</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 text-white rounded-2xl p-8 flex items-center justify-between shadow-2xl">
                    <div>
                        <div className="text-2xl font-bold mb-1 font-gujarati">આજે જ શરૂઆત કરો!</div>
                        <div className="text-gray-400 text-sm">Join thousands of students</div>
                    </div>
                    <div className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg">
                        Start Free Today
                    </div>
                </div>

                <PageFooter pageNum={++pageCounter} />
            </div>

            {/* ================= PAGE 4: HOW IT WORKS ================= */}
            <div className="page bg-[#F0F7FF]">
                <PageHeader title="Getting Started" />

                <div className="text-center mt-12 mb-16">
                    <h1 className="text-4xl font-bold text-brand-blue mb-4 font-gujarati">
                        કેવી રીતે શરૂઆત કરવી?
                    </h1>
                    <div className="w-24 h-1 bg-brand-orange mx-auto rounded-full"></div>
                </div>

                <div className="relative max-w-3xl mx-auto space-y-12">
                    {/* Connecting Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-100 -translate-x-1/2 z-0"></div>

                    {[
                        { id: 1, title: 'Visit Website', desc: <span><a href="https://currentadda.vercel.app" target="_blank" className="underline text-brand-blue">currentadda.vercel.app</a> ખોલો</span>, align: 'left' },
                        { id: 2, title: 'Create Account', desc: 'માત્ર 2 મિનિટમાં રજિસ્ટ્રેશન', align: 'right' },
                        { id: 3, title: 'Choose Category', desc: 'તમારો પસંદગીનો વિષય પસંદ કરો', align: 'left' },
                        { id: 4, title: 'Start Practicing', desc: 'દરરોજ નવા પ્રશ્નો ઉકેલો', align: 'right' }
                    ].map((step) => (
                        <div key={step.id} className={`relative z-10 flex items-center ${step.align === 'left' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                            <div className={`w-1/2 ${step.align === 'left' ? 'pr-12' : 'pl-12'}`}>
                                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:scale-105 transition-transform">
                                    <h3 className="text-xl font-bold text-brand-blue mb-2">{step.title}</h3>
                                    <p className="text-gray-600 font-gujarati">{step.desc}</p>
                                </div>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-white shadow-lg">
                                {step.id}
                            </div>
                            <div className="w-1/2"></div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {['Practice Daily', 'Review Explanations', 'Track Score'].map((tip, i) => (
                        <div key={i} className="bg-white rounded-full py-3 px-6 text-center font-bold text-brand-blue shadow-sm text-sm border border-blue-100">
                            ✨ {tip}
                        </div>
                    ))}
                </div>

                <PageFooter pageNum={++pageCounter} />
            </div>


            {/* ================= PAGE 5: SUCCESS STORIES ================= */}
            <div className="page bg-white">
                <PageHeader title="Reviews" />

                <div className="mt-12 mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 font-gujarati mb-2">સફળતાની વાર્તાઓ</h1>
                    <p className="text-gray-500">What our students say about us</p>
                </div>

                <div className="columns-2 gap-6 space-y-6">
                    {[
                        { name: 'Rahul Patel', role: 'GPSC Aspirant', msg: 'CurrentAdda ની ક્વિઝ રોજ સોલ્વ કરવાથી મારા કોન્ફિડન્સમાં ખૂબ વધારો થયો છે. ખુબ જ સરસ પ્લેટફોર્મ!', bg: 'bg-blue-50' },
                        { name: 'Priya Shah', role: 'Talati Candidate', msg: 'અહીં મળતું કન્ટેન્ટ એકદમ પરીક્ષાલક્ષી છે. બિનજરૂરી માહિતી નથી, જે મને ખૂબ ગમે છે.', bg: 'bg-orange-50' },
                        { name: 'Amit Desai', role: 'GSSSB Student', msg: 'રોજના પ્રશ્નો અને તેની સમજૂતી મને રિવિઝનમાં ખૂબ મદદ કરે છે.', bg: 'bg-green-50' },
                        { name: 'Sneha Joshi', role: 'Exam Cleared', msg: 'Thank you CurrentAdda team for this free initiative.', bg: 'bg-indigo-50' }
                    ].map((testi, i) => (
                        <div key={i} className={`${testi.bg} p-6 rounded-2xl break-inside-avoid mb-6 shadow-sm`}>
                            <div className="flex gap-1 text-yellow-500 mb-3 text-sm">⭐⭐⭐⭐⭐</div>
                            <p className="font-gujarati text-gray-700 italic mb-4 leading-relaxed">"{testi.msg}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 text-xs border">
                                    {testi.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{testi.name}</div>
                                    <div className="text-xs text-gray-500">{testi.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto mb-12 flex justify-center gap-8">
                    <div className="text-center">
                        <div className="text-3xl font-black text-brand-orange">1000+</div>
                        <div className="text-gray-400 text-xs uppercase">Students</div>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-brand-blue">50+</div>
                        <div className="text-gray-400 text-xs uppercase">Daily Qs</div>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-brand-green">100%</div>
                        <div className="text-gray-400 text-xs uppercase">Free</div>
                    </div>
                </div>

                <PageFooter pageNum={++pageCounter} />
            </div>


            {/* ================= QUESTION PAGES (General - Type 1) ================= */}
            {/* Strict 2 Questions Per Page */}
            {questionsType1.length > 0 && Array.from({ length: Math.ceil(questionsType1.length / 2) }).map((_, pageIdx) => {
                const startIdx = pageIdx * 2;
                const chunk = questionsType1.slice(startIdx, startIdx + 2);

                return (
                    <div key={`t1-${pageIdx}`} className="page bg-white">
                        <PageHeader title="General Knowledge" subtitle={dateStr} />
                        <Watermark />

                        <div className="mt-12 space-y-4">
                            {chunk.map((q: any, i: number) => (
                                <QuestionCard key={q.id} question={q} index={startIdx + i + 1} />
                            ))}
                        </div>

                        <PageFooter pageNum={++pageCounter} />
                    </div>
                );
            })}

            {/* ================= QUESTION PAGES (Categories - Type 2) ================= */}
            {/* Strict 2 Questions Per Page */}
            {categories.map((category) => {
                const catQuestions = questionsType2[category];
                // Ensure strictly 2 items per page
                const pagesCount = Math.ceil(catQuestions.length / 2);

                return Array.from({ length: pagesCount }).map((_, pageIdx) => {
                    const startIdx = pageIdx * 2;
                    const chunk = catQuestions.slice(startIdx, startIdx + 2);

                    // Category Icons
                    const icons: Record<string, string> = { Politics: '🏛️', Sports: '🏆', Science: '🔬', Technology: '💻' };
                    const icon = icons[category] || '📌';

                    return (
                        <div key={`${category}-${pageIdx}`} className="page bg-white">
                            <PageHeader title={category} subtitle={dateStr} />
                            <Watermark />

                            {/* Category Intro Header - Compact Version */}
                            {pageIdx === 0 && (
                                <div className="flex items-center gap-3 mb-6 pt-2 border-b pb-2 border-dashed border-gray-200">
                                    <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-red-500 rounded-lg flex items-center justify-center text-lg shadow-sm text-white flex-shrink-0">
                                        {icon}
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{category}</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-brand-blue text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {catQuestions.length} Qs
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 space-y-4">
                                {chunk.map((q: any, i: number) => (
                                    <QuestionCard key={q.id} question={q} index={startIdx + i + 1} />
                                ))}
                            </div>

                            <PageFooter pageNum={++pageCounter} />
                        </div>
                    );
                });
            })}




            {/* ================= PAGE 6: FINAL CTA ================= */}
            <div className="page p-0 relative flex flex-col items-center justify-center bg-blue-50 text-gray-900">
                {/* Decorative Grid - Light Mode */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

                <div className="z-10 text-center w-full max-w-2xl px-8">
                    <h1 className="text-5xl font-black mb-8 leading-tight font-gujarati text-blue-950">
                        તમારી સફળતા માત્ર<br /><span className="text-orange-600">એક ક્લિક</span> દૂર છે!
                    </h1>

                    <div className="bg-white text-gray-900 p-8 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] mx-auto w-full max-w-sm transform hover:scale-105 transition-transform duration-500 mb-8 border border-gray-100">
                        <div className="w-[200px] h-[200px] bg-gray-50 rounded-xl mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-gray-200 p-2">
                            <img src="/myqr.png" alt="Scan QR" className="w-full h-full object-contain" />
                        </div>
                        <a href="https://currentadda.vercel.app" target="_blank" className="text-2xl font-bold mb-1 block hover:text-orange-600 transition-colors no-underline text-blue-900">
                            currentadda.vercel.app
                        </a>
                        <div className="text-sm text-gray-500 font-medium">Scan to join 1000+ students</div>
                    </div>

                    <div className="text-xl font-bold text-gray-600 font-gujarati mb-8">
                        આજે જ જોડાઓ અને આવતી કાલની ક્વિઝ ચૂકશો નહીં!
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        {['Daily Updated', '100% Free', 'Gujarati Medium'].map((tag, i) => (
                            <span key={i} className="bg-white px-4 py-2 rounded-full text-xs font-bold border border-gray-200 text-blue-900 shadow-sm">
                                ✓ {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Final Footer */}
                <div className="absolute bottom-0 w-full bg-white py-4 px-8 flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100">
                    <div>CurrentAdda - Daily Gujarati Current Affairs</div>
                    <div>Crafted with ❤️ by Ajay Ambaliya</div>
                </div>
            </div>

        </div>
    );
}
