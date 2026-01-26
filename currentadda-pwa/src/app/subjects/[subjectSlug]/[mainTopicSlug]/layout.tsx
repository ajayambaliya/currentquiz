import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ subjectSlug: string, mainTopicSlug: string }> }): Promise<Metadata> {
    const { mainTopicSlug } = await params;

    const { data: topic } = await supabase
        .from('main_topics')
        .select('name')
        .eq('slug', mainTopicSlug)
        .single();

    if (!topic) return { title: 'Topic Not Found' };

    const title = `${topic.name} MCQs & Current Affairs Gujarati - CurrentAdda`;
    const description = `Practice ${topic.name} specific questions and current affairs quizzes in Gujarati for GPSC, GSSSB and other Gujarat government exams.`;

    return {
        title,
        description,
    };
}

export default function MainTopicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
