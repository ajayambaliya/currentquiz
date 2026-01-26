import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ subjectSlug: string }> }): Promise<Metadata> {
    const { subjectSlug } = await params;

    const { data: subject } = await supabase
        .from('subjects')
        .select('name')
        .eq('slug', subjectSlug)
        .single();

    if (!subject) return { title: 'Subject Not Found' };

    const title = `${subject.name} Current Affairs & Quizzes - CurrentAdda`;
    const description = `Practice ${subject.name} MCQs and current affairs in Gujarati. Best study material for GPSC and GSSSB exams on CurrentAdda.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/subjects/${subjectSlug}`,
        },
    };
}

export default function SubjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
