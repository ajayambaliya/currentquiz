import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  return {
    title: `${decodedCategory} Quiz - Current Affairs in Gujarati | CurrentAdda`,
    description: `Practice ${decodedCategory} multiple choice questions in Gujarati. Important for GPSC, GSSSB, CCE, and other Gujarat government competitive exams.`,
    alternates: {
      canonical: `https://currentadda.vercel.app/categories/${category}`,
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
