import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateAuthorSchema } from '@/lib/seo-brain';
import Breadcrumbs from '@/components/Breadcrumbs';

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

    const breadcrumbs = [
        { name: 'Home', item: '/' },
        { name: 'Subjects', item: '/subjects' },
        { name: subject?.name || 'Subject', item: `/subjects/${subjectSlug}` }
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
