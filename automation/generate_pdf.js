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

    const browser = await playwright.chromium.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        // Convert relative path to absolute file URL
        const absoluteHtmlPath = path.resolve(htmlPath);
        const htmlUrl = `file://${absoluteHtmlPath}`;

        console.log(`Loading URL: ${htmlUrl}`);

        // Wait for network to be idle to ensure fonts/images are loaded
        await page.goto(htmlUrl, {
            waitUntil: 'networkidle',
            timeout: 60000
        });

        // Final wait for any late renders
        await page.waitForTimeout(2000);

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
            }
        });

        console.log(`✓ PDF generated successfully: ${pdfPath}`);
    } catch (error) {
        console.error(`✗ PDF Generation failed: ${error.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

generatePDF().catch(err => {
    console.error(`✗ Fatal error: ${err.message}`);
    process.exit(1);
});
