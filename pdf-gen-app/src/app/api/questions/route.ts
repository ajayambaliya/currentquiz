import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (!fromDate || !toDate) {
        return NextResponse.json(
            { error: 'Both from and to dates are required' },
            { status: 400 }
        );
    }

    try {
        // Fetch all quizzes in the date range
        const { data: quizzes, error: quizError } = await supabase
            .from('quizzes')
            .select('*')
            .gte('quiz_date', fromDate)
            .lte('quiz_date', toDate)
            .order('quiz_date', { ascending: true });

        if (quizError) throw quizError;

        if (!quizzes || quizzes.length === 0) {
            return NextResponse.json({
                quizzes: [],
                questionsType1: [],
                questionsType2: [],
                totalQuestions: 0,
            });
        }

        const quizIds = quizzes.map((q) => q.id);

        // Fetch all questions for these quizzes
        const { data: allQuestions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .in('quiz_id', quizIds)
            .order('created_at', { ascending: true });

        if (questionsError) throw questionsError;

        // Separate questions by type
        // Type 1: category is null or empty
        // Type 2: category has value
        const questionsType1 = allQuestions?.filter((q) => !q.category) || [];
        const questionsType2 = allQuestions?.filter((q) => q.category) || [];

        // Group Type 2 questions by category
        const questionsByCategory: Record<string, any[]> = {};
        questionsType2.forEach((q) => {
            const category = q.category || 'Other';
            if (!questionsByCategory[category]) {
                questionsByCategory[category] = [];
            }
            questionsByCategory[category].push(q);
        });

        return NextResponse.json({
            quizzes,
            questionsType1,
            questionsType2: questionsByCategory,
            totalQuestions: allQuestions?.length || 0,
            dateRange: { from: fromDate, to: toDate },
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}
