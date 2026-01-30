import { Metadata } from 'next';
import { generateSeoContent } from '@/lib/seo-brain';

export async function generateMetadata({ params }: { params: Promise<{ category: string, setId: string }> }): Promise<Metadata> {
    const { category, setId } = await params;
    const decodedCategory = decodeURIComponent(category);

    const seo = generateSeoContent({
        title: `${decodedCategory} Quiz Set ${setId}`,
        category: decodedCategory
    });

    return {
        title: `${decodedCategory} Practice Quiz Set ${setId} - CurrentAdda`,
        description: seo.description,
        keywords: seo.keywords,
        alternates: {
            canonical: `/categories/${category}/quiz/${setId}`,
        },
        openGraph: {
            title: `${decodedCategory} Set ${setId} - CurrentAdda`,
            description: seo.description,
            url: `https://currentadda.vercel.app/categories/${category}/quiz/${setId}`,
        },
    };
}

export default async function CategoryQuizLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ category: string, setId: string }>;
}) {
    const { category, setId } = await params;
    const decodedCategory = decodeURIComponent(category);

    const seo = generateSeoContent({
        title: `${decodedCategory} Quiz Set ${setId}`,
        category: decodedCategory
    });

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
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": `Set ${setId}`,
                "item": `https://currentadda.vercel.app/categories/${category}/quiz/${setId}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {/* Hidden SEO Intent Block */}
            <div className="sr-only">
                <h2>{decodedCategory} Practice Questions - Set {setId}</h2>
                <div dangerouslySetInnerHTML={{ __html: seo.narrativeHtml }} />
                <p>Solving this set will help you master ${decodedCategory} for upcoming Gujarat state level exams.</p>
            </div>
            {children}
        </>
    );
}
