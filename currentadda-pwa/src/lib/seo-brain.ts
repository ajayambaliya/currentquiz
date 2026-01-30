/**
 * SEO Brain Utility
 * Generates high-intent search content and metadata dynamically.
 */

export interface SeoDataInput {
    title: string;
    slug?: string;
    date?: string;
    source_url?: string;
    category?: string;
    questions?: any[];
}

const SOURCE_MAPPING: Record<string, string> = {
    'indiabix': 'IndiaBix (National Authority)',
    'gktoday': 'GKToday',
    'jagranjosh': 'Jagran Josh',
    'pib': 'PIB (Government of India)',
    'deshgujarat': 'DeshGujarat',
};

const GUJARATI_MONTHS: Record<string, string> = {
    'January': 'જાન્યુઆરી',
    'February': 'ફેબ્રુઆરી',
    'March': 'માર્ચ',
    'April': 'એપ્રિલ',
    'May': 'મે',
    'June': 'જૂન',
    'July': 'જુલાઈ',
    'August': 'ઓગસ્ટ',
    'September': 'સપ્ટેમ્બર',
    'October': 'ઓક્ટોબર',
    'November': 'નવેમ્બર',
    'December': 'ડિસેમ્બર',
};

export function generateSeoContent(data: SeoDataInput) {
    const { title, slug, date, source_url, category, questions } = data;

    // 1. Source Detection
    let sourceName = 'Official Resources';
    if (source_url) {
        const domain = new URL(source_url).hostname.replace('www.', '').split('.')[0];
        sourceName = SOURCE_MAPPING[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
    } else if (slug?.includes('indiabix')) {
        sourceName = 'IndiaBix';
    }

    // 2. Date Localization
    let gujaratiDateText = '';
    if (date) {
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'long' });
        const year = dateObj.getFullYear();
        gujaratiDateText = `${day} ${GUJARATI_MONTHS[month] || month} ${year}`;
    }

    // 3. Narrative Generation (The "Why it ranks")
    const sentences = [
        `Looking for ${title} MCQs in Gujarati?`,
        `CurrentAdda presents a high-authority mock test based on ${sourceName} for competitive Gujarat government exams.`,
        date ? `This daily quiz for ${date} (${gujaratiDateText}) covers all major events of the day.` : '',
        `Prepare effectively for GPSC Class 1-2, GSSSB Bin Sachivalay, Talati, and Police Bharti exams with our targeted practice questions.`,
        questions && questions.length > 0 ? `This set contains ${questions.length} questions with deep-dive explanations in Gujarati (કરંટ અફેર્સ ગુજરાતી).` : ''
    ].filter(Boolean);

    // 4. Keyword Clusters (The "What it ranks for")
    const keywords = [
        `Daily Current Affairs Gujarati ${new Date().getFullYear()}`,
        `${category} Mock Test`,
        `${title} Answers`,
        `GPSC Question Bank`,
        `GSSSB Practice Sets`,
        `Police Bharti Preparation Gujarati`,
        `IndiaBix Gujarati Translation`,
        `Today's News Analysis for Exams`
    ];

    return {
        description: sentences.join(' '),
        keywords: keywords.join(', '),
        narrativeHtml: sentences.map(s => `<p>${s}</p>`).join(''),
        sourceName,
        gujaratiDateText
    };
}
