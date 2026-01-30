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

export default function CategoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
