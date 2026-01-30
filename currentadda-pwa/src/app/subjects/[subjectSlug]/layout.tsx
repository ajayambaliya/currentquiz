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
        alternates: {
            canonical: `/subjects/${subjectSlug}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/subjects/${subjectSlug}`,
        },
    };
}

export default async function SubjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ subjectSlug: string }>;
}) {
    const { subjectSlug } = await params;
    const { data: subject } = await supabase
        .from('subjects')
        .select('name')
        .eq('slug', subjectSlug)
        .single();

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://currentadda.vercel.app/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Subjects",
                "item": "https://currentadda.vercel.app/subjects"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": subject?.name || "Subject",
                "item": `https://currentadda.vercel.app/subjects/${subjectSlug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {children}
        </>
    );
}
