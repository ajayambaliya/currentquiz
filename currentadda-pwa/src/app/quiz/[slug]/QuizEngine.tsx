'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, X, Trophy, HelpCircle, Loader2, BookOpen, ExternalLink, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

interface Question {
    id: string;
    text: string;
    options: Record<string, string>;
    answer: string;
    explanation: string;
    q_index: number;
}

interface Quiz {
    id: string;
    title: string;
    slug: string;
    category?: string;
}

export default function QuizEngine({ quiz, questions }: { quiz: Quiz; questions: Question[] }) {
    const { user, loading: authLoading, isVerified } = useAuth();
    const router = useRouter();

    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);

    const currentQuestion = questions[currentIdx];
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    if (totalQuestions === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
                <div className="glass p-10 rounded-[2.5rem] shadow-2xl space-y-4">
                    <p className="text-slate-500 font-medium">આ ક્વિઝમાં હજી કોઈ પ્રશ્નો નથી.</p>
                    <Link href="/" className="inline-block text-indigo-600 font-bold hover:underline">પાછા જાઓ</Link>
                </div>
            </div>
        );
    }

    const handleSelect = (option: string) => {
        if (isSubmitted && !reviewMode) return;
        if (reviewMode) return;
        setSelectedAnswers({ ...selectedAnswers, [currentIdx]: option });
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) score++;
        });
        return score;
    };

    const nextQuestion = async () => {
        if (currentIdx < totalQuestions - 1) {
            setCurrentIdx(currentIdx + 1);
        } else if (!isSubmitted) {
            setIsSubmitted(true);
            await saveScore();
            setShowResults(true);
        }
    };

    const prevQuestion = () => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        }
    };

    const saveScore = async () => {
        if (!user) return;
        const score = calculateScore();

        // Check if quiz.id is a valid UUID before saving (Daily Quizzes)
        // For Category SETS, we still want to save the score but we use a specialized logic or skip duplicate UUID check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isDailyQuiz = uuidRegex.test(quiz.id);

        try {
            if (isDailyQuiz) {
                // Check if score already exists (First Score Logic)
                const { data: existingScore } = await supabase
                    .from('scores')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('quiz_id', quiz.id)
                    .single();

                if (existingScore) return;
            }

            // Save the score
            await supabase.from('scores').insert({
                user_id: user.id,
                quiz_id: isDailyQuiz ? quiz.id : null,
                score: score,
                total_questions: totalQuestions,
                category: quiz.category || 'General'
            });

            // Update Streak Logic
            await updateStreak(user.id);
        } catch (err) {
            console.error('Error saving score/streak:', err);
        }
    };

    const updateStreak = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('streak_count, last_active_at')
                .eq('id', userId)
                .single();

            if (!profile) return;

            const now = new Date();
            const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;

            let newStreak = profile.streak_count || 0;

            if (!lastActive) {
                newStreak = 1;
            } else {
                const diffInMs = now.getTime() - lastActive.getTime();
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                // If last active was today, don't increment
                if (now.toDateString() === lastActive.toDateString()) {
                    // Just update last_active_at below
                }
                // If last active was yesterday, increment
                else if (diffInDays === 1 || (diffInDays === 0 && now.getDate() !== lastActive.getDate())) {
                    newStreak += 1;
                }
                // If more than a day missed, reset
                else {
                    newStreak = 1;
                }
            }

            await supabase
                .from('profiles')
                .update({
                    streak_count: newStreak,
                    last_active_at: now.toISOString()
                })
                .eq('id', userId);

        } catch (err) {
            console.error('Streak update failed:', err);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="space-y-4 text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-400 font-medium animate-pulse">તૈયાર થઈ રહ્યું છે...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Email verification is now disabled - users can access quizzes immediately after signup

    if (showResults) {
        const score = calculateScore();
        const percentage = Math.round((score / totalQuestions) * 100);

        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-10 rounded-[3rem] shadow-2xl text-center w-full max-w-lg space-y-10 border border-slate-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="space-y-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200"
                        >
                            <Trophy className="w-12 h-12 text-white" />
                        </motion.div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-800">ખૂબ સરસ!</h2>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">તમે ક્વિઝ પૂર્ણ કરી છે</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                            <span className="block text-4xl font-black text-indigo-600 mb-1">{score}/{totalQuestions}</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">તમારો સ્કોર</span>
                        </div>
                        <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
                            <span className="block text-4xl font-black text-emerald-600 mb-1">{percentage}%</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">પરિણામ</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => {
                                const text = `🎯 *CurrentAdda Quiz Result*\n\n✅ મારો સ્કોર: ${score}/${totalQuestions} (${percentage}%)\n📚 ક્વિઝ: ${quiz.title}\n\n🔥 તમે પણ ટ્રાય કરો અને તમારો સ્કોર શેર કરો!\n\n👉 https://currentadda.vercel.app/quiz/${quiz.slug}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            વોટ્સએપ પર શેર કરો
                        </button>
                        <button
                            onClick={() => { setReviewMode(true); setShowResults(false); setCurrentIdx(0); }}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
                        >
                            <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            જવાબો તપાસો (Review)
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-slate-700 py-4 rounded-2xl font-bold border-2 border-slate-100 hover:border-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                ફરીથી રમો
                            </button>
                            <Link
                                href="/"
                                className="bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center"
                            >
                                હોમ પેજ
                            </Link>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                        <p className="text-xs font-bold text-slate-400 mb-2">Developed By</p>
                        <Link href="/author" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl group transition-all hover:bg-indigo-50">
                            <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">Ajay Ambaliya</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-400" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-white max-w-2xl mx-auto flex flex-col">
            {/* Quiz Header */}
            <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </Link>
                <div className="flex-1 px-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">Progress</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{currentIdx + 1}/{totalQuestions}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
                {reviewMode && (
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Review</div>
                )}
            </header>

            {/* Question Section */}
            <main className="flex-1 p-5 md:p-8 space-y-6 overflow-y-auto pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                Question {currentIdx + 1}
                            </span>
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-snug gujarati-text tracking-tight">
                                {currentQuestion.text}
                            </h2>
                        </div>

                        <div className="grid gap-3">
                            {Object.entries(currentQuestion.options).map(([label, text]) => {
                                const isSelected = selectedAnswers[currentIdx] === label;
                                const isCorrect = (isSubmitted || reviewMode) && label === currentQuestion.answer;
                                const isWrong = (isSubmitted || reviewMode) && isSelected && label !== currentQuestion.answer;

                                return (
                                    <button
                                        key={label}
                                        onClick={() => handleSelect(label)}
                                        disabled={isSubmitted && !reviewMode}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group overflow-hidden
                                            ${isSelected ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-50 hover:border-indigo-100'}
                                            ${isCorrect ? 'border-emerald-500 bg-emerald-50/30' : ''}
                                            ${isWrong ? 'border-rose-500 bg-rose-50/30' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-colors
                                                ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}
                                                ${isCorrect ? 'bg-emerald-500 text-white' : ''}
                                                ${isWrong ? 'bg-rose-500 text-white' : ''}
                                            `}>
                                                {label}
                                            </span>
                                            <span className={`font-semibold gujarati-text text-base tracking-normal ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                {text}
                                            </span>
                                        </div>

                                        <div className="shrink-0 ml-2">
                                            {isCorrect && <Check className="w-5 h-5 text-emerald-600" />}
                                            {isWrong && <X className="w-5 h-5 text-rose-600" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {(isSubmitted || reviewMode) && currentQuestion.explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-50 p-6 rounded-[1.75rem] border border-slate-100 space-y-3"
                            >
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <HelpCircle className="w-4 h-4" />
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em]">Explanation</span>
                                </div>
                                {currentQuestion.explanation.split('•').map((part, index) => (
                                    part.trim() && (
                                        <p key={index} className="mb-2 last:mb-0 gujarati-text">
                                            {index > 0 && <span className="mr-2 font-bold text-indigo-500">•</span>}
                                            {part.trim()}
                                        </p>
                                    )
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Control */}
            <footer className="p-5 pb-6 border-t border-slate-100 bg-white/95 backdrop-blur-xl fixed bottom-0 max-w-2xl w-full z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevQuestion}
                        disabled={currentIdx === 0}
                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl disabled:opacity-20 hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextQuestion}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2
                            ${currentIdx === totalQuestions - 1 && !isSubmitted
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'bg-slate-900 text-white'
                            }
                            ${reviewMode && currentIdx === totalQuestions - 1 ? 'bg-emerald-600 shadow-lg shadow-emerald-100' : ''}
                        `}
                    >
                        {currentIdx === totalQuestions - 1
                            ? (isSubmitted && !reviewMode ? 'View Result' : (reviewMode ? 'Finished' : 'Submit Quiz'))
                            : 'Next Question'
                        }
                        {!reviewMode && <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </footer>
        </div>
    );
}
