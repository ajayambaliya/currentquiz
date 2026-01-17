import { chromium } from 'playwright';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (!fromDate || !toDate) {
        return NextResponse.json(
            { error: 'Both from and to dates are required' },
            { status: 400 }
        );
    }

    try {
        // Launch browser
        const browser = await chromium.launch({
            headless: true,
        });

        const context = await browser.newContext({
            viewport: { width: 1200, height: 1600 },
            deviceScaleFactor: 2, // High resolution for better quality
        });

        const page = await context.newPage();

        // Navigate to the print page
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const printUrl = `${baseUrl}/generate/${fromDate}/${toDate}`;

        await page.goto(printUrl, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        // Wait for content to load
        await page.waitForSelector('.print-container', { timeout: 10000 });

        // Generate PDF with modern settings
        const pdfBuffer = await page.pdf({
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

        await browser.close();

        // Return PDF as response (convert Buffer to Uint8Array for Next.js compatibility)
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="CurrentAdda_Quiz_${fromDate}_to_${toDate}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: (error as Error).message },
            { status: 500 }
        );
    }
}
