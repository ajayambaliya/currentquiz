import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://currentadda.vercel.app'
    const urls = new Set<string>();

    // Static routes
    const routes = ['', '/current-affairs-in-gujarati', '/indiabix-current-affairs-gujarati', '/subjects', '/leaderboard', '/categories'].map((route) => ({
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

    // 7. Add Archive routes
    const archiveRoutes: MetadataRoute.Sitemap = [{
        url: `${baseUrl}/archive`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }];

    // Get all unique year-month combos from quizzes for archive sitemap
    const yearMonths = Array.from(new Set((quizzes || []).map(q => {
        const d = new Date(q.quiz_date);
        return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    })));

    yearMonths.forEach(ym => {
        archiveRoutes.push({
            url: `${baseUrl}/archive/${ym}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        });
    });

    // 8. Add Daily text-content pages
    const MONTH_NAMES_MAP: Record<number, string> = {
        0: 'january', 1: 'february', 2: 'march', 3: 'april',
        4: 'may', 5: 'june', 6: 'july', 7: 'august',
        8: 'september', 9: 'october', 10: 'november', 11: 'december',
    };

    const uniqueDates = Array.from(new Set((quizzes || []).map(q => q.quiz_date).filter(Boolean)));
    const dailyEntries = uniqueDates.map(date => ({
        url: `${baseUrl}/daily/${date}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.85,
    }));

    // 9. Add Monthly landing pages for current-affairs-in-gujarati
    const monthlyCAEntries = yearMonths.map(ym => {
        const [yr, mo] = ym.split('/');
        const monthName = MONTH_NAMES_MAP[parseInt(mo) - 1] || 'january';
        return {
            url: `${baseUrl}/current-affairs-in-gujarati/${monthName}-${yr}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        };
    });

    return [
        ...routes,
        ...quizEntries,
        ...subjectQuizEntries,
        ...categoryEntries,
        ...subjectEntries,
        ...mainTopicEntries,
        ...subTopicEntries,
        ...archiveRoutes,
        ...dailyEntries,
        ...monthlyCAEntries,
    ]
}
