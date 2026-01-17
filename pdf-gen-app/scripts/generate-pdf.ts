import { chromium } from 'playwright';
import path from 'path';

/**
 * Standalone script to generate PDF from command line
 * Usage: npm run generate-pdf -- --from 2025-08-01 --to 2025-08-14
 */

async function generatePDF() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const fromIndex = args.indexOf('--from');
    const toIndex = args.indexOf('--to');

    if (fromIndex === -1 || toIndex === -1) {
        console.error('❌ Please provide start and end dates using --from and --to arguments');
        process.exit(1);
    }

    const fromDate = args[fromIndex + 1];
    const toDate = args[toIndex + 1];

    if (!fromDate || !toDate) {
        console.error('❌ Both dates are required');
        process.exit(1);
    }

    console.log(`🚀 Starting PDF generation for ${fromDate} to ${toDate}...`);

    try {
        // Launch browser
        console.log('📱 Launching browser...');
        const browser = await chromium.launch();

        const context = await browser.newContext();

        const page = await context.newPage();

        // Navigate to print page
        // Use port 3001 as default since 3000 is occupied by the main app
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
        const printUrl = `${baseUrl}/generate/${fromDate}/${toDate}`;

        console.log(`🔗 Loading page: ${printUrl}`);

        // Define output path early
        const fileName = `CurrentAdda_Quiz_${fromDate}_to_${toDate}.pdf`;
        const outputPath = path.resolve(process.cwd(), fileName);

        try {
            const response = await page.goto(printUrl, {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            console.log(`📡 Response status: ${response?.status()} ${response?.statusText()}`);

            if (response && response.status() !== 200) {
                console.error(`❌ Page failed to load with status: ${response.status()}`);
                // Capture screenshot for debugging
                await page.screenshot({ path: 'error-debug.png' });
                throw new Error(`Page load failed with status ${response.status()}`);
            }

            console.log('⏳ Waiting for content to render...');
            await page.waitForSelector('.print-container', { timeout: 60000 });

            // Allow extra time for fonts and images
            await page.waitForTimeout(2000);

            console.log('✨ Generating PDF...');
            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm',
                },
                preferCSSPageSize: true,
            });

            console.log(`✅ PDF successfully generated at: ${outputPath}`);

        } catch (error) {
            console.error('❌ Error during page processing:', error);
            await page.screenshot({ path: 'error-final.png' });
            throw error;
        }

        await browser.close();

        return fileName;
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
        process.exit(1);
    }
}

generatePDF()
    .then(() => {
        console.log('🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
    });
