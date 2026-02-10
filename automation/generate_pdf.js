const playwright = require('playwright');
const path = require('path');

async function generatePDF() {
    const htmlPath = process.argv[2];
    const pdfPath = process.argv[3];

    if (!htmlPath || !pdfPath) {
        console.error('Usage: node generate_pdf.js <htmlPath> <pdfPath>');
        process.exit(1);
    }

    console.log(`Generating PDF from ${htmlPath} to ${pdfPath}...`);

    let browser;
    try {
        browser = await playwright.chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=none',
            ]
        });

        const page = await browser.newPage();

        // Convert relative path to absolute file URL
        const absoluteHtmlPath = path.resolve(htmlPath);
        const htmlUrl = `file://${absoluteHtmlPath}`;

        console.log(`Loading URL: ${htmlUrl}`);

        // Wait for page load
        // 'load' is more reliable than 'networkidle' which can hang on CDNs/Fonts
        await page.goto(htmlUrl, {
            waitUntil: 'load',
            timeout: 60000
        });

        // Additional wait for fonts and Tailwind to settle
        await page.waitForTimeout(3000);

        console.log('Rendering PDF...');
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: true
        });

        console.log(`✓ PDF generated successfully: ${pdfPath}`);
    } catch (error) {
        console.error(`✗ PDF Generation failed: ${error.stack || error.message}`);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

generatePDF().catch(err => {
    console.error(`✗ Fatal error: ${err.stack || err.message}`);
    process.exit(1);
});
