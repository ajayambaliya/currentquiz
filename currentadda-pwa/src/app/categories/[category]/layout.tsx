import { Metadata } from 'next';

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
                "name": "Categories",
                "item": "https://currentadda.vercel.app/categories"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": decodedCategory,
                "item": `https://currentadda.vercel.app/categories/${category}`
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
