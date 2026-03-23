import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Current Affairs in Gujarati 2026 - Best Daily Quiz, Questions & Answers | CurrentAdda',
  description: 'Best Current Affairs in Gujarati 2026 — Daily Current Affairs Questions and Answers (કરંટ અફેર્સ ગુજરાતી). Free MCQs for GSSSB CCE, GPSC, PSI, Constable & Talati. Daily updated quiz with explanations in Gujarati.',
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
        "name": "Current affairs in Gujarati 2026 ક્યાં practice કરવું?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda — Best platform for Current Affairs in Gujarati 2026. Daily updated quizzes, 10,000+ MCQs, live leaderboard, all FREE. Visit currentadda.vercel.app for daily current affairs gujarati questions and answers."
        }
      },
      {
        "@type": "Question",
        "name": "Best current affairs in Gujarati website 2026?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda is the best current affairs in Gujarati website for 2026. It provides daily current affairs questions and answers in Gujarati (કરંટ અફેર્સ ગુજરાતી) with interactive quizzes, detailed explanations, and live leaderboard for GPSC, GSSSB CCE, PSI, Constable, and Talati exam preparation."
        }
      },
      {
        "@type": "Question",
        "name": "Daily current affairs gujarati — free quiz available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! CurrentAdda provides completely free daily current affairs Gujarati quiz. New questions are added every day covering national, international, sports, economy, science and all major topics for Gujarat government competitive exams."
        }
      },
      {
        "@type": "Question",
        "name": "Current affairs 2026 questions and answers in Gujarati — GSSSB CCE?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda provides 2026 current affairs questions and answers in Gujarati specifically curated for GSSSB CCE 2026 (7338 vacancies). The CCE exam has 30 marks for Current Affairs in Prelims and 30 marks in Mains. Practice daily to score full marks."
        }
      },
      {
        "@type": "Question",
        "name": "Current affairs for GPSC in Gujarati — how to prepare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For GPSC current affairs preparation in Gujarati: 1) Practice daily quiz on CurrentAdda 2) Read detailed Gujarati explanations 3) Revise monthly compilations 4) Practice category-wise MCQs (Economy, Politics, Science, etc.) 5) Track your rank on the leaderboard. CurrentAdda covers all GPSC current affairs topics."
        }
      },
      {
        "@type": "Question",
        "name": "Current affairs MCQ in Gujarati — which app or website?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CurrentAdda provides the best current affairs MCQ in Gujarati. It is available both as a web app and PWA (installable on mobile). 10,000+ MCQs with Gujarati explanations for GPSC, GSSSB, PSI, Constable, and Talati exams — all free."
        }
      },
      {
        "@type": "Question",
        "name": "Is IndiaBix current affairs available in Gujarati?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! CurrentAdda provides IndiaBix current affairs in Gujarati — translated, simplified and with detailed Gujarati explanations. All IndiaBix daily MCQs are available on CurrentAdda for free practice."
        }
      },
      {
        "@type": "Question",
        "name": "Current affairs in Gujarati PDF 2026 — download free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Current affairs PDF in Gujarati 2026 is available via CurrentAdda's Telegram channel. The website also provides study mode for each quiz where you can read all questions and answers in a PDF-like format. Visit /daily/[date] for full text content."
        }
      }
    ]
  };

  // SSR keyword-rich content for Googlebot (hidden visually)
  const seoBlock = (
    <div className="sr-only" aria-hidden="false" role="main">
      <h1>Current Affairs in Gujarati 2026 — Best Daily Quiz &amp; Questions and Answers</h1>
      <p>
        Best Current Affairs in Gujarati 2026 (કરંટ અફેર્સ ગુજરાતી ૨૦૨૬) — CurrentAdda provides free daily current affairs questions and answers in Gujarati for GSSSB CCE 2026, GPSC Class 1-2, PSI, Police Constable, Talati cum Mantri and Bin Sachivalay exams.
      </p>
      <h2>Daily Current Affairs Gujarati — Questions &amp; Answers 2026</h2>
      <p>
        Practice daily current affairs gujarati MCQs with detailed explanations. Current affairs 2026 questions and answers in Gujarati updated daily. 10,000+ MCQs free for GPSC, GSSSB, PSI & all Gujarat government competitive exams.
      </p>
      <h2>Best Current Affairs in Gujarati for Competitive Exams</h2>
      <ul>
        <li>Current affairs in Gujarati for GPSC — Class 1-2 preparation</li>
        <li>GSSSB CCE current affairs Gujarati — 30 marks in Prelims & Mains</li>
        <li>Daily current affairs Gujarati quiz — updated every day</li>
        <li>Current affairs MCQ in Gujarati — 10,000+ practice questions</li>
        <li>IndiaBix current affairs in Gujarati — translated with explanations</li>
        <li>Current affairs PDF in Gujarati 2026 — available via Telegram</li>
        <li>Monthly current affairs Gujarati — January 2026, February 2026, March 2026</li>
      </ul>
      <h2>Current Affairs in Gujarati January 2026</h2>
      <p>January 2026 current affairs in Gujarati — practice all important events of January 2026 with MCQs and detailed Gujarati explanations on CurrentAdda.</p>
      <h2>CCE Current Affairs Gujarati</h2>
      <p>GSSSB CCE 2026 current affairs preparation in Gujarati. CCE exam has 30 marks for current affairs in both Prelims (150 marks) and Mains Group B (200 marks). Practice all CCE current affairs categories on CurrentAdda.</p>
    </div>
  );

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
      {seoBlock}
      <HomeClient initialQuizzes={initialQuizzes} />
    </>
  );
}
