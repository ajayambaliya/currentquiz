import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ category: string, setId: string }> }): Promise<Metadata> {
    const { category, setId } = await params;
    const decodedCategory = decodeURIComponent(category);

    const title = `${decodedCategory} Practice Quiz Set ${setId} - CurrentAdda`;
    const description = `Practice set ${setId} of ${decodedCategory} current affairs questions in Gujarati. Improve your accuracy and speed.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/categories/${category}/quiz/${setId}`,
        },
        openGraph: {
            title,
            description,
            url: `https://currentadda.vercel.app/categories/${category}/quiz/${setId}`,
        },
    };
}

export default function CategoryQuizLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
