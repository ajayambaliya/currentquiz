'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QuizEngine from '@/app/quiz/[slug]/QuizEngine';
import { Loader2 } from 'lucide-react';
import { subMonths } from 'date-fns';

export default function CategoryQuizPage() {
    const params = useParams();
    const category = decodeURIComponent(params.category as string);
    const setId = parseInt(params.setId as string);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuestions();
    }, [category, setId]);

    async function fetchQuestions() {
        try {
            setLoading(true);
            const eightMonthsAgo = subMonths(new Date(), 8);

            const setSize = 10;
            const from = (setId - 1) * setSize;
            const to = from + setSize - 1;

            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('category', category)
                .gte('created_at', eightMonthsAgo.toISOString())
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            if (!data || data.length === 0) {
                setQuestions([]);
            } else {
                setQuestions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Questions</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        notFound();
    }

    const quiz = {
        id: 'category-quiz', // Placeholder, QuizEngine will handle this
        title: `${category} - Set ${setId}`,
        slug: `category/${encodeURIComponent(category)}/quiz/${setId}`,
        category: category
    };

    return <QuizEngine quiz={quiz as any} questions={questions} />;
}
