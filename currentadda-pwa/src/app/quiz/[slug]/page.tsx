import { supabase } from '../../../lib/supabase';
import QuizEngine from './QuizEngine';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

import { generateSeoContent } from '@/lib/seo-brain';

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

    // 3. Fetch questions from the appropriate table
    const questionTable = isSubjectQuiz ? 'subject_questions' : 'questions';
    const { data: questions, error: questionsError } = await supabase
        .from(questionTable)
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('q_index', { ascending: true });

    if (questionsError) return null;

    return { quiz, questions, isSubjectQuiz, breadcrumbs };
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
        questions: data.questions
    });

    return {
        title: `${data.quiz.title} - Gujarati Current Affairs Quiz`,
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
        twitter: {
            title: data.quiz.title,
            description: seo.description,
            card: 'summary_large_image',
            creator: '@CurrentAdda',
        }
    };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) {
        notFound();
    }

    const { quiz, questions, breadcrumbs } = data;

    const seo = generateSeoContent({
        title: quiz.title,
        slug: slug,
        date: quiz.quiz_date,
        source_url: quiz.source_url,
        category: quiz.category,
        questions: questions
    });

    // Build FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.map((q: any) => ({
            "@type": "Question",
            "name": q.text,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${q.explanation || `Correct Answer is Option ${q.answer}`}. Prepared by CurrentAdda for GPSC/GSSSB exams.`
            }
        }))
    };

    // Build Breadcrumb Schema
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

    // Build Quiz Schema
    const quizSchema = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": quiz.title,
        "description": seo.description,
        "educationalAlignment": [
            {
                "@type": "AlignmentObject",
                "alignmentType": "educational level",
                "targetName": "Gujarat Government Exams (GPSC, GSSSB, Police Bharti)"
            }
        ],
        "hasPart": questions.map((q: any, index: number) => ({
            "@type": "Question",
            "name": `Question ${index + 1}`,
            "text": q.text,
            "suggestedAnswer": Object.entries(q.options || {}).map(([key, val]) => ({
                "@type": "Answer",
                "text": `${key}: ${val}`,
                "position": key.charCodeAt(0) - 64
            })),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": q.answer
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Dynamic SEO Narrative - Visually Hidden */}
            <div className="sr-only">
                <h2>{quiz.title} - Full Analysis</h2>
                <div dangerouslySetInnerHTML={{ __html: seo.narrativeHtml }} />
                <h3>Question Bank Preview</h3>
                {questions.slice(0, 10).map((q: any, i: number) => (
                    <div key={i}>
                        <h4>Q: {q.text}</h4>
                        <p>Ans: {q.explanation || `Option ${q.answer}`}</p>
                    </div>
                ))}
            </div>

            <QuizEngine quiz={quiz} questions={questions || []} />
        </>
    );
}
