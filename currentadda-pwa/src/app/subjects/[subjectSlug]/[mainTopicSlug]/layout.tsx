import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateAuthorSchema } from '@/lib/seo-brain';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ subjectSlug: string, mainTopicSlug: string }> }): Promise<Metadata> {
    const { mainTopicSlug, subjectSlug } = await params;

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
        alternates: {
            canonical: `/subjects/${subjectSlug}/${mainTopicSlug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/subjects/${subjectSlug}/${mainTopicSlug}`,
        }
    };
}

export default async function MainTopicLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subjectSlug: string, mainTopicSlug: string }>;
}) {
    const { subjectSlug, mainTopicSlug } = await params;

    const { data: topicData } = await supabase
        .from('main_topics')
        .select('name, subjects(name)')
        .eq('slug', mainTopicSlug)
        .single();

    const topic = topicData as any;
    const subjectName = topic?.subjects?.name || 'Subject';

    const breadcrumbs = [
        { name: 'Home', item: '/' },
        { name: 'Subjects', item: '/subjects' },
        { name: subjectName, item: `/subjects/${subjectSlug}` },
        { name: topic?.name || 'Topic', item: `/subjects/${subjectSlug}/${mainTopicSlug}` }
    ];

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((b, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": b.name,
            "item": `https://currentadda.vercel.app${b.item}`
        }))
    };

    const authorSchema = generateAuthorSchema();

    return (
        <div className="max-w-xl mx-auto px-5 py-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
            />
            <Breadcrumbs items={breadcrumbs} />
            {children}
        </div>
    );
}
