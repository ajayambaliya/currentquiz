import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | CurrentAdda',
  description: 'The page you are looking for does not exist. Return to CurrentAdda for Daily Current Affairs in Gujarati.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        {/* Big 404 */}
        <div className="relative">
          <div className="text-[8rem] font-black text-slate-100 leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900">Page Not Found</h1>
          <p className="text-slate-500 font-medium">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <p className="text-slate-400 text-sm font-medium gujarati-text">
            આ પેજ અસ્તિત્વ ધરાવતો નથી.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
          >
            Go to Home
          </Link>
          <Link
            href="/categories"
            className="w-full bg-indigo-50 text-indigo-600 font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-indigo-100 transition-all"
          >
            Browse Categories
          </Link>
        </div>
      </div>
    </main>
  );
}
