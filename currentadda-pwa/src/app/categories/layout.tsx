import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Categorized Current Affairs Quizzes - CurrentAdda",
    description: "Explore current affairs quizzes by category: Sports, Technology, Politics, and more in Gujarati for Gujarat competitive exams.",
    keywords: ["Current Affairs Categories", "Gujarati Quiz Topics", "GPSC Category-wise Quiz", "Sports Current Affairs Gujarati"],
};

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
