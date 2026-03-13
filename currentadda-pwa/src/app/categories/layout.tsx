import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz Categories - Current Affairs in Gujarati | CurrentAdda',
  description: 'Explore 25+ categories of current affairs in Gujarati including Politics, Sports, Science, Economy, and more. Practice MCQs for GPSC and CCE exams.',
  keywords: 'Current Affairs Categories Gujarati, Politics Quiz Gujarati, Sports Current Affairs, Science MCQs Gujarati',
  alternates: {
    canonical: 'https://currentadda.vercel.app/categories',
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
