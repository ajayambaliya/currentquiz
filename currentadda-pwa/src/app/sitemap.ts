import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://currentadda.vercel.app'
    const urls = new Set<string>();

    // 1. Fetch all regular quizzes
    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('slug, created_at')

    const quizEntries = (quizzes || []).map((q) => {
        const url = `${baseUrl}/quiz/${q.slug}`;
        urls.add(url);
        return {
            url,
            lastModified: new Date(q.created_at || new Date()),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        };
    })

    // 2. Fetch all subject quizzes (only add if slug is unique)
    const { data: subjectQuizzes } = await supabase
        .from('subject_quizzes')
        .select('slug, created_at')

    const subjectQuizEntries: MetadataRoute.Sitemap = [];
    (subjectQuizzes || []).forEach((q) => {
        const url = `${baseUrl}/quiz/${q.slug}`;
        if (!urls.has(url)) {
            urls.add(url);
            subjectQuizEntries.push({
                url,
                lastModified: new Date(q.created_at || new Date()),
                changeFrequency: 'monthly' as const,
                priority: 0.8,
            });
        }
    })

    // 3. Fetch all subjects
    const { data: subjects } = await supabase
        .from('subjects')
        .select('slug, created_at')

    const subjectEntries = (subjects || []).map((s) => ({
        url: `${baseUrl}/subjects/${s.slug}`,
        lastModified: new Date(s.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // 4. Fetch all main topics
    const { data: mainTopics } = await supabase
        .from('main_topics')
        .select('slug, subjects(slug), created_at')

    const mainTopicEntries = (mainTopics || []).map((mt: any) => ({
        url: `${baseUrl}/subjects/${mt.subjects.slug}/${mt.slug}`,
        lastModified: new Date(mt.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    // Static routes
    const routes = ['', '/subjects', '/leaderboard', '/categories'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }))

    return [
        ...routes,
        ...subjectEntries,
        ...mainTopicEntries,
        ...quizEntries,
        ...subjectQuizEntries,
    ]
}
