import { supabase } from '@/lib/supabase';
import QuizEngine from './QuizEngine';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, FileText, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { generateSeoContent, generateAuthorSchema } from '@/lib/seo-brain';
import Breadcrumbs from '@/components/Breadcrumbs';
import { cache } from 'react';

// Pre-render the 50 most recent quiz pages at build time for better SEO indexing
export async function generateStaticParams() {
    const [{ data: quizzes }, { data: subjectQuizzes }] = await Promise.all([
        supabase.from('quizzes').select('slug').order('created_at', { ascending: false }).limit(50),
        supabase.from('subject_quizzes').select('slug').order('created_at', { ascending: false }).limit(25),
    ]);

    const slugs = new Set<string>();
    (quizzes || []).forEach((q) => slugs.add(q.slug));
    (subjectQuizzes || []).forEach((q) => slugs.add(q.slug));

    return Array.from(slugs).map((slug) => ({ slug }));
}

// Allow on-demand ISR for dynamic slugs not pre-rendered
export const dynamicParams = true;
export const revalidate = 604800; // Revalidate every 7 days (static quizzes rarely change)

const getQuizData = cache(async function getQuizData(slug: string) {
    // 1. Try to find in standard quizzes first
    let { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('slug', slug)
        .single();

    let isSubjectQuiz = false;
    let breadcrumbs: { name: string; item: string }[] = [{ name: 'Home', item: '/' }];

    // 2. If not found, try subject_quizzes
    if (!quiz || quizError) {
        const { data: sQuiz, error: sQuizError } = await supabase
            .from('subject_quizzes')
            .select('*, sub_topics(*, main_topics(*, subjects(*)))')
            .eq('slug', slug)
            .single();

        if (sQuiz) {
            quiz = sQuiz;
            isSubjectQuiz = true;

            // Build Breadcrumbs for Subject Quiz
            const st = sQuiz.sub_topics;
            const mt = st?.main_topics;
            const sub = mt?.subjects;
            breadcrumbs.push(
                { name: 'Subjects', item: '/subjects' },
                { name: sub?.name || 'Subject', item: `/subjects/${sub?.slug}` },
                { name: mt?.name || 'Topic', item: `/subjects/${sub?.slug}/${mt?.slug}` },
                { name: st?.name || 'Set', item: `/subjects/${sub?.slug}/${mt?.slug}/${st?.slug}` }
            );
        } else {
            return null;
        }
    } else {
        // Build Breadcrumbs for Regular Quiz
        breadcrumbs.push(
            { name: 'Categories', item: '/categories' },
            { name: quiz.category || 'General', item: `/categories/${encodeURIComponent(quiz.category || 'General')}` }
        );
    }

    breadcrumbs.push({ name: quiz.title, item: `/quiz/${slug}` });

    // 3. Fetch questions
    const questionTable = isSubjectQuiz ? 'subject_questions' : 'questions';
    const { data: questions } = await supabase
        .from(questionTable)
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('q_index', { ascending: true });

    // 4. Fetch Related Quizzes (Cluster strategy)
    const { data: related } = await supabase
        .from(isSubjectQuiz ? 'subject_quizzes' : 'quizzes')
        .select('id, title, slug, created_at')
        .neq('id', quiz.id)
        .limit(3);

    return { quiz, questions, isSubjectQuiz, breadcrumbs, related };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) return { title: 'Quiz Not Found' };

    const seo = generateSeoContent({
        title: data.quiz.title,
        slug: slug,
        date: data.quiz.quiz_date,
        source_url: data.quiz.source_url,
        category: data.quiz.category,
        questions: data.questions || []
    });

    return {
        title: `${data.quiz.title} - Solutions & Explanations`,
        description: seo.description,
        keywords: seo.keywords,
        alternates: {
            canonical: `https://currentadda.vercel.app/quiz/${slug}`,
        },
        openGraph: {
            title: `${data.quiz.title} - Solutions & Explanations`,
            description: seo.description,
            url: `https://currentadda.vercel.app/quiz/${slug}`,
            type: 'article',
            siteName: 'CurrentAdda',
            locale: 'gu_IN',
        },
    };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) {
        notFound();
    }

    const { quiz, questions, breadcrumbs, related } = data;

    const seo = generateSeoContent({
        title: quiz.title,
        slug: slug,
        date: quiz.quiz_date,
        source_url: quiz.source_url,
        category: quiz.category,
        questions: questions || []
    });

    const authorSchema = generateAuthorSchema();

    // Use a client-side component to handle initial scroll if needed
    // But since this is a server component, we use a simple script for immediate effect
    const scrollScript = `
        (function() {
            function focusQuiz() {
                const quiz = document.getElementById('quiz-focused-section');
                if (quiz) {
                    const rect = quiz.getBoundingClientRect();
                    const absoluteTop = window.pageYOffset + rect.top;
                    window.scrollTo({ top: absoluteTop, behavior: 'auto' });
                }
            }
            // Execute on multiple events to ensure it works after hard refresh
            focusQuiz();
            window.addEventListener('load', focusQuiz);
            document.addEventListener('DOMContentLoaded', focusQuiz);
            
            // Repeat for a few seconds to handle late hydration/layout shifts
            let attempts = 0;
            const interval = setInterval(() => {
                focusQuiz();
                if (++attempts > 10) clearInterval(interval);
            }, 150);
        })();
    `;

    // Build FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": (questions || []).slice(0, 10).map((q: any) => ({
            "@type": "Question",
            "name": q.text,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${q.explanation || `The correct answer is Option ${q.answer}`}. Prepared and verified by Ajay Ambaliya.`
            }
        }))
    };

    // Breadcrumb Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((b, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": b.name,
            "item": `https://currentadda.vercel.app${b.item}`
        }))
    };
    
    // Learning Resource Schema (Crucial for AI Education Search)
    const learningResourceSchema = {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": quiz.title,
        "description": seo.description,
        "learningResourceType": "Quiz",
        "educationalLevel": ["GSSSB", "GPSC", "Gujarat Govt Exams"],
        "author": authorSchema,
        "datePublished": quiz.created_at,
        "inLanguage": "gu-IN",
        "about": {
            "@type": "Thing",
            "name": quiz.category || "Current Affairs"
        }
    };

    return (
        <div className="bg-white scroll-smooth">
            <script dangerouslySetInnerHTML={{ __html: scrollScript }} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema) }}
            />

            {/* Culprit Breadcrumbs: Moved to off-screen absolute to prevent pushing the UI down */}
            <div className="absolute left-0 right-0 -top-8 px-5 z-0 opacity-20 hover:opacity-100 transition-opacity">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            {/* Direct Answer Block (Targeting ChatGPT Search summaries) */}
            <div className="sr-only" aria-hidden="true" id="ai-search-summary">
                <h2>Direct Answers Summary for {quiz.title}</h2>
                <p>{seo.description}</p>
                <ul>
                    {questions?.slice(0, 10).map((q: any, i: number) => (
                        <li key={i}>
                            <strong>Question:</strong> {q.text} 
                            <strong>Answer:</strong> {q.explanation || `The correct answer is Option ${q.answer}`}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Focused: Quiz Content (Self-contained app-like block) */}
            <div id="quiz-focused-section" className="h-[100dvh] max-w-xl mx-auto relative z-10 overflow-hidden bg-white">
                <QuizEngine quiz={quiz} questions={questions || []} />
            </div>

            {/* Below: Study & SEO Material */}
            <div className="snap-start max-w-xl mx-auto px-5 pt-12 pb-32 space-y-12">
                {/* Premium SEO Study Resource Section - Visible to Google + Users */}
                <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-base font-black text-slate-800 uppercase tracking-widest leading-none">
                            Exam Analysis & Resources
                        </h2>
                    </div>
                    
                    <div className="prose prose-slate prose-sm max-w-none mb-8 text-slate-600 font-medium leading-relaxed gujarati-text">
                        <div dangerouslySetInnerHTML={{ __html: seo.narrativeHtml }} />
                    </div>

                    <div className="grid gap-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Key Topics Covered</h3>
                        <div className="flex flex-wrap gap-2">
                            {seo.keywords.slice(0, 5).split(',').map((kw: string) => (
                                <span key={kw} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-indigo-100/50">
                                    {kw.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                             Sample Study Content
                        </h3>
                        <div className="space-y-4">
                            {questions?.slice(0, 3).map((q: any, i: number) => (
                                <div key={i} className="border-b border-white pb-3 last:border-0 last:pb-0">
                                    <h4 className="text-[13px] font-black text-slate-800 gujarati-text mb-1">{q.text}</h4>
                                    <p className="text-[11px] text-slate-500 gujarati-text line-clamp-1">{q.explanation || `The correct answer is Option ${q.answer}`}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {quiz.quiz_date && (
                    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" />
                            Study Notes
                        </h3>
                        <p className="text-xs text-slate-600 font-medium mb-6 gujarati-text leading-relaxed">
                            આ quiz ના તમામ પ્રશ્નો, જવાબો અને વિગતવાર સમજૂતી text format માં વાંચો — revision માટે ઉપયોગી.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Link href={`/daily/${quiz.quiz_date}`} className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:shadow-md transition-all">
                                <FileText className="w-4 h-4" /> Read Daily Notes
                            </Link>
                            <Link href="/current-affairs-in-gujarati" className="inline-flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest hover:text-indigo-600 transition-all">
                                <BookOpen className="w-4 h-4" /> Monthly Compilation
                            </Link>
                        </div>
                    </section>
                )}

                {related && related.length > 0 && (
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 px-1">Continue your preparation</h3>
                        <div className="grid gap-3">
                            {related.map((r: any) => (
                                <Link key={r.id} href={`/quiz/${r.slug}`} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg transition-all group">
                                    <div className="flex-1 pr-4">
                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text line-clamp-1">{r.title}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Recommended quiz</p>
                                    </div>
                                    <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-indigo-600 transition-all">
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
