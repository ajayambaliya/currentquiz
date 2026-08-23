import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategorySetsClient from './CategorySetsClient';
import { getCategorySeo, ALL_CATEGORY_NAMES } from '@/lib/category-seo';
import Link from 'next/link';
import { subMonths } from 'date-fns';
import { supabase } from '@/lib/supabase';

export async function generateStaticParams() {
    return ALL_CATEGORY_NAMES.map((cat) => ({ category: cat }));
}

export const dynamicParams = true;
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const name = decodeURIComponent(category);
    const seo = getCategorySeo(name);
    if (!seo) return { title: 'Category Not Found' };

    const title = `${seo.name} Current Affairs in Gujarati 2026 | ${seo.gujaratiName} MCQ | CurrentAdda`;
    const description = seo.shortDesc + ' ' + seo.longDesc.slice(0, 120) + '...';

    return {
        title,
        description,
        keywords: [...seo.keywords, ...seo.gujaratiKeywords],
        alternates: {
            canonical: `https://currentadda.vercel.app/categories/${encodeURIComponent(seo.slug)}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/categories/${encodeURIComponent(seo.slug)}`,
            type: 'website',
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

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-500' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-500' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-500' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', badge: 'bg-fuchsia-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', badge: 'bg-violet-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-500' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', badge: 'bg-pink-500' },
};

export default async function CategorySetsPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const name = decodeURIComponent(category);
    const seo = getCategorySeo(name);

    if (!seo) notFound();

    // Fetch the question count on the server for instant SEO pre-rendering of set links
    let initialCount = 0;
    try {
        const eightMonthsAgo = subMonths(new Date(), 8).toISOString();
        const { count, error } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category', name)
            .gte('created_at', eightMonthsAgo);

        if (!error && count !== null) {
            initialCount = count;
        }
    } catch (err) {
        console.error('Error pre-fetching category question count on server:', err);
    }

    const colors = COLOR_MAP[seo.color] || COLOR_MAP['indigo'];
    const baseUrl = 'https://currentadda.vercel.app';

    // ── Structured Data ─────────────────────────────────────
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: `${baseUrl}/categories` },
            { '@type': 'ListItem', position: 3, name: `${seo.name} Current Affairs`, item: `${baseUrl}/categories/${encodeURIComponent(seo.slug)}` },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seo.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    };

    const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `${seo.name} Current Affairs in Gujarati 2026`,
        description: seo.shortDesc,
        url: `${baseUrl}/categories/${encodeURIComponent(seo.slug)}`,
        inLanguage: ['gu', 'en'],
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumbSchema.itemListElement },
        publisher: {
            '@type': 'Organization',
            name: 'CurrentAdda',
            url: baseUrl,
        },
        dateModified: new Date().toISOString(),
    };

    return (
        <div className="min-h-screen bg-[#fdfdfd]">
            {/* ── JSON-LD ── */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

            {/* ── SSR Hero — Visible to Googlebot + Users ── */}
            <div className={`${colors.bg} border-b ${colors.border}`}>
                <div className="max-w-xl mx-auto px-5 pt-6 pb-8">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        <Link href="/" className="hover:text-indigo-500 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/categories" className="hover:text-indigo-500 transition-colors">Categories</Link>
                        <span>/</span>
                        <span className={`${colors.text} font-black`}>{seo.name}</span>
                    </nav>

                    {/* Title */}
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-4xl" role="img" aria-label={seo.name}>{seo.emoji}</span>
                        <div>
                            <h1 className={`text-2xl font-black text-slate-900 leading-tight`}>
                                {seo.name} Current Affairs in Gujarati 2026
                            </h1>
                            <p className={`text-sm font-bold mt-1 gujarati-text ${colors.text}`}>
                                {seo.gujaratiName} કરંટ અફેર્સ ૨૦૨૬
                                {seo.gujaratiName2 ? ` | ${seo.gujaratiName2}` : ''}
                            </p>
                        </div>
                    </div>

                    {/* Short description */}
                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
                        {seo.longDesc}
                    </p>

                    {/* Gujarati description */}
                    <p className="text-xs text-slate-500 gujarati-text leading-relaxed mb-5">
                        {seo.gujaratiDesc}
                    </p>

                    {/* Exam Badges */}
                    <div className="flex flex-wrap gap-2">
                        {seo.exams.map((exam) => (
                            <span key={exam} className={`text-[10px] font-black uppercase tracking-widest ${colors.bg} ${colors.text} border ${colors.border} px-2.5 py-1 rounded-full`}>
                                {exam}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Interactive Quiz Sets (Client Component) ── */}
            <CategorySetsClient category={name} initialCount={initialCount} />

            {/* ── SEO Rich Content Block ── */}
            <section className="max-w-xl mx-auto px-5 py-10 space-y-10">

                {/* FAQ Section */}
                <div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <span className="text-lg">❓</span>
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {seo.faqs.map((faq, i) => (
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
                </div>

                {/* Keyword Cloud (Hidden visually but SEO-meaningful via aria) */}
                <div className="sr-only" aria-label={`${seo.name} categories and keywords`}>
                    <h3>{seo.name} Current Affairs Keywords</h3>
                    <ul>
                        {[...seo.keywords, ...seo.gujaratiKeywords].map((kw) => (
                            <li key={kw}>{kw}</li>
                        ))}
                    </ul>
                </div>

                {/* Related Categories */}
                <div>
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="text-lg">🔗</span>
                        Related Categories
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {seo.relatedCategories.map((rel) => {
                            const relSeo = getCategorySeo(rel);
                            if (!relSeo) return null;
                            return (
                                <Link
                                    key={rel}
                                    href={`/categories/${encodeURIComponent(rel)}`}
                                    aria-label={`${rel} Current Affairs in Gujarati`}
                                    className="flex flex-col items-center justify-center gap-1 bg-white border border-slate-100 rounded-2xl p-3 hover:border-indigo-200 hover:shadow-md transition-all text-center"
                                >
                                    <span className="text-xl">{relSeo.emoji}</span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider leading-tight">{rel}</span>
                                    <span className="text-[9px] text-slate-400 gujarati-text">{relSeo.gujaratiName}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* About section */}
                <div className={`${colors.bg} border ${colors.border} rounded-3xl p-5`}>
                    <h2 className={`text-sm font-black uppercase tracking-widest ${colors.text} mb-3`}>
                        About {seo.name} Current Affairs
                    </h2>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-2">
                        CurrentAdda provides daily updated <strong>{seo.name} current affairs in Gujarati</strong> for competitive exam preparation.
                        All questions are verified by experts and include detailed explanations in Gujarati.
                    </p>
                    <p className="text-xs text-slate-500 gujarati-text leading-relaxed">
                        {seo.gujaratiName} — CurrentAdda{' '}પર દરરોજ નવા MCQs ઉમેરવામાં આવે છે.{' '}
                        GPSC, GSSSB CCE, PSI, Constable, Talati — તમામ Gujarat Government Exams માટે ઉપયોગી.
                    </p>
                </div>
            </section>
        </div>
    );
}
