import { supabase } from '@/lib/supabase';
import QuizEngine from './QuizEngine';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { generateSeoContent, generateAuthorSchema } from '@/lib/seo-brain';
import Breadcrumbs from '@/components/Breadcrumbs';

async function getQuizData(slug: string) {
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
}

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
            canonical: `/quiz/${slug}`,
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

    return (
        <div className="max-w-xl mx-auto px-5 py-4 min-h-screen pb-32">
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

            <Breadcrumbs items={breadcrumbs} />

            {/* Dynamic SEO Narrative - Visually Hidden */}
            <div className="sr-only">
                <h2>{quiz.title} Analysis by {authorSchema.name}</h2>
                <div dangerouslySetInnerHTML={{ __html: seo.narrativeHtml }} />
                <h3>Study Material Questions</h3>
                {questions?.slice(0, 5).map((q: any, i: number) => (
                    <div key={i}>
                        <h4>{q.text}</h4>
                        <p>{q.explanation || `Answer: ${q.answer}`}</p>
                    </div>
                ))}
            </div>

            <QuizEngine quiz={quiz} questions={questions || []} />

            {/* Related Quizzes Section - Topic Clustering */}
            {related && related.length > 0 && (
                <section className="mt-16 border-t border-slate-100 pt-10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Continue your preparation</h3>
                    <div className="grid gap-3">
                        {related.map((r: any) => (
                            <Link
                                key={r.id}
                                href={`/quiz/${r.slug}`}
                                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all group"
                            >
                                <div className="flex-1 pr-4">
                                    <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors gujarati-text line-clamp-1">
                                        {r.title}
                                    </h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Recommended for you</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-600 transition-all">
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
