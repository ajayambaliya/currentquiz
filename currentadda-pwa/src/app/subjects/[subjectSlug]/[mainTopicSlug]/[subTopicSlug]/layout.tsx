import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ subjectSlug: string, mainTopicSlug: string, subTopicSlug: string }> }): Promise<Metadata> {
    const { subTopicSlug, subjectSlug, mainTopicSlug } = await params;

    const { data: subTopic } = await supabase
        .from('sub_topics')
        .select('name')
        .eq('slug', subTopicSlug)
        .single();

    const title = `${subTopic?.name || 'Practice Set'} - Gujarati Current Affairs - CurrentAdda`;
    const description = `Practice ${subTopic?.name || 'various topics'} in Gujarati. Boost your preparation for upcoming GPSC and GSSSB competitive exams.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/subjects/${subjectSlug}/${mainTopicSlug}/${subTopicSlug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/subjects/${subjectSlug}/${mainTopicSlug}/${subTopicSlug}`,
        },
    };
}

export default function SubTopicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
