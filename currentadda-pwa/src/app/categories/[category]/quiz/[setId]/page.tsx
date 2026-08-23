import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { subMonths } from 'date-fns';
import QuizEngine from '@/app/quiz/[slug]/QuizEngine';
import { Metadata } from 'next';
import { getCategorySeo } from '@/lib/category-seo';

interface PageProps {
    params: Promise<{ category: string; setId: string }>;
}

async function getQuizData(categoryName: string, setIdStr: string) {
    const category = decodeURIComponent(categoryName);
    const setId = parseInt(setIdStr);
    const eightMonthsAgo = subMonths(new Date(), 8);

    const setSize = 10;
    const from = (setId - 1) * setSize;
    const to = from + setSize - 1;

    const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .gte('created_at', eightMonthsAgo.toISOString())
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error || !questions || questions.length === 0) {
        return null;
    }

    const quiz = {
        id: `category-${category}-${setId}`,
        title: `${category} Current Affairs - Practice Set ${setId} (Gujarati)`,
        slug: `categories/${categoryName}/quiz/${setIdStr}`,
        category: category
    };

    return { quiz, questions, category, setId };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const p = await params;
    const data = await getQuizData(p.category, p.setId);
    
    if (!data) return { title: 'Quiz Not Found' };

    const seo = getCategorySeo(data.category);
    const title = `${data.category} MCQ Practice Set ${data.setId} in Gujarati | ${data.category} કરંટ અફેર્સ | CurrentAdda`;
    const description = `Practice ${data.category} Current Affairs set ${data.setId} in Gujarati with explanations. Specifically designed for GSSSB CCE, GPSC, and all competitive exams in Gujarat. ${seo?.shortDesc || ''}`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://currentadda.vercel.app/categories/${p.category}/quiz/${p.setId}`,
        },
        openGraph: {
            title,
            description,
            type: 'article',
            url: `https://currentadda.vercel.app/categories/${p.category}/quiz/${p.setId}`,
        }
    };
}

export default async function CategoryQuizPage({ params }: PageProps) {
    const p = await params;
    const data = await getQuizData(p.category, p.setId);

    if (!data) {
        notFound();
    }

    const { quiz, questions, category, setId } = data;
    const seo = getCategorySeo(category);

    // Schema.org logic
    const quizSchema = {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": quiz.title,
        "description": `Interactive practice set ${setId} for ${category} current affairs in Gujarati.`,
        "educationalAlignment": [
            { "@type": "AlignmentObject", "educationalFramework": "GSSSB CCE", "targetName": "Current Affairs" },
            { "@type": "AlignmentObject", "educationalFramework": "GPSC", "targetName": "General Knowledge" }
        ],
        "hasPart": questions.slice(0, 10).map((q, i) => ({
            "@type": "Question",
            "name": q.text,
            "acceptedAnswer": { "@type": "Answer", "text": q.answer }
        }))
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://currentadda.vercel.app" },
            { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://currentadda.vercel.app/categories" },
            { "@type": "ListItem", "position": 3, "name": category, "item": `https://currentadda.vercel.app/categories/${p.category}` },
            { "@type": "ListItem", "position": 4, "name": `Set ${setId}`, "item": `https://currentadda.vercel.app/categories/${p.category}/quiz/${p.setId}` }
        ]
    };

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
            focusQuiz();
            window.addEventListener('load', focusQuiz);
            document.addEventListener('DOMContentLoaded', focusQuiz);
            let attempts = 0;
            const interval = setInterval(() => {
                focusQuiz();
                if (++attempts > 10) clearInterval(interval);
            }, 150);
        })();
    `;

    return (
        <div className="bg-white scroll-smooth pb-20">
            <script dangerouslySetInnerHTML={{ __html: scrollScript }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(quizSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            {/* Hidden for Bots but Snapped for Consistency */}
            <div className="snap-start sr-only" aria-hidden="false">
                <h1>{quiz.title}</h1>
                <p>Preparation questions for {category} in Gujarati (કરંટ અફેર્સ ગુજરાતી).</p>
                {questions.map((q, i) => (
                    <div key={i} className="mb-4">
                        <h2>{i + 1}. {q.text}</h2>
                        <p><strong>Answer:</strong> Option {q.answer}</p>
                        {q.explanation && <p><strong>Explanation:</strong> {q.explanation}</p>}
                    </div>
                ))}
            </div>

            {/* Focused Quiz Engine Viewport */}
            <div id="quiz-focused-section" className="h-[100dvh] overflow-hidden">
                <QuizEngine quiz={quiz as any} questions={questions} />
            </div>

            {/* Bottom area for spacing/future content */}
            <div className="h-20" />
        </div>
    );
}
