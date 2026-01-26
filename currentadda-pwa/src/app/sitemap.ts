import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://currentadda.vercel.app'

    // 1. Fetch all regular quizzes
    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('slug, created_at')

    const quizEntries = (quizzes || []).map((q) => ({
        url: `${baseUrl}/quiz/${q.slug}`,
        lastModified: new Date(q.created_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    // 2. Fetch all subject quizzes
    const { data: subjectQuizzes } = await supabase
        .from('subject_quizzes')
        .select('slug, created_at')

    const subjectQuizEntries = (subjectQuizzes || []).map((q) => ({
        url: `${baseUrl}/quiz/${q.slug}`,
        lastModified: new Date(q.created_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

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
