import { Metadata } from 'next';
import { generateAuthorSchema } from '@/lib/seo-brain';
import Breadcrumbs from '@/components/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    const title = `${decodedCategory} Current Affairs Quizzes - CurrentAdda`;
    const description = `Practice ${decodedCategory} specific current affairs quizzes in Gujarati. Improve your knowledge for GPSC, GSSSB and other exams.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/categories/${category}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/categories/${category}`,
        },
    };
}

export default async function CategoryLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    const breadcrumbs = [
        { name: 'Home', item: '/' },
        { name: 'Categories', item: '/categories' },
        { name: decodedCategory, item: `/categories/${category}` }
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
