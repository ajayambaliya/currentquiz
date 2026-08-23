import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';
import StructuredData from '@/components/StructuredData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gujarati Current Affairs 2026 | GPSC, GSSSB & Talati',
  description: 'GPSC, GSSSB CCE, PSI અને તલાટી પરીક્ષા માટે દરરોજ ફ્રી ગુજરાતી કરંટ અફેર્સ ક્વિઝ અને નોટ્સ. 10,000+ MCQs સાથે લાઇવ લીડરબોર્ડ અને મોક ટેસ્ટ વડે સ્કોર વધારો.',
  alternates: {
    canonical: 'https://currentadda.vercel.app',
  },
  openGraph: {
    title: 'Gujarati Current Affairs 2026 | GPSC, GSSSB & Talati',
    description: 'GPSC, GSSSB CCE, PSI અને તલાટી પરીક્ષા માટે દરરોજ ફ્રી ગુજરાતી કરંટ અફેર્સ ક્વિઝ અને નોટ્સ.',
    url: 'https://currentadda.vercel.app',
    siteName: 'CurrentAdda',
    locale: 'gu_IN',
    type: 'website',
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 43200;

export default async function HomePage() {
  let initialQuizzes: any[] = [];

  try {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('quiz_date', { ascending: false })
      .range(0, 9);

    if (data) {
      initialQuizzes = data;
    }
  } catch (error) {
    console.error('Error fetching initial quizzes on server:', error);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://currentadda.vercel.app/#website",
    "name": "CurrentAdda",
    "url": "https://currentadda.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://currentadda.vercel.app/?s={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://currentadda.vercel.app/#organization",
    "name": "CurrentAdda",
    "url": "https://currentadda.vercel.app",
    "logo": "https://currentadda.vercel.app/newlogo.png",
    "sameAs": [
      "https://t.me/currentadda"
    ],
    "founder": {
      "@id": "https://currentadda.vercel.app/#author"
    }
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://currentadda.vercel.app/#author",
    "name": "Ajay Ambaliya",
    "jobTitle": "Founder & Educator",
    "url": "https://currentadda.vercel.app/author",
    "worksFor": {
      "@id": "https://currentadda.vercel.app/#organization"
    },
    "sameAs": [
      "https://t.me/currentadda"
    ]
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://currentadda.vercel.app/#app",
    "name": "CurrentAdda - Daily Gujarati Current Affairs Quiz",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://currentadda.vercel.app/#breadcrumb",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://currentadda.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Current Affairs in Gujarati",
        "item": "https://currentadda.vercel.app/current-affairs-in-gujarati"
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://currentadda.vercel.app/#webpage",
    "url": "https://currentadda.vercel.app",
    "name": "Gujarati Current Affairs 2026 | GPSC, GSSSB & Talati",
    "isPartOf": {
      "@id": "https://currentadda.vercel.app/#website"
    },
    "author": {
      "@id": "https://currentadda.vercel.app/#author"
    },
    "publisher": {
      "@id": "https://currentadda.vercel.app/#organization"
    },
    "reviewedBy": {
      "@id": "https://currentadda.vercel.app/#author"
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

  return (
    <>
      <StructuredData
        data={[
          websiteSchema,
          organizationSchema,
          personSchema,
          webAppSchema,
          breadcrumbSchema,
          webPageSchema,
          navigationSchema,
          faqSchema
        ]}
      />
      <HomeClient initialQuizzes={initialQuizzes} />
    </>
  );
}
