'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
    Check, ChevronLeft, ChevronRight, X, Trophy, HelpCircle,
    Loader2, BookOpen, ExternalLink, RotateCcw, Grid3x3,
    Flame, Star, Award, Target, Sparkles, Home, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

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
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [showReviewGrid, setShowReviewGrid] = useState(false);
    const [streakData, setStreakData] = useState<{ oldStreak: number; newStreak: number } | null>(null);

    const x = useMotionValue(0);
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

    // Celebrate high scores when results are shown
    useEffect(() => {
        if (showResults) {
            const score = calculateScore();
            const percentage = Math.round((score / totalQuestions) * 100);
            celebrateHighScore(percentage);
        }
    }, [showResults]);

    const currentQuestion = questions[currentIdx];
    const totalQuestions = questions.length;
    const progress = totalQuestions > 0 ? ((currentIdx + 1) / totalQuestions) * 100 : 0;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    // Confetti celebration on correct answer
    const celebrateCorrectAnswer = () => {
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#6ee7b7']
        });
    };

    // Celebration for high score
    const celebrateHighScore = (percentage: number) => {
        if (percentage >= 80) {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#fbbf24', '#f59e0b', '#d97706']
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#fbbf24', '#f59e0b', '#d97706']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    };

    if (totalQuestions === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl space-y-4 border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                        <BookOpen className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-bold gujarati-text">આ ક્વિઝમાં હજી કોઈ પ્રશ્નો નથી.</p>
                    <Link href="/" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                        પાછા જાઓ
                    </Link>
                </div>
            </div>
        );
    }

    const handleSelect = (option: string) => {
        if (isSubmitted && !reviewMode) return;
        if (reviewMode) return;

        const wasCorrect = selectedAnswers[currentIdx] === currentQuestion.answer;
        setSelectedAnswers({ ...selectedAnswers, [currentIdx]: option });

        // Celebrate if the new answer is correct and wasn't correct before
        if (!wasCorrect && option === currentQuestion.answer) {
            celebrateCorrectAnswer();
        }
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.answer) score++;
        });
        return score;
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        if (info.offset.x > threshold && currentIdx > 0) {
            prevQuestion();
        } else if (info.offset.x < -threshold && currentIdx < totalQuestions - 1) {
            nextQuestion();
        }
    };

    const nextQuestion = async () => {
        if (currentIdx < totalQuestions - 1) {
            setCurrentIdx(currentIdx + 1);
        } else if (!isSubmitted) {
            setIsSubmitted(true);
            const streakInfo = await saveScore();
            setStreakData(streakInfo);
            setShowResults(true);
        }
    };

    const prevQuestion = () => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        }
    };

    const jumpToQuestion = (index: number) => {
        setCurrentIdx(index);
        setShowReviewGrid(false);
    };

    const saveScore = async (): Promise<{ oldStreak: number; newStreak: number }> => {
        if (!user) return { oldStreak: 0, newStreak: 0 };

        const score = calculateScore();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isDailyQuiz = uuidRegex.test(quiz.id);

        try {
            if (isDailyQuiz) {
                const { data: existingScore } = await supabase
                    .from('scores')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('quiz_id', quiz.id)
                    .single();

                if (existingScore) return { oldStreak: 0, newStreak: 0 };
            }

            await supabase.from('scores').insert({
                user_id: user.id,
                quiz_id: isDailyQuiz ? quiz.id : null,
                score: score,
                total_questions: totalQuestions,
                category: quiz.category || 'General'
            });

            const streakInfo = await updateStreak(user.id);
            return streakInfo;
        } catch (err) {
            console.error('Error saving score/streak:', err);
            return { oldStreak: 0, newStreak: 0 };
        }
    };

    const updateStreak = async (userId: string): Promise<{ oldStreak: number; newStreak: number }> => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('streak_count, last_active_at')
                .eq('id', userId)
                .single();

            if (!profile) return { oldStreak: 0, newStreak: 0 };

            const now = new Date();
            const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : null;
            const oldStreak = profile.streak_count || 0;
            let newStreak = oldStreak;

            if (!lastActive) {
                newStreak = 1;
            } else {
                const diffInMs = now.getTime() - lastActive.getTime();
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                if (now.toDateString() === lastActive.toDateString()) {
                    // Same day, don't increment
                } else if (diffInDays === 1 || (diffInDays === 0 && now.getDate() !== lastActive.getDate())) {
                    newStreak += 1;
                } else {
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

            return { oldStreak, newStreak };
        } catch (err) {
            console.error('Streak update failed:', err);
            return { oldStreak: 0, newStreak: 0 };
        }
    };

    const getPerformanceBadge = (percentage: number) => {
        if (percentage >= 90) return { label: 'Outstanding', color: 'from-yellow-400 to-orange-500', icon: Trophy };
        if (percentage >= 80) return { label: 'Excellent', color: 'from-green-400 to-emerald-500', icon: Award };
        if (percentage >= 70) return { label: 'Good Job', color: 'from-blue-400 to-indigo-500', icon: Target };
        if (percentage >= 50) return { label: 'Keep Going', color: 'from-purple-400 to-pink-500', icon: Star };
        return { label: 'Need Practice', color: 'from-slate-400 to-slate-500', icon: BookOpen };
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="space-y-4 text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-slate-400 font-medium animate-pulse gujarati-text">તૈયાર થઈ રહ્યું છે...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Enhanced Results Screen
    if (showResults) {
        const score = calculateScore();
        const percentage = Math.round((score / totalQuestions) * 100);
        const badge = getPerformanceBadge(percentage);
        const BadgeIcon = badge.icon;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-5 flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-[3rem] shadow-2xl text-center w-full max-w-lg space-y-6 border border-slate-100 relative overflow-hidden"
                >
                    {/* Top Gradient Bar */}
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${badge.color}`} />

                    {/* Streak Celebration */}
                    {streakData && streakData.newStreak > streakData.oldStreak && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute top-4 right-4 bg-gradient-to-br from-orange-400 to-red-500 p-3 rounded-2xl shadow-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-white fill-white" />
                                <div className="text-left">
                                    <div className="text-xs font-black text-white/80 uppercase tracking-wide">Streak</div>
                                    <div className="text-lg font-black text-white leading-none">{streakData.newStreak} Days!</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Badge and Title */}
                    <div className="space-y-4 pt-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`bg-gradient-to-br ${badge.color} w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl`}
                        >
                            <BadgeIcon className="w-12 h-12 text-white" />
                        </motion.div>
                        <div className="space-y-2">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-slate-900"
                            >
                                {badge.label}!
                            </motion.h2>
                            <p className="text-slate-500 font-bold text-sm gujarati-text">તમે ક્વિઝ પૂર્ણ કરી છે</p>
                        </div>
                    </div>

                    {/* Animated Score Display */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <div className={`bg-gradient-to-br ${badge.color} p-6 rounded-[2rem] relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/10" />
                            <div className="relative z-10">
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.6, type: "spring" }}
                                    className="block text-5xl font-black text-white mb-1"
                                >
                                    {score}
                                </motion.span>
                                <span className="text-xs font-black text-white/80 uppercase tracking-widest">Correct</span>
                            </div>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-[2rem] relative overflow-hidden">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.7, type: "spring" }}
                                className="block text-5xl font-black text-slate-900 mb-1"
                            >
                                {percentage}%
                            </motion.span>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Accuracy</span>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-3 pt-2"
                    >
                        <button
                            onClick={() => {
                                const text = `🎯 *CurrentAdda Quiz Result*\n\n✅ મારો સ્કોર: ${score}/${totalQuestions} (${percentage}%)\n🏆 ${badge.label}\n📚 ક્વિઝ: ${quiz.title}\n\n🔥 તમે પણ ટ્રાય કરો અને તમારો સ્કોર શેર કરો!\n\n👉 https://currentadda.vercel.app/quiz/${quiz.slug}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Share on WhatsApp
                        </button>
                        <button
                            onClick={() => { setReviewMode(true); setShowResults(false); setCurrentIdx(0); setShowReviewGrid(true); }}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Grid3x3 className="w-5 h-5" />
                            Review Answers
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white text-slate-700 py-3 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Retake
                            </button>
                            <Link
                                href="/"
                                className="bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                Home
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    // Review Grid Overlay
    const ReviewGridOverlay = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setShowReviewGrid(false)}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-[2.5rem] p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Grid3x3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-black text-slate-900">Question Navigator</h3>
                    </div>
                    <button
                        onClick={() => setShowReviewGrid(false)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <XCircle className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((_, idx) => {
                        const isAnswered = selectedAnswers[idx] !== undefined;
                        const isCorrect = selectedAnswers[idx] === questions[idx].answer;
                        const isCurrent = idx === currentIdx;

                        return (
                            <button
                                key={idx}
                                onClick={() => jumpToQuestion(idx)}
                                className={`aspect-square rounded-2xl font-black text-sm transition-all relative
                                    ${isCurrent ? 'ring-4 ring-indigo-300 scale-110' : ''}
                                    ${!isAnswered ? 'bg-slate-100 text-slate-400' : ''}
                                    ${isAnswered && isCorrect ? 'bg-emerald-500 text-white' : ''}
                                    ${isAnswered && !isCorrect ? 'bg-rose-500 text-white' : ''}
                                `}
                            >
                                {idx + 1}
                                {isAnswered && isCorrect && (
                                    <Check className="w-3 h-3 absolute top-1 right-1" />
                                )}
                                {isAnswered && !isCorrect && (
                                    <X className="w-3 h-3 absolute top-1 right-1" />
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-6 flex items-center justify-around text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-emerald-500" />
                        <span className="text-slate-600">Correct</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-rose-500" />
                        <span className="text-slate-600">Wrong</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-md bg-slate-100" />
                        <span className="text-slate-600">Unanswered</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    return (
        <div className="min-h-[100dvh] bg-white max-w-2xl mx-auto flex flex-col relative">
            {/* Question Navigator Dots */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-center gap-1 overflow-x-auto no-scrollbar">
                {questions.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] !== undefined;
                    const isCorrect = selectedAnswers[idx] === questions[idx].answer;
                    const isCurrent = idx === currentIdx;

                    return (
                        <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`flex-shrink-0 transition-all ${isCurrent ? 'w-8 h-2' : 'w-2 h-2'
                                } rounded-full ${!isAnswered ? 'bg-slate-200' :
                                    isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                        />
                    );
                })}
            </div>

            {/* Circular Progress Header */}
            <header className="px-5 py-3 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-xl sticky top-0 z-20">
                <Link href="/" className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </Link>

                <div className="flex-1 px-4 flex items-center gap-4">
                    {/* Circular Progress */}
                    <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-slate-100"
                            />
                            <motion.circle
                                cx="28"
                                cy="28"
                                r="24"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                                className="text-indigo-600"
                                strokeLinecap="round"
                                initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - progress / 100) }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-black text-slate-900">{currentIdx + 1}</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {quiz.title.length > 30 ? quiz.title.substring(0, 30) + '...' : quiz.title}
                        </div>
                        <div className="text-xs font-bold text-indigo-600">
                            Question {currentIdx + 1} of {totalQuestions}
                        </div>
                    </div>
                </div>

                {reviewMode && (
                    <button
                        onClick={() => setShowReviewGrid(true)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                        <Grid3x3 className="w-5 h-5" />
                    </button>
                )}
            </header>

            {/* Question Section with Swipe */}
            <main className="flex-1 p-5 space-y-6 overflow-y-auto pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIdx}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        style={{ x, opacity }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                    Question {currentIdx + 1}
                                </span>
                                {reviewMode && (
                                    <span className="inline-block px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                        Review Mode
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 leading-snug gujarati-text">
                                {currentQuestion.text}
                            </h2>
                        </div>

                        <div className="grid gap-3">
                            {Object.entries(currentQuestion.options).map(([label, text]) => {
                                const isSelected = selectedAnswers[currentIdx] === label;
                                const isCorrect = (isSubmitted || reviewMode) && label === currentQuestion.answer;
                                const isWrong = (isSubmitted || reviewMode) && isSelected && label !== currentQuestion.answer;

                                return (
                                    <motion.button
                                        key={label}
                                        onClick={() => handleSelect(label)}
                                        disabled={isSubmitted && !reviewMode}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group
                                            ${isSelected && !isCorrect && !isWrong ? 'border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200'}
                                            ${isCorrect ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-100' : ''}
                                            ${isWrong ? 'border-rose-500 bg-rose-50/50 shadow-lg shadow-rose-100' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all
                                                ${isSelected && !isCorrect && !isWrong ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-100 text-slate-500'}
                                                ${isCorrect ? 'bg-emerald-500 text-white scale-110' : ''}
                                                ${isWrong ? 'bg-rose-500 text-white scale-110' : ''}
                                            `}>
                                                {label}
                                            </span>
                                            <span className={`font-semibold gujarati-text text-sm ${isSelected || isCorrect ? 'text-slate-900' : 'text-slate-600'
                                                }`}>
                                                {text}
                                            </span>
                                        </div>

                                        <div className="shrink-0">
                                            {isCorrect && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    <Check className="w-5 h-5 text-emerald-600" />
                                                </motion.div>
                                            )}
                                            {isWrong && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    <X className="w-5 h-5 text-rose-600" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {(isSubmitted || reviewMode) && currentQuestion.explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 rounded-2xl border border-slate-100 space-y-3"
                            >
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <HelpCircle className="w-4 h-4" />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Explanation</span>
                                </div>
                                <div className="text-sm text-slate-700 leading-relaxed gujarati-text">
                                    {currentQuestion.explanation.split('•').map((part, index) => (
                                        part.trim() && (
                                            <p key={index} className="mb-2 last:mb-0">
                                                {index > 0 && <span className="mr-2 font-bold text-indigo-500">•</span>}
                                                {part.trim()}
                                            </p>
                                        )
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className="p-5 pb-6 border-t border-slate-100 bg-white/95 backdrop-blur-xl fixed bottom-0 max-w-2xl w-full z-20">
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevQuestion}
                        disabled={currentIdx === 0}
                        className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl disabled:opacity-30 hover:bg-slate-200 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextQuestion}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg
                            ${currentIdx === totalQuestions - 1 && !isSubmitted
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-200'
                                : 'bg-slate-900 text-white shadow-slate-200'
                            }
                            ${reviewMode && currentIdx === totalQuestions - 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200' : ''}
                        `}
                    >
                        {currentIdx === totalQuestions - 1
                            ? (isSubmitted && !reviewMode ? 'View Results' : (reviewMode ? 'Finish Review' : 'Submit Quiz'))
                            : 'Next Question'
                        }
                        {!reviewMode && <ChevronRight className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setShowReviewGrid(true)}
                        className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all active:scale-95"
                    >
                        <Grid3x3 className="w-6 h-6" />
                    </button>
                </div>
            </footer>

            {/* Review Grid Modal */}
            <AnimatePresence>
                {showReviewGrid && <ReviewGridOverlay />}
            </AnimatePresence>
        </div>
    );
}
