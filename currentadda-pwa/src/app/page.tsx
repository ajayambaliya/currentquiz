import { createClient } from '@supabase/supabase-js';
import HomeClient from '@/components/HomeClient';

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

  return <HomeClient initialQuizzes={initialQuizzes} />;
}
