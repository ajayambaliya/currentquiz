import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CurrentAdda | Daily Current Affairs in Gujarati 2026 [ગુજરાતી કરંટ અફેરેસ] - GPSC, GSSSB Quizzes',
  description: 'Top platform for Daily Current Affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી) 2026, GPSC preparation, GSSSB quizzes, and IndiaBIX MCQ in Gujarati translation. Practice daily with our interactive quiz engine.',
  alternates: {
    canonical: 'https://currentadda.vercel.app',
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
        "name": "Current Affairs in Gujarati",
        "url": "https://currentadda.vercel.app/current-affairs-in-gujarati"
      },
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How to get daily current affairs in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda provides updated daily current affairs in Gujarati (કરંટ અફેર્સ ગુજરાતી) with interactive quizzes and detailed explanations for GPSC and GSSSB exams."
        }
      },
      {
        "@type": "Question",
        "name": "Is IndiaBIX current affairs available in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CurrentAdda offers translated and simplified IndiaBIX current affairs in Gujarati, making it easier for local students to practice international and national MCQs."
        }
      },
      {
        "@type": "Question",
        "name": "Best website for GPSC current affairs quizzes?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda is one of the top platforms for GPSC and CCE current affairs preparation with daily streak tracking and a competitive leaderboard."
        }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomeClient initialQuizzes={initialQuizzes} />
    </>
  );
}
