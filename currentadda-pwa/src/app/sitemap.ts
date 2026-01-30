import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://currentadda.vercel.app'
    const urls = new Set<string>();

    // Static routes
    const routes = ['', '/subjects', '/leaderboard', '/categories'].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }))

    // 1. Fetch all regular quizzes
    const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

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

    // 2. Fetch all subject quizzes
    const { data: subjectQuizzes } = await supabase
        .from('subject_quizzes')
        .select('*')
        .order('created_at', { ascending: false });

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

    // 3. Handle Unique Categories and their Page Sets (1-5 sets each)
    const uniqueCategories = Array.from(new Set((quizzes || []).map(q => q.category).filter(Boolean)));
    const categoryEntries: MetadataRoute.Sitemap = [];

    uniqueCategories.forEach(cat => {
        const encodedCat = encodeURIComponent(cat as string);
        categoryEntries.push({
            url: `${baseUrl}/categories/${encodedCat}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        });

        for (let i = 1; i <= 5; i++) {
            categoryEntries.push({
                url: `${baseUrl}/categories/${encodedCat}/quiz/${i}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            });
        }
    })

    // 4. Fetch all subjects
    const { data: subjects } = await supabase
        .from('subjects')
        .select('slug, created_at')

    const subjectEntries = (subjects || []).map((s) => ({
        url: `${baseUrl}/subjects/${s.slug}`,
        lastModified: new Date(s.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // 5. Fetch all main topics
    const { data: mainTopics } = await supabase
        .from('main_topics')
        .select('slug, subjects(slug), created_at')

    const mainTopicEntries = (mainTopics || []).map((mt: any) => {
        if (!mt.subjects?.slug) return null;
        return {
            url: `${baseUrl}/subjects/${mt.subjects.slug}/${mt.slug}`,
            lastModified: new Date(mt.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        };
    }).filter(Boolean) as any[];

    // 6. Fetch all sub-topics
    const { data: subTopics } = await supabase
        .from('sub_topics')
        .select('slug, main_topics(slug, subjects(slug)), created_at')

    const subTopicEntries = (subTopics || []).map((st: any) => {
        const sSlug = st.main_topics?.subjects?.slug;
        const mSlug = st.main_topics?.slug;
        if (!sSlug || !mSlug) return null;
        return {
            url: `${baseUrl}/subjects/${sSlug}/${mSlug}/${st.slug}`,
            lastModified: new Date(st.created_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        };
    }).filter(Boolean) as any[];

    return [
        ...routes,
        ...quizEntries,
        ...subjectQuizEntries,
        ...categoryEntries,
        ...subjectEntries,
        ...mainTopicEntries,
        ...subTopicEntries,
    ]
}
