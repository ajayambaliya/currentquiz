
export interface Quiz {
    id: string;
    title: string;
    slug: string;
    date_str: string | null;
    quiz_date: string | null; // Date string from DB
    source_url: string | null;
    created_at: string;
}

export interface Question {
    id: string;
    quiz_id: string;
    q_index: number;
    text: string;
    options: string[]; // Stored as JSONB in DB
    answer: string; // 'A', 'B', 'C', 'D'
    explanation: string | null;
    category: string | null;
    created_at: string;
}

export type QuizWithQuestions = Quiz & {
    questions: Question[];
};
