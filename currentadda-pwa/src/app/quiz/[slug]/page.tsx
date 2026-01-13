import { supabase } from '../../../lib/supabase';
import QuizEngine from './QuizEngine';
import { notFound } from 'next/navigation';

async function getQuizData(slug: string) {
    // Fetch quiz metadata
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('slug', slug)
        .single();

    if (quizError || !quiz) {
        return null;
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quiz.id)
        .order('q_index', { ascending: true });

    if (questionsError) {
        // Error fetching questions - return null for production
        return null;
    }

    return { quiz, questions };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getQuizData(slug);

    if (!data) {
        notFound();
    }

    return <QuizEngine quiz={data.quiz} questions={data.questions} />;
}
