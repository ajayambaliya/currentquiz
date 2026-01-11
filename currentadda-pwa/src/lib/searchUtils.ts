
import { startOfDay, endOfDay, setYear } from 'date-fns';

const GUJARATI_MONTHS: Record<string, string> = {
    'જાન્યુઆરી': 'January',
    'ફેબ્રુઆરી': 'February',
    'માર્ચ': 'March',
    'એપ્રિલ': 'April',
    'મે': 'May',
    'જૂન': 'June',
    'જુલાઈ': 'July',
    'ઓગસ્ટ': 'August',
    'સપ્ટેમ્બર': 'September',
    'ઓક્ટોબર': 'October',
    'નવેમ્બર': 'November',
    'ડિસેમ્બર': 'December'
};

const GUJARATI_DIGITS: Record<string, string> = {
    '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
    '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9'
};

export function parseSearchDate(input: string): { start: string, end: string } | null {
    if (!input) return null;

    let cleaned = input.toLowerCase().trim();

    // 1. Replace Gujarati Digits
    cleaned = cleaned.replace(/[૦-૯]/g, (match) => GUJARATI_DIGITS[match] || match);

    // 2. Replace Gujarati Months
    Object.entries(GUJARATI_MONTHS).forEach(([guj, eng]) => {
        cleaned = cleaned.replace(new RegExp(guj, 'g'), eng.toLowerCase());
    });

    // 3. Remove common filler words and suffixes
    cleaned = cleaned.replace(/(date|dated|tારીખ|તારીખ|ના રોજ|મહિનાની|મી|th|nd|st|rd|of|on|,)/g, ' ');

    // 4. Normalize spaces/separators
    cleaned = cleaned.replace(/[\/\-\.]/g, ' ').replace(/\s+/g, ' ').trim();

    let dateObj: Date | null = null;

    // Pattern 1: DD MM YYYY or DD MM YY (e.g. 26 12 2025, 26 12 25)
    // We converted separators to spaces above
    const numberDateMatch = cleaned.match(/^(\d{1,2})\s(\d{1,2})\s(\d{2,4})$/);

    if (numberDateMatch) {
        const day = parseInt(numberDateMatch[1]);
        const month = parseInt(numberDateMatch[2]) - 1; // 0-indexed
        let year = parseInt(numberDateMatch[3]);
        if (year < 100) year += 2000;

        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) dateObj = d;
    }

    // Pattern 2: DD MM (without year) -> e.g. 26 12
    else if (/^(\d{1,2})\s(\d{1,2})$/.test(cleaned)) {
        const parts = cleaned.match(/^(\d{1,2})\s(\d{1,2})$/);
        if (parts) {
            const day = parseInt(parts[1]);
            const month = parseInt(parts[2]) - 1;
            const now = new Date();
            // Default to current year
            dateObj = new Date(now.getFullYear(), month, day);
        }
    }

    // Pattern A: Text formats rely on Date.parse
    // "26 december 2025" or "december 26 2025" or "26 december"
    if (!dateObj) {
        // If it looks like a year is present
        if (/\d{4}/.test(cleaned) || /\d{2}\s\w+$/.test(cleaned)) { // 26 dec 25 handled by date parse usually if well formed
            const attempt = new Date(cleaned);
            if (!isNaN(attempt.getTime())) dateObj = attempt;
        } else {
            // No year, append current year
            const attempt = new Date(`${cleaned} ${new Date().getFullYear()}`);
            if (!isNaN(attempt.getTime())) dateObj = attempt;
        }
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
        return {
            start: startOfDay(dateObj).toISOString(),
            end: endOfDay(dateObj).toISOString()
        };
    }

    return null;
}
