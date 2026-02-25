# 🚀 SEO IMPLEMENTATION PLAN: CurrentAdda

**Target Keyword:** `current affairs in Gujarati`
**Objective:** Rank #1 on Google by building a robust SEO landing structure, improving crawlability, and establishing topical authority.

This document outlines the step-by-step technical plan to implement the requested SEO and engagement features in your Next.js App Router codebase.

---

## 1️⃣ CREATE SEO LANDING STRUCTURE (Pillar Page)

**Path:** `src/app/current-affairs-in-gujarati/page.tsx`

**Implementation Details:**
- **Route Setup:** Create a new folder `current-affairs-in-gujarati` in `src/app` with a `page.tsx` file.
- **Metadata API:** Use Next.js `generateMetadata` or a static `metadata` object to set the exact Title, Meta Description, and Canonical URL.
- **Content Structure:**
  - Build a responsive layout using your existing Tailwind setup.
  - **H1 Tag:** Use exactly "Current Affairs in Gujarati – Complete Preparation Hub".
  - **Intro text:** Include LSI keywords ("Gujarati current affairs", "GPSC current affairs Gujarati").
  - **Sections:** Architect separate components for "Latest Month", "Monthly Archives (Grid)", "Subject-wise", and "Download PDFs".
  - **Internal Linking:** Add contextual links to `/subjects`, `/categories`, and latest daily quizzes from `supabase` queries.
- **Data Fetching:** Fetch latest quizzes/months from Supabase using `createClient` on the server component.

---

## 2️⃣ CREATE MONTHLY SEO TEMPLATE

**Path:** `src/app/current-affairs/[year]/[month]-gujarati/page.tsx`

**Implementation Details:**
- **Dynamic Routing:** Create nested structure: `src/app/current-affairs/[year]/[month]-gujarati/page.tsx`.
- **generateStaticParams:** Use this Next.js function to pre-render all available year/month combinations at build time (fetching distinct months from Supabase).
- **Dynamic Metadata:** Implement `generateMetadata({ params })` to inject the dynamic year and month into the Title, Description, and H1 tags.
- **Page Layout:** 
  - Render a Breadcrumb component (e.g., using your existing `src/components/Breadcrumbs.tsx`).
  - Render the 300-600 word summary, subject-wise sections, and 20-50 MCQ mapping.
  - Include navigation buttons for "Previous Month" and "Next Month".
- **Database:** Ensure your Supabase schema or edge functions can aggregate monthly data efficiently.

---

## 3️⃣ STRUCTURED DATA (JSON-LD)

**Implementation Details:**
- **Article Schema:** In the monthly server component (`[month]-gujarati/page.tsx`), generate the JSON-LD payload dynamically and inject it into a `<script type="application/ld+json">` tag.
- **FAQ Schema:** Add an FAQ schema specifically for questions like "How to prepare current affairs for GPSC?".
- **BreadcrumbList Schema:** Update the `Breadcrumbs.tsx` component or add a script tag on the page level to output `BreadcrumbList` valid schema.

---

## 4️⃣ TECHNICAL SEO FIXES

**Implementation Details:**
- **SSR / SSG:** Since you are using `app/` router with server components by default, ensure data fetches use standard `fetch` caching (or Route Segment Config like `export const revalidate = 3600`) to guarantee fast HTML delivery.
- **Canonical URLs:** Ensure the `metadata.alternates.canonical` field is populated dynamically for all pages.
- **Sitemap Generator:** Update `src/app/sitemap.ts` to query and include all `/current-affairs/[year]/[month]-gujarati` and `/current-affairs-in-gujarati` routes.
- **Robots.txt:** Update `src/app/robots.ts` to point to `https://currentadda.vercel.app/sitemap.xml`.
- **OpenGraph/Twitter:** Extend the Next.js `metadata` object on all pages to include `openGraph` and `twitter` properties.

---

## 5️⃣ INTERNAL LINKING RULES

**Implementation Details:**
- **Homepage (`src/app/page.tsx`):** Add a visual block showcasing the "Latest 3 Months" which links directly to the dynamic monthly pages.
- **Monthly Pages:** In the aside or footer of the monthly layout, query Supabase for the 3 most recent months and render links. Add inline links to the main pillar page inside the intro paragraph.

---

## 6️⃣ PERFORMANCE OPTIMIZATION

**Implementation Details:**
- **Pre-rendering:** As mentioned, `generateStaticParams` will statically generate these pages.
- **Image Optimization:** Use Next.js `<Image />` component with `loading="lazy"` (default) for all media.
- **Script Optimization:** Use Next.js `<Script strategy="lazyOnload">` for non-critical scripts (e.g., third-party quiz embeds, Telegram scripts).
- **Core Web Vitals:** Ensure UI components don't cause layout shifts (CLS) by providing explicit height/width constraints for ad spaces or dynamic content.

---

## 7️⃣ CONTENT AUTHORITY EXPANSION

**Implementation Details:**
- **Database Architecture:** You may need to seed the `quizzes` or a new `monthly_compilations` table in Supabase with data for 2024, 2025, and 2026.
- **Route Archiving:** Implement pagination or infinite scroll on the main pillar page to ensure older months are crawlable by Googlebot without a massive DOM tree.

---

## 8️⃣ ADD DOWNLOADABLE PDF SYSTEM

**Implementation Details:**
- **Storage:** Host PDFs in a Supabase Storage bucket (e.g., `pdfs`).
- **Path structure:** Upload files named natively `current-affairs-[month]-[year]-gujarati.pdf`.
- **Download CTA:** Create a highlighted button component in the monthly template linking directly to the public URL of the Supabase storage object. Include `download` attribute.

---

## 9️⃣ ENGAGEMENT FEATURES

**Implementation Details:**
- **Monthly Leaderboard:** Extend your existing `/leaderboard` (or create a new tab) to query scores filtered by month.
- **Quiz Retake:** Update user state in Supabase (`profiles` or `user_scores` table) to reset attempts or just allow non-recording attempts dynamically.
- **Email Subscriptions:** Integrate Resend or Mailchimp. Create an API route `src/app/api/subscribe/route.ts` to capture emails.
- **Telegram Share:** Implement a `ShareButtons.tsx` component using basic URL sharing parameters (`https://t.me/share/url?url=...`).

---

## 🔟 GOOGLE SEARCH CONSOLE INTEGRATION

**Post-Deployment Checklist:**
1. Redeploy to Vercel stringently.
2. In Google Search Console, submit `https://currentadda.vercel.app/sitemap.xml`.
3. Use the URL Inspection tool to manually request indexing for `/current-affairs-in-gujarati`.

---

**Next Steps:**
When you're ready to start building, we can execute these step-by-step. The best order of operation is:
1. Build the Database queries / API layer for fetching monthly aggregations.
2. Build the Main Pillar Page (`/current-affairs-in-gujarati`).
3. Build the Dynamic Monthly Router (`/current-affairs/[year]/[month]-gujarati`).
4. Update `sitemap.ts` and add Schemas.
