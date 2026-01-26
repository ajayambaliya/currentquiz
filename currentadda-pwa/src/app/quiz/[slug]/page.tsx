import { supabase } from '../../../lib/supabase';
import QuizEngine from './QuizEngine';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';

async function getQuizData(slug: string) {
    // 1. Try to find in standard quizzes first
    let { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('slug', slug)
        .single();

    let isSubjectQuiz = false;

    // 2. If not found, try subject_quizzes
    if (!quiz || quizError) {
        const { data: sQuiz, error: sQuizError } = await supabase
            .from('subject_quizzes')
            .select('*')
            .eq('slug', slug)
            .single();

        if (sQuiz) {
            quiz = sQuiz;
            isSubjectQuiz = true;
        } else {
            return null;
        }
    }

    // 3. Fetch questions from the appropriate table
    const questionTable = isSubjectQuiz ? 'subject_questions' : 'questions';
    const { data: questions, error: questionsError } = await supabase
        .from(questionTable)
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('q_index', { ascending: true });

    if (questionsError) return null;

    return { quiz, questions, isSubjectQuiz };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) return { title: 'Quiz Not Found' };

    const title = `${data.quiz.title} - Gujarati Current Affairs Quiz`;
    const description = `Practice ${data.quiz.title} MCQs in Gujarati for competitive exams like GPSC, GSSSB, and Police. Check your score and rank.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://currentadda.vercel.app/quiz/${slug}`,
        },
        twitter: {
            title,
            description,
            card: 'summary_large_image',
        }
    };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) {
        notFound();
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Quiz",
                        "name": data.quiz.title,
                        "description": `Practice ${data.quiz.title} MCQs in Gujarati for competitive exams.`,
                        "educationalAlignment": [
                            {
                                "@type": "AlignmentObject",
                                "alignmentType": "educational level",
                                "targetName": "GPSC, GSSSB, Police Exams"
                            }
                        ],
                        "hasPart": data.questions.map((q: any, index: number) => ({
                            "@type": "Question",
                            "name": `Question ${index + 1}`,
                            "text": q.text,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Check explanation in the app"
                            }
                        }))
                    })
                }}
            />
            <QuizEngine quiz={data.quiz} questions={data.questions || []} />
        </>
    );
}
