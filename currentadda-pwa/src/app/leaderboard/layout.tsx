import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Global Leaderboard - CurrentAdda",
    description: "See the top performers in CurrentAdda Gujarati Current Affairs quizzes. Compete with others and aim for the top rank!",
    alternates: {
        canonical: '/leaderboard',
    },
};

export default function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
