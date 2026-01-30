import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

// Server-side fetch needs a standard client or we can use the one from lib (it's safe)
// We create a fresh client here to be explicit about server-side usage, 
// using the publicly available Anon Key which is safe for fetching public quizzes.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Revalidate data every hour to keep the homepage fresh but fast
export const revalidate = 3600;

export default async function HomePage() {
  let initialQuizzes: any[] = [];

  try {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('quiz_date', { ascending: false })
      .range(0, 9); // Fetch first 10 items for the first page

    if (data) {
      initialQuizzes = data;
    }
  } catch (error) {
    console.error('Error fetching initial quizzes on server:', error);
    // Silent fail, client will attempt to fetch or show empty state
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CurrentAdda",
    "url": "https://currentadda.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://currentadda.vercel.app/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const navigationSchema = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "hasPart": [
      {
        "@type": "WebPage",
        "name": "Subject Quizzes",
        "url": "https://currentadda.vercel.app/subjects"
      },
      {
        "@type": "WebPage",
        "name": "Categories",
        "url": "https://currentadda.vercel.app/categories"
      },
      {
        "@type": "WebPage",
        "name": "Leaderboard",
        "url": "https://currentadda.vercel.app/leaderboard"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationSchema) }}
      />
      <HomeClient initialQuizzes={initialQuizzes} />
    </>
  );
}
