import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Subject-wise MCQs & Quizzes - CurrentAdda",
    description: "Practice subject-wise current affairs MCQs in Gujarati. Test your knowledge in Politics, History, Science, and more for GPSC and GSSSB exams.",
    keywords: ["Subject-wise Quiz Gujarati", "GPSC MCQs Gujarati", "GSSSB Practice Test", "Current Affairs Topics Gujarati"],
};

export default function SubjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
