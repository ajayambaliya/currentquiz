# 🚀 Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd pdf-gen-app
npm install
```

### 2. Configure Environment
Your `.env.local` file is already configured with Supabase credentials.

### 3. Install Playwright Browsers
```bash
npx playwright install chromium
```

### 4. Start Development Server
```bash
npm run dev
```

Server will start on: `http://localhost:3001` (Port 3000 is used by currentadda-pwa)

---

## 🎯 Usage Options

### Option 1: Quick Test (Browser Print) ⚡

1. Open `http://localhost:3001`
2. Select date range (e.g., `2025-08-01` to `2025-08-14`)
3. Click **"Generate PDF Preview"**
4. New tab opens with beautiful print page
5. Press `Ctrl+P` (or `Cmd+P` on Mac)
6. **Important**: Check "Background graphics" ✅
7. Save as PDF

**Best for**: Testing designs, quick previews

---

### Option 2: Automated Download (API) 🤖

1. Edit `src/app/page.tsx`
2. **Uncomment lines 25-31** (the API fetch code)
3. Save the file
4. Open `http://localhost:3001`
5. Select date range
6. Click **"Generate PDF Preview"**
7. PDF downloads automatically!

**Code to uncomment:**
```typescript
// Uncomment below to auto-download PDF
const response = await fetch(`/api/generate-pdf?from=${fromDate}&to=${toDate}`);
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `CurrentAdda_Quiz_${fromDate}_${toDate}.pdf`;
a.click();
```

**Best for**: Production use, user downloads

---

### Option 3: CLI Generation (Batch) 📦

With dev server running, open a **NEW terminal**:

```bash
npm run generate-pdf -- --from 2025-08-01 --to 2025-08-14
```

PDF will be saved in the current directory as:
`CurrentAdda_Quiz_2025-08-01_to_2025-08-14.pdf`

**Generate multiple PDFs:**
```bash
# Weekly PDFs
npm run generate-pdf -- --from 2025-08-01 --to 2025-08-07
npm run generate-pdf -- --from 2025-08-08 --to 2025-08-14
npm run generate-pdf -- --from 2025-08-15 --to 2025-08-21

# Monthly PDF
npm run generate-pdf -- --from 2025-08-01 --to 2025-08-31
```

**Best for**: Automation, bulk generation, archives

---

## 📊 What's Included in the PDF?

### Promotional Pages (Always Included):
1. **Cover Page** - Branded intro with CurrentAdda logo
2. **About Page** - Platform description in Gujarati
3. **Features Page** - Benefits and features grid
4. **Promotional Page** - Testimonials + Telegram channel
5. **How It Works** - 3-step process
6. **Final CTA** - QR code and call-to-action

### Question Pages (Data-Driven):
1. **Type 1 Questions** (No Category) - Listed first in line format
2. **Type 2 Questions** (With Category) - Grouped by category:
   - 🏛️ Politics
   - ⚽ Sports
   - 🔬 Science
   - 💻 Technology
   - And more...

### Each Question Includes:
- ✅ Question text in Gujarati
- ✅ 4 answer options (A, B, C, D)
- ✅ Correct answer highlighted in green
- ✅ Detailed explanation
- ✅ Category icon and badge

---

## 🎨 Customization

### Change Branding/Content
Edit: `src/app/generate/[fromDate]/[toDate]/page.tsx`

**Examples:**
- Cover page headline: Line ~58
- About section: Lines 82-155
- Telegram link: Line 464
- Creator name: Line 473

### Change Colors
The default theme uses:
- **Primary**: Orange (#f97316)
- **Secondary**: Green
- **Accent**: Blue

To change, search and replace colors in the generate page.

### Add More Categories
Edit the category icons object (line ~281):
```typescript
const categoryIcons: Record<string, string> = {
  Politics: '🏛️',
  Sports: '⚽',
  YourNewCategory: '🎓', // Add here
};
```

---

## 🧪 Testing Tips

### Test with Small Dataset First
```bash
# Just 1 day of questions
npm run generate-pdf -- --from 2025-08-14 --to 2025-08-14
```

### Verify Gujarati Fonts
Open the print preview and check:
- ✅ Gujarati text renders correctly
- ✅ No boxes/squares (missing fonts)
- ✅ Proper spacing

### Check Page Breaks
Ensure questions don't get cut across pages

### Test Different Date Ranges
- 1 day (minimal)
- 1 week (normal)
- 1 month (large)

---

## 🐛 Common Issues

### "Port 3000 in use"
✅ **Solution**: App auto-switches to 3001 (already configured)

### "Module not found: playwright"
```bash
npm install playwright
npx playwright install chromium
```

### "Cannot find .env.local"
Your env is already copied. If missing:
```bash
cp .env.example .env.local
# Then edit and add your Supabase credentials
```

### Fonts not showing in PDF
Add wait time in `/api/generate-pdf/route.ts`:
```typescript
await page.waitForSelector('.print-container');
await page.waitForTimeout(2000); // Wait for fonts
```

### PDF generation times out
Increase timeout:
```typescript
await page.goto(printUrl, {
  waitUntil: 'networkidle',
  timeout: 90000, // 90 seconds
});
```

---

## 📁 Project Structure

```
pdf-gen-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main UI (date picker)
│   │   ├── api/
│   │   │   ├── questions/route.ts      # Fetch questions API
│   │   │   └── generate-pdf/route.ts   # PDF generation API
│   │   └── generate/[fromDate]/[toDate]/
│   │       └── page.tsx                # Print-ready template
│   └── lib/
│       ├── supabase.ts                 # Database client
│       └── types.ts                    # TypeScript types
├── scripts/
│   └── generate-pdf.ts                 # CLI script
├── supabase_schema.sql                 # Database schema
├── .env.local                          # Environment config
├── README.md                           # Full documentation
├── BEST_APPROACHES.md                  # Strategy guide
└── QUICKSTART.md                       # This file!
```

---

## 🚀 Next Steps

1. ✅ **Test it now**:
   ```bash
   # Open in browser
   http://localhost:3001
   
   # Select dates and generate!
   ```

2. 📖 **Read detailed docs**:
   - `README.md` - Full documentation
   - `BEST_APPROACHES.md` - Strategy guide

3. 🎨 **Customize**:
   - Update branding
   - Add your logo
   - Modify colors

4. 🚀 **Deploy**:
   - Push to GitHub
   - Deploy to Vercel
   - Update `NEXT_PUBLIC_BASE_URL`

---

## 💡 Pro Tips

### For Best Quality PDFs:
1. Use **Option 2 (API)** in production
2. Test with **Option 1** during development
3. Pre-generate PDFs with **Option 3** for archives

### For Gujarati Content:
1. Always use `Noto Sans Gujarati` font
2. Test font rendering before finalizing
3. Set `printBackground: true` for colored boxes

### For Performance:
1. Limit to 200 questions per PDF
2. Cache generated PDFs if reusing
3. Use parallel generation for bulk

---

**You're all set! Start generating beautiful PDFs! 📄✨**

Need help? Check `BEST_APPROACHES.md` for detailed strategies.
