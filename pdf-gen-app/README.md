# CurrentAdda PDF Generator

A modern PDF generation system for **CurrentAdda** quiz questions with beautiful promotional content.

## 🚀 Features

- **Date Range Selection**: Select custom date ranges to fetch questions
- **Smart Question Organization**: 
  - Type 1 questions (no category) displayed first
  - Type 2 questions organized by category (Politics, Sports, Science, Technology)
- **Beautiful PDF Design**: Modern, attractive layout with Gujarati typography
- **Promotional Content**: Includes cover page, about section, features, testimonials, and CTA pages
- **Playwright-Powered**: Generates high-quality PDFs using Playwright for modern rendering

## 📦 Tech Stack

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database)
- **Playwright** (PDF Generation)

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Install Playwright Browsers**:
   ```bash
   npx playwright install chromium
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**:
   Navigate to `http://localhost:3000`

## 📖 How to Use

### Method 1: Preview in Browser (Recommended for Testing)
1. Select **From Date** and **To Date**
2. Click **"Generate PDF Preview"**
3. A new tab opens with the print-ready page
4. Use browser's Print function (Ctrl+P) to save as PDF

### Method 2: Auto-Generate PDF (API)
1. Uncomment the API call in `src/app/page.tsx` (lines 25-31)
2. Select date range and click generate
3. PDF downloads automatically

### Method 3: Direct API Call
```bash
curl "http://localhost:3000/api/generate-pdf?from=2025-08-01&to=2025-08-14" --output quiz.pdf
```

## 📄 PDF Structure

1. **Cover Page** - Eye-catching branded intro
2. **About Page** - Platform introduction in Gujarati
3. **Question Pages** - All questions with explanations
   - Type 1 questions (no category) first
   - Type 2 questions grouped by category
4. **Features Page** - Platform benefits
5. **Promotional Page** - Testimonials and comparison
6. **How It Works** - Step-by-step guide
7. **Final CTA** - Call-to-action with QR code

## 🎨 Design Features

- ✅ Modern Gujarati typography (Noto Sans Gujarati)
- ✅ Vibrant color scheme (Orange, Green, Blue)
- ✅ Category-wise color coding
- ✅ Beautiful gradient backgrounds
- ✅ Print-optimized A4 layout
- ✅ Professional footer on every page

## 📱 Question Types

### Type 1 (No Category)
Questions without a category field - displayed in chronological order

### Type 2 (With Category)
Questions grouped by category:
- 🏛️ Politics
- ⚽ Sports
- 🔬 Science
- 💻 Technology
- 💰 Economy
- 🌍 Environment

## 🔧 Customization

### Change Branding
Edit promotional content in `src/app/generate/[fromDate]/[toDate]/page.tsx`:
- Cover page headline
- About section text
- Features list
- Telegram link
- Creator info

### Modify PDF Layout
Adjust CSS in the same file:
- Page dimensions (default: 210mm x 297mm A4)
- Colors and gradients
- Typography sizes
- Spacing and margins

### Add More Promotional Pages
Insert new page components between existing pages in the generate page component.

## 🚀 Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard
4. **Update `NEXT_PUBLIC_BASE_URL`** to your production URL

### Playwright in Production

Vercel automatically installs Playwright browsers. No extra configuration needed!

## 📊 Database Schema

Uses the existing CurrentAdda schema:
- `quizzes` - Quiz metadata
- `questions` - Quiz questions with options and explanations

## 🤝 Best Practices

1. **Always test print preview** before generating final PDF
2. **Use date ranges wisely** - too many questions may create large PDFs
3. **Check question count** - optimal is 50-200 questions per PDF
4. **Preview on different screens** - ensure responsive design works

## 📞 Support

Created by **Ajay Ambaliya** for CurrentAdda

- 🌐 Website: currentadda.vercel.app
- 📱 Telegram: t.me/currentadda

---

**Happy PDF Generation! 📄✨**
